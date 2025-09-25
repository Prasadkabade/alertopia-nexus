import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CalendarIcon, Users, User, Building } from 'lucide-react';
import { Alert, AlertSeverity } from '../types/alert';
import { alertService } from '../services/alertService';
import { mockTeams, mockUsers } from '../services/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

interface CreateAlertFormProps {
  onClose: () => void;
  onAlertCreated: (alert: Alert) => void;
}

export const CreateAlertForm: React.FC<CreateAlertFormProps> = ({
  onClose,
  onAlertCreated,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'Info' as AlertSeverity,
    visibility: {
      org: false,
      teams: [] as string[],
      users: [] as string[],
    },
    reminderEnabled: true,
    startTime: new Date().toISOString().slice(0, 16),
    expiryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const alertData = {
      ...formData,
      deliveryTypes: ['inapp'],
      reminderFrequencyMinutes: 120,
      startTime: new Date(formData.startTime).toISOString(),
      expiryTime: new Date(formData.expiryTime).toISOString(),
      archived: false,
      createdBy: 'admin1',
    };

    const newAlert = alertService.createAlert(alertData);
    onAlertCreated(newAlert);
    
    toast({
      title: "Alert Created",
      description: "Your alert has been created successfully.",
    });
    
    onClose();
  };

  const handleVisibilityChange = (type: 'org' | 'team' | 'user', value: string | boolean) => {
    if (type === 'org') {
      setFormData(prev => ({
        ...prev,
        visibility: {
          ...prev.visibility,
          org: value as boolean,
          teams: value ? [] : prev.visibility.teams,
          users: value ? [] : prev.visibility.users,
        },
      }));
    } else if (type === 'team') {
      const teamId = value as string;
      setFormData(prev => ({
        ...prev,
        visibility: {
          ...prev.visibility,
          teams: prev.visibility.teams.includes(teamId)
            ? prev.visibility.teams.filter(id => id !== teamId)
            : [...prev.visibility.teams, teamId],
        },
      }));
    } else if (type === 'user') {
      const userId = value as string;
      setFormData(prev => ({
        ...prev,
        visibility: {
          ...prev.visibility,
          users: prev.visibility.users.includes(userId)
            ? prev.visibility.users.filter(id => id !== userId)
            : [...prev.visibility.users, userId],
        },
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Create New Alert</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Alert Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter alert title..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter alert message..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as AlertSeverity }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Info">Info</SelectItem>
                      <SelectItem value="Warning">Warning</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryTime">Expiry Time</Label>
                  <Input
                    id="expiryTime"
                    type="datetime-local"
                    value={formData.expiryTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Reminders */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminders"
                  checked={formData.reminderEnabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, reminderEnabled: !!checked }))
                  }
                />
                <Label htmlFor="reminders">Enable reminders every 2 hours</Label>
              </div>

              {/* Visibility */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Alert Visibility</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="org-wide"
                      checked={formData.visibility.org}
                      onCheckedChange={(checked) => handleVisibilityChange('org', !!checked)}
                    />
                    <Label htmlFor="org-wide" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Entire Organization
                    </Label>
                  </div>

                  {!formData.visibility.org && (
                    <>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4" />
                          Specific Teams
                        </Label>
                        <div className="grid grid-cols-2 gap-2 ml-6">
                          {mockTeams.map((team) => (
                            <div key={team.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`team-${team.id}`}
                                checked={formData.visibility.teams.includes(team.id)}
                                onCheckedChange={() => handleVisibilityChange('team', team.id)}
                              />
                              <Label htmlFor={`team-${team.id}`}>{team.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          Specific Users
                        </Label>
                        <div className="grid grid-cols-1 gap-2 ml-6 max-h-32 overflow-y-auto">
                          {mockUsers.filter(user => user.role !== 'admin').map((user) => (
                            <div key={user.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={formData.visibility.users.includes(user.id)}
                                onCheckedChange={() => handleVisibilityChange('user', user.id)}
                              />
                              <Label htmlFor={`user-${user.id}`} className="text-sm">
                                {user.name} ({mockTeams.find(t => t.id === user.teamId)?.name})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Create Alert
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};