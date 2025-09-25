import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { UserDashboard } from '../components/UserDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { alertService } from '../services/alertService';
import { currentUser } from '../services/mockData';

const Index = () => {
  const [activeView, setActiveView] = useState<'user' | 'admin'>('user');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Calculate unread count for navigation badge
    const userAlerts = alertService.getAlertsForUser(currentUser.id);
    const userPrefs = alertService.getUserAlertPreferences(currentUser.id);
    
    const unread = userAlerts.filter(alert => {
      const pref = userPrefs.find(p => p.alertId === alert.id);
      return !pref?.read;
    }).length;
    
    setUnreadCount(unread);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        unreadCount={unreadCount}
      />
      
      <main>
        {activeView === 'user' ? (
          <UserDashboard />
        ) : (
          <AdminDashboard />
        )}
      </main>
    </motion.div>
  );
};

export default Index;
