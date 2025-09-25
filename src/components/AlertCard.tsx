import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, Zap, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertSeverity, UserAlertPreference } from '../types/database';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface AlertCardProps {
  alert: Alert;
  preference?: UserAlertPreference;
  onSnooze?: (alertId: string) => void;
  onMarkRead?: (alertId: string, read: boolean) => void;
  showActions?: boolean;
}

const severityIcons = {
  Info: Info,
  Warning: AlertTriangle,
  Critical: Zap,
};

const severityClasses = {
  Info: 'bg-info-light border-info-border text-info',
  Warning: 'bg-warning-light border-warning-border text-warning',
  Critical: 'bg-critical-light border-critical-border text-critical',
};

const severityBadgeClasses = {
  Info: 'bg-info text-info-foreground',
  Warning: 'bg-warning text-warning-foreground',
  Critical: 'bg-critical text-critical-foreground',
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  preference,
  onSnooze,
  onMarkRead,
  showActions = true,
}) => {
  const SeverityIcon = severityIcons[alert.severity];
  const isRead = preference?.read || false;
  const isSnoozed = preference?.snoozed_until && new Date(preference.snoozed_until) > new Date();

  const handleSnooze = () => {
    if (onSnooze) {
      onSnooze(alert.id);
    }
  };

  const handleToggleRead = () => {
    if (onMarkRead) {
      onMarkRead(alert.id, !isRead);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className={cn(
        'transition-all duration-200 hover:shadow-md',
        severityClasses[alert.severity],
        isRead ? 'opacity-75' : '',
        isSnoozed ? 'opacity-60' : ''
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  'p-2 rounded-lg',
                  severityClasses[alert.severity]
                )}
              >
                <SeverityIcon className="h-5 w-5" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-foreground">{alert.title}</h3>
                  <Badge className={severityBadgeClasses[alert.severity]}>
                    {alert.severity}
                  </Badge>
                  {isRead && (
                    <Badge variant="outline" className="bg-success-light text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Read
                    </Badge>
                  )}
                  {isSnoozed && (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Snoozed
                    </Badge>
                  )}
                </div>
                <p className="text-foreground/80 leading-relaxed">{alert.message}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                  <span>Expires: {new Date(alert.expiry_time).toLocaleDateString()}</span>
                  {alert.reminder_enabled && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Reminders every 2h
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {showActions && (
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleRead}
                className="flex-1"
              >
                {isRead ? 'Mark Unread' : 'Mark Read'}
              </Button>
              {!isSnoozed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSnooze}
                  className="flex-1"
                >
                  Snooze Today
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};