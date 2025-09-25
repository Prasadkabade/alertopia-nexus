import React from 'react';
import { motion } from 'framer-motion';
import { Bell, BarChart3, Settings, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { currentUser } from '../services/mockData';

interface NavigationProps {
  activeView: 'user' | 'admin';
  onViewChange: (view: 'user' | 'admin') => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onViewChange,
  unreadCount = 0,
}) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-b border-border p-4 sticky top-0 z-50 backdrop-blur-sm bg-card/95"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">AlertPro</h1>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeView === 'user' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('user')}
              className="relative"
            >
              <User className="h-4 w-4 mr-2" />
              User Dashboard
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-critical text-critical-foreground p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {currentUser.role === 'admin' && (
              <Button
                variant={activeView === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('admin')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{currentUser.name}</span>
            <Badge variant="outline" className="text-xs">
              {currentUser.role}
            </Badge>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};