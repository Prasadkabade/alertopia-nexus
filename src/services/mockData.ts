import { Alert, User, Team, UserAlertPreference, NotificationDelivery, Analytics } from '../types/alert';

export const mockTeams: Team[] = [
  { id: 't1', name: 'Engineering' },
  { id: 't2', name: 'Marketing' },
  { id: 't3', name: 'Sales' },
  { id: 't4', name: 'Support' }
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Johnson', teamId: 't1', role: 'user' },
  { id: 'u2', name: 'Bob Smith', teamId: 't1', role: 'user' },
  { id: 'u3', name: 'Carol Davis', teamId: 't1', role: 'user' },
  { id: 'u4', name: 'David Wilson', teamId: 't2', role: 'user' },
  { id: 'u5', name: 'Eva Brown', teamId: 't2', role: 'user' },
  { id: 'admin1', name: 'Admin User', teamId: 't1', role: 'admin' }
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    title: 'System Maintenance Scheduled',
    message: 'Our systems will undergo scheduled maintenance on Saturday from 2:00 AM to 4:00 AM EST. During this time, services may be temporarily unavailable.',
    severity: 'Warning',
    visibility: { org: true, teams: [], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: '2025-09-25T08:00:00Z',
    expiryTime: '2025-09-30T08:00:00Z',
    archived: false,
    createdBy: 'admin1',
    createdAt: '2025-09-25T08:00:00Z',
    updatedAt: '2025-09-25T08:00:00Z'
  },
  {
    id: 'a2',
    title: 'Critical Security Update Required',
    message: 'A critical security vulnerability has been identified. Please update your passwords and enable 2FA immediately.',
    severity: 'Critical',
    visibility: { org: false, teams: ['t1'], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: '2025-09-25T09:00:00Z',
    expiryTime: '2025-09-28T09:00:00Z',
    archived: false,
    createdBy: 'admin1',
    createdAt: '2025-09-25T09:00:00Z',
    updatedAt: '2025-09-25T09:00:00Z'
  },
  {
    id: 'a3',
    title: 'New Feature Release',
    message: 'We are excited to announce the release of our new dashboard feature. Check it out in the latest version!',
    severity: 'Info',
    visibility: { org: true, teams: [], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: false,
    reminderFrequencyMinutes: 120,
    startTime: '2025-09-25T10:00:00Z',
    expiryTime: '2025-10-01T10:00:00Z',
    archived: false,
    createdBy: 'admin1',
    createdAt: '2025-09-25T10:00:00Z',
    updatedAt: '2025-09-25T10:00:00Z'
  },
  {
    id: 'a4',
    title: 'Team Meeting Reminder',
    message: 'Don\'t forget about the all-hands meeting tomorrow at 3 PM in the main conference room.',
    severity: 'Info',
    visibility: { org: false, teams: ['t2'], users: [] },
    deliveryTypes: ['inapp'],
    reminderEnabled: true,
    reminderFrequencyMinutes: 120,
    startTime: '2025-09-25T11:00:00Z',
    expiryTime: '2025-09-26T15:00:00Z',
    archived: false,
    createdBy: 'admin1',
    createdAt: '2025-09-25T11:00:00Z',
    updatedAt: '2025-09-25T11:00:00Z'
  }
];

export const mockUserAlertPreferences: UserAlertPreference[] = [
  { id: 'p1', alertId: 'a1', userId: 'u1', read: false, snoozedUntil: null, lastSnoozedDay: null },
  { id: 'p2', alertId: 'a2', userId: 'u1', read: true, snoozedUntil: null, lastSnoozedDay: null },
  { id: 'p3', alertId: 'a3', userId: 'u1', read: false, snoozedUntil: null, lastSnoozedDay: null },
  { id: 'p4', alertId: 'a1', userId: 'u2', read: false, snoozedUntil: '2025-09-25T23:59:59Z', lastSnoozedDay: '2025-09-25' },
];

export const mockNotificationDeliveries: NotificationDelivery[] = [
  { id: 'n1', alertId: 'a1', userId: 'u1', deliveredAt: '2025-09-25T08:00:00Z', channel: 'inapp', delivered: true },
  { id: 'n2', alertId: 'a2', userId: 'u1', deliveredAt: '2025-09-25T09:00:00Z', channel: 'inapp', delivered: true },
  { id: 'n3', alertId: 'a3', userId: 'u1', deliveredAt: '2025-09-25T10:00:00Z', channel: 'inapp', delivered: true },
];

export const mockAnalytics: Analytics = {
  totalAlertsCreated: 4,
  alertsActive: 4,
  deliveredCount: 12,
  readCount: 4,
  snoozeCountsPerAlert: { 'a1': 1, 'a2': 0, 'a3': 0, 'a4': 0 },
  severityBreakdown: { 'Info': 2, 'Warning': 1, 'Critical': 1 }
};

// Simulated current user - in real app this would come from auth
export const currentUser: User = mockUsers[0]; // Alice Johnson
export const currentAdminUser: User = mockUsers[5]; // Admin User