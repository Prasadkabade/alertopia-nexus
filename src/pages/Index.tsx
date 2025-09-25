import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { UserDashboard } from '../components/UserDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { AuthPage } from '../components/AuthPage';
import { alertService } from '../services/alertService';
import { authService } from '../services/authService';
import { Profile } from '../types/database';

const Index = () => {
  const [activeView, setActiveView] = useState<'user' | 'admin'>('user');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadData();
    
    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkAuthAndLoadData();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const user = await authService.getCurrentProfile();
      setCurrentUser(user);
      
      if (user) {
        // Calculate unread count for navigation badge
        const [userAlerts, userPrefs] = await Promise.all([
          alertService.getAlertsForUser(user.user_id),
          alertService.getUserAlertPreferences(user.user_id),
        ]);
        
        const unread = userAlerts.filter(alert => {
          const pref = userPrefs.find(p => p.alert_id === alert.id);
          return !pref?.read;
        }).length;
        
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onAuthSuccess={checkAuthAndLoadData} />;
  }

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
        currentUser={currentUser}
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
