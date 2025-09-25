import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, BarChart3, Users, Bell, AlertTriangle } from 'lucide-react';
import { Alert, AlertSeverity } from '../types/database';
import { alertService } from '../services/alertService';
import { AlertCard } from './AlertCard';
import { SimpleChart } from './SimpleChart';
import { CreateAlertForm } from './CreateAlertForm';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const AdminDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<{
    severity?: AlertSeverity;
    status?: 'active' | 'expired' | 'archived';
    audience?: 'org' | 'team' | 'user';
  }>({});

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await alertService.getAllAlerts(filters);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const data = await alertService.getAllAlerts(filters);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    }
  };

  const clearFilters = async () => {
    setFilters({});
    try {
      const data = await alertService.getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to clear filters:', error);
    }
  };

  const handleAlertCreated = (newAlert: Alert) => {
    setAlerts(prev => [newAlert, ...prev]);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const [analytics, setAnalytics] = useState({
    totalAlertsCreated: 0,
    alertsActive: 0,
    deliveredCount: 0,
    readCount: 0,
    snoozeCountsPerAlert: {},
    severityBreakdown: { Info: 0, Warning: 0, Critical: 0 }
  });

  const loadAnalytics = async () => {
    try {
      const data = await alertService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };
  
  const severityChartData = Object.entries(analytics.severityBreakdown).map(([severity, count]) => ({
    name: severity,
    value: count,
    color: severity === 'Info' ? 'hsl(var(--info))' : 
           severity === 'Warning' ? 'hsl(var(--warning))' : 
           'hsl(var(--critical))'
  }));

  const deliveryChartData = [
    { name: 'Delivered', value: analytics.deliveredCount, color: 'hsl(var(--info))' },
    { name: 'Read', value: analytics.readCount, color: 'hsl(var(--success))' },
    { name: 'Unread', value: analytics.deliveredCount - analytics.readCount, color: 'hsl(var(--warning))' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-white p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-white/80">Manage alerts and monitor system performance</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Manage Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        <p className="text-3xl font-bold">{analytics.totalAlertsCreated}</p>
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
                        <p className="text-white/80">Active Alerts</p>
                        <p className="text-3xl font-bold">{analytics.alertsActive}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="gradient-critical text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80">Delivered</p>
                        <p className="text-3xl font-bold">{analytics.deliveredCount}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-success text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80">Read Rate</p>
                        <p className="text-3xl font-bold">
                          {Math.round((analytics.readCount / analytics.deliveredCount) * 100)}%
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alerts by Severity</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart data={severityChartData} type="pie" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart data={deliveryChartData} type="bar" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select
                    value={filters.severity || ''}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value as AlertSeverity }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Info">Info</SelectItem>
                      <SelectItem value="Warning">Warning</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.audience || ''}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, audience: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org">Organization</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button onClick={applyFilters} className="flex-1">Apply</Button>
                    <Button variant="outline" onClick={clearFilters}>Clear</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts List */}
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  showActions={false}
                />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Snooze Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.snoozeCountsPerAlert).map(([alertId, count]) => {
                      const alert = alerts.find(a => a.id === alertId);
                      return (
                        <div key={alertId} className="flex items-center justify-between">
                          <span className="text-sm">{alert?.title || `Alert ${alertId}`}</span>
                          <Badge variant="outline">{String(count)} snoozes</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Delivery Rate</span>
                      <span className="font-semibold">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Read Rate</span>
                      <span className="font-semibold">
                        {Math.round((analytics.readCount / analytics.deliveredCount) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Response Time</span>
                      <span className="font-semibold">2.3s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Alert Form */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateAlertForm
            onClose={() => setShowCreateForm(false)}
            onAlertCreated={handleAlertCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};