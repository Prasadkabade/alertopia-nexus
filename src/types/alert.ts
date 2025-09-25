export type AlertSeverity = 'Info' | 'Warning' | 'Critical';
export type UserRole = 'user' | 'admin';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  visibility: {
    org: boolean;
    teams: string[];
    users: string[];
  };
  deliveryTypes: string[];
  reminderEnabled: boolean;
  reminderFrequencyMinutes: number;
  startTime: string;
  expiryTime: string;
  archived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  teamId: string;
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
}

export interface NotificationDelivery {
  id: string;
  alertId: string;
  userId: string;
  deliveredAt: string;
  channel: string;
  delivered: boolean;
}

export interface UserAlertPreference {
  id: string;
  alertId: string;
  userId: string;
  read: boolean;
  snoozedUntil: string | null;
  lastSnoozedDay: string | null;
}

export interface Analytics {
  totalAlertsCreated: number;
  alertsActive: number;
  deliveredCount: number;
  readCount: number;
  snoozeCountsPerAlert: Record<string, number>;
  severityBreakdown: Record<AlertSeverity, number>;
}