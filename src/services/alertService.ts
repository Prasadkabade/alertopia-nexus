import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertInsert, AlertUpdate, Profile, UserAlertPreference, Analytics } from "../types/database";

class AlertService {
  // Create new alert
  async createAlert(alertData: AlertInsert): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update alert
  async updateAlert(alertId: string, updates: AlertUpdate): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all alerts (admin view)
  async getAllAlerts(filters?: {
    severity?: string;
    status?: 'active' | 'expired' | 'archived';
    audience?: 'org' | 'team' | 'user';
  }): Promise<Alert[]> {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.status) {
      const now = new Date().toISOString();
      switch (filters.status) {
        case 'active':
          query = query
            .eq('archived', false)
            .lte('start_time', now)
            .gte('expiry_time', now);
          break;
        case 'expired':
          query = query
            .eq('archived', false)
            .lt('expiry_time', now);
          break;
        case 'archived':
          query = query.eq('archived', true);
          break;
      }
    }

    if (filters?.audience) {
      switch (filters.audience) {
        case 'org':
          query = query.eq('visibility_org', true);
          break;
        case 'team':
          query = query.not('visibility_teams', 'eq', '{}');
          break;
        case 'user':
          query = query.not('visibility_users', 'eq', '{}');
          break;
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Get alerts for specific user
  async getAlertsForUser(userId: string): Promise<Alert[]> {
    // First get user profile to check team
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    const now = new Date().toISOString();

    // Get alerts based on visibility rules
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('archived', false)
      .lte('start_time', now)
      .gte('expiry_time', now)
      .or(`visibility_org.eq.true,visibility_teams.cs.{${profile.team_id}},visibility_users.cs.{${userId}}`);

    if (error) throw error;
    return data || [];
  }

  // Get user alert preferences
  async getUserAlertPreferences(userId: string, alertId?: string): Promise<UserAlertPreference[]> {
    let query = supabase
      .from('user_alert_preferences')
      .select('*')
      .eq('user_id', userId);

    if (alertId) {
      query = query.eq('alert_id', alertId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Update user alert preference
  async updateUserAlertPreference(
    userId: string, 
    alertId: string, 
    updates: Partial<UserAlertPreference>
  ): Promise<UserAlertPreference> {
    const { data, error } = await supabase
      .from('user_alert_preferences')
      .upsert({
        user_id: userId,
        alert_id: alertId,
        ...updates,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Snooze alert for current day
  async snoozeAlert(userId: string, alertId: string): Promise<UserAlertPreference> {
    const today = new Date().toISOString().split('T')[0];
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.updateUserAlertPreference(userId, alertId, {
      snoozed_until: endOfDay.toISOString(),
      last_snoozed_day: today,
    });
  }

  // Mark alert as read/unread
  async markAlertAsRead(userId: string, alertId: string, read: boolean = true): Promise<UserAlertPreference> {
    return this.updateUserAlertPreference(userId, alertId, { read });
  }

  // Get analytics data
  async getAnalytics(): Promise<Analytics> {
    // Get total alerts created
    const { count: totalAlertsCreated } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true });

    // Get active alerts
    const now = new Date().toISOString();
    const { count: alertsActive } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('archived', false)
      .lte('start_time', now)
      .gte('expiry_time', now);

    // Get delivery count
    const { count: deliveredCount } = await supabase
      .from('notification_deliveries')
      .select('*', { count: 'exact', head: true });

    // Get read count
    const { count: readCount } = await supabase
      .from('user_alert_preferences')
      .select('*', { count: 'exact', head: true })
      .eq('read', true);

    // Get severity breakdown
    const { data: severityData } = await supabase
      .from('alerts')
      .select('severity')
      .eq('archived', false);

    const severityBreakdown = (severityData || []).reduce((acc, alert) => {
      acc[alert.severity as keyof typeof acc] = (acc[alert.severity as keyof typeof acc] || 0) + 1;
      return acc;
    }, { Info: 0, Warning: 0, Critical: 0 });

    // Get snooze counts per alert
    const { data: snoozeData } = await supabase
      .from('user_alert_preferences')
      .select('alert_id')
      .not('snoozed_until', 'is', null);

    const snoozeCountsPerAlert = (snoozeData || []).reduce((acc, pref) => {
      acc[pref.alert_id] = (acc[pref.alert_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAlertsCreated: totalAlertsCreated || 0,
      alertsActive: alertsActive || 0,
      deliveredCount: deliveredCount || 0,
      readCount: readCount || 0,
      snoozeCountsPerAlert,
      severityBreakdown,
    };
  }

  // Subscribe to real-time alert updates
  subscribeToAlerts(callback: (payload: any) => void) {
    return supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        callback
      )
      .subscribe();
  }

  // Subscribe to real-time notification deliveries
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_deliveries',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}

export const alertService = new AlertService();