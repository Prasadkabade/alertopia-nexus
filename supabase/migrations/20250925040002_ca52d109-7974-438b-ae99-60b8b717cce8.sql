-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  team_id UUID,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical')),
  visibility_org BOOLEAN DEFAULT FALSE,
  visibility_teams UUID[] DEFAULT '{}',
  visibility_users UUID[] DEFAULT '{}',
  delivery_types TEXT[] DEFAULT '{"inapp"}',
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_frequency_minutes INTEGER DEFAULT 120,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_deliveries table
CREATE TABLE public.notification_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  channel TEXT NOT NULL DEFAULT 'inapp',
  delivered BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_alert_preferences table
CREATE TABLE public.user_alert_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  snoozed_until TIMESTAMP WITH TIME ZONE,
  last_snoozed_day DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alert_id, user_id)
);

-- Add foreign key for profiles team_id
ALTER TABLE public.profiles ADD CONSTRAINT profiles_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Everyone can view teams" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage teams" ON public.teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for alerts
CREATE POLICY "Everyone can view active alerts" ON public.alerts
  FOR SELECT USING (NOT archived);

CREATE POLICY "Only admins can manage alerts" ON public.alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notification_deliveries
CREATE POLICY "Users can view their own deliveries" ON public.notification_deliveries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert deliveries" ON public.notification_deliveries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all deliveries" ON public.notification_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_alert_preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_alert_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_alert_preferences_updated_at
  BEFORE UPDATE ON public.user_alert_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_alerts_visibility_org ON public.alerts(visibility_org) WHERE NOT archived;
CREATE INDEX idx_alerts_start_expiry ON public.alerts(start_time, expiry_time) WHERE NOT archived;
CREATE INDEX idx_alerts_created_by ON public.alerts(created_by);
CREATE INDEX idx_notification_deliveries_user_id ON public.notification_deliveries(user_id);
CREATE INDEX idx_notification_deliveries_alert_id ON public.notification_deliveries(alert_id);
CREATE INDEX idx_user_alert_preferences_user_alert ON public.user_alert_preferences(user_id, alert_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_team_id ON public.profiles(team_id);

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_alert_preferences;