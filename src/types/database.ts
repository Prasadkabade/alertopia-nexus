import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Alert = Database['public']['Tables']['alerts']['Row'];
export type AlertInsert = Database['public']['Tables']['alerts']['Insert'];
export type AlertUpdate = Database['public']['Tables']['alerts']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type NotificationDelivery = Database['public']['Tables']['notification_deliveries']['Row'];
export type UserAlertPreference = Database['public']['Tables']['user_alert_preferences']['Row'];

export type AlertSeverity = 'Info' | 'Warning' | 'Critical';
export type UserRole = 'user' | 'admin';

export interface AlertWithExtras extends Alert {
  profiles?: Profile;
  teams?: Team[];
  user_alert_preferences?: UserAlertPreference[];
  notification_deliveries?: NotificationDelivery[];
}

export interface Analytics {
  totalAlertsCreated: number;
  alertsActive: number;
  deliveredCount: number;
  readCount: number;
  snoozeCountsPerAlert: Record<string, number>;
  severityBreakdown: Record<AlertSeverity, number>;
}