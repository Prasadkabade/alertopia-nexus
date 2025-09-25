import { Alert, User, UserAlertPreference, AlertSeverity } from '../types/alert';
import { mockAlerts, mockUsers, mockUserAlertPreferences, mockTeams } from './mockData';

class AlertService {
  private alerts: Alert[] = [...mockAlerts];
  private userAlertPreferences: UserAlertPreference[] = [...mockUserAlertPreferences];

  // Get alerts visible to a specific user
  getAlertsForUser(userId: string): Alert[] {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];

    return this.alerts.filter(alert => {
      if (alert.archived) return false;
      
      // Check if alert is still active
      const now = new Date();
      const startTime = new Date(alert.startTime);
      const expiryTime = new Date(alert.expiryTime);
      
      if (now < startTime || now > expiryTime) return false;

      // Check visibility
      if (alert.visibility.org) return true;
      if (alert.visibility.teams.includes(user.teamId)) return true;
      if (alert.visibility.users.includes(userId)) return true;
      
      return false;
    });
  }

  // Get all alerts (admin view)
  getAllAlerts(filters?: {
    severity?: AlertSeverity;
    status?: 'active' | 'expired' | 'archived';
    audience?: 'org' | 'team' | 'user';
  }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filters?.severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
    }

    if (filters?.status) {
      const now = new Date();
      filteredAlerts = filteredAlerts.filter(alert => {
        const startTime = new Date(alert.startTime);
        const expiryTime = new Date(alert.expiryTime);
        
        switch (filters.status) {
          case 'active':
            return !alert.archived && now >= startTime && now <= expiryTime;
          case 'expired':
            return !alert.archived && now > expiryTime;
          case 'archived':
            return alert.archived;
          default:
            return true;
        }
      });
    }

    if (filters?.audience) {
      filteredAlerts = filteredAlerts.filter(alert => {
        switch (filters.audience) {
          case 'org':
            return alert.visibility.org;
          case 'team':
            return alert.visibility.teams.length > 0;
          case 'user':
            return alert.visibility.users.length > 0;
          default:
            return true;
        }
      });
    }

    return filteredAlerts;
  }

  // Create new alert
  createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Alert {
    const now = new Date().toISOString();
    const newAlert: Alert = {
      ...alertData,
      id: `a${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.alerts.push(newAlert);
    return newAlert;
  }

  // Update alert
  updateAlert(alertId: string, updates: Partial<Alert>): Alert | null {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return null;

    this.alerts[alertIndex] = {
      ...this.alerts[alertIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.alerts[alertIndex];
  }

  // Get user preferences for alerts
  getUserAlertPreferences(userId: string, alertId?: string): UserAlertPreference[] {
    return this.userAlertPreferences.filter(pref => {
      if (pref.userId !== userId) return false;
      if (alertId && pref.alertId !== alertId) return false;
      return true;
    });
  }

  // Update user alert preference
  updateUserAlertPreference(userId: string, alertId: string, updates: Partial<UserAlertPreference>): UserAlertPreference {
    let preference = this.userAlertPreferences.find(p => p.userId === userId && p.alertId === alertId);
    
    if (!preference) {
      preference = {
        id: `p${Date.now()}`,
        alertId,
        userId,
        read: false,
        snoozedUntil: null,
        lastSnoozedDay: null
      };
      this.userAlertPreferences.push(preference);
    }

    Object.assign(preference, updates);
    return preference;
  }

  // Snooze alert for current day
  snoozeAlert(userId: string, alertId: string): UserAlertPreference {
    const today = new Date().toISOString().split('T')[0];
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.updateUserAlertPreference(userId, alertId, {
      snoozedUntil: endOfDay.toISOString(),
      lastSnoozedDay: today
    });
  }

  // Mark alert as read/unread
  markAlertAsRead(userId: string, alertId: string, read: boolean = true): UserAlertPreference {
    return this.updateUserAlertPreference(userId, alertId, { read });
  }
}

export const alertService = new AlertService();