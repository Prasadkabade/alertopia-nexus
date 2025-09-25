import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, UserAlertPreference } from '../types/alert';
import { alertService } from '../services/alertService';
import { currentUser } from '../services/mockData';
import { AlertCard } from './AlertCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';

export const UserDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [preferences, setPreferences] = useState<UserAlertPreference[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadUserAlerts();
  }, []);

  const loadUserAlerts = () => {
    const userAlerts = alertService.getAlertsForUser(currentUser.id);
    const userPrefs = alertService.getUserAlertPreferences(currentUser.id);
    
    setAlerts(userAlerts);
    setPreferences(userPrefs);
    
    // Calculate unread count
    const unread = userAlerts.filter(alert => {
      const pref = userPrefs.find(p => p.alertId === alert.id);
      return !pref?.read;
    }).length;
    setUnreadCount(unread);
  };

  const handleSnooze = (alertId: string) => {
    alertService.snoozeAlert(currentUser.id, alertId);
    loadUserAlerts();
    toast({
      title: "Alert Snoozed",
      description: "Alert has been snoozed for the rest of today.",
    });
  };

  const handleMarkRead = (alertId: string, read: boolean) => {
    alertService.markAlertAsRead(currentUser.id, alertId, read);
    loadUserAlerts();
    toast({
      title: read ? "Marked as Read" : "Marked as Unread",
      description: `Alert has been marked as ${read ? 'read' : 'unread'}.`,
    });
  };

  const activeAlerts = alerts.filter(alert => {
    const pref = preferences.find(p => p.alertId === alert.id);
    const isSnoozed = pref?.snoozedUntil && new Date(pref.snoozedUntil) > new Date();
    return !isSnoozed;
  });

  const snoozedAlerts = alerts.filter(alert => {
    const pref = preferences.find(p => p.alertId === alert.id);
    const isSnoozed = pref?.snoozedUntil && new Date(pref.snoozedUntil) > new Date();
    return isSnoozed;
  });

  const readAlerts = alerts.filter(alert => {
    const pref = preferences.find(p => p.alertId === alert.id);
    return pref?.read;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero text-white p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {currentUser.name}
              </h1>
              <p className="text-white/80">Stay updated with important alerts and notifications</p>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: unreadCount > 0 ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: unreadCount > 0 ? Infinity : 0, duration: 2 }}
                className="relative"
              >
                <Bell className="h-8 w-8 text-white" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-critical text-critical-foreground p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="gradient-info text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80">Total Alerts</p>
                    <p className="text-3xl font-bold">{alerts.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-warning text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80">Unread</p>
                    <p className="text-3xl font-bold">{unreadCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-success text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80">Read</p>
                    <p className="text-3xl font-bold">{readAlerts.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-muted">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Snoozed</p>
                    <p className="text-3xl font-bold text-foreground">{snoozedAlerts.length}</p>
                  </div>
                  <BellOff className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active Alerts
              {unreadCount > 0 && (
                <Badge className="h-5 w-5 rounded-full bg-critical text-critical-foreground p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="snoozed" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Snoozed
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Active Alerts */}
          <TabsContent value="active" className="space-y-4">
            {activeAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">You're all caught up! No active alerts at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {activeAlerts.map((alert) => {
                  const preference = preferences.find(p => p.alertId === alert.id);
                  return (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      preference={preference}
                      onSnooze={handleSnooze}
                      onMarkRead={handleMarkRead}
                    />
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Snoozed Alerts */}
          <TabsContent value="snoozed" className="space-y-4">
            {snoozedAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Snoozed Alerts</h3>
                  <p className="text-muted-foreground">You haven't snoozed any alerts today.</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {snoozedAlerts.map((alert) => {
                  const preference = preferences.find(p => p.alertId === alert.id);
                  return (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      preference={preference}
                      onMarkRead={handleMarkRead}
                      showActions={false}
                    />
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Alert History</h3>
                  <p className="text-muted-foreground">No alerts have been sent to you yet.</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {alerts.map((alert) => {
                  const preference = preferences.find(p => p.alertId === alert.id);
                  return (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      preference={preference}
                      onMarkRead={handleMarkRead}
                      showActions={false}
                    />
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};