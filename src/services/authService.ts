import { supabase } from "@/integrations/supabase/client";
import { Profile, Team } from "../types/database";

class AuthService {
  // Sign up new user
  async signUp(email: string, password: string, userData: { name: string; teamId: string; role: 'user' | 'admin' }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create profile after successful signup
    if (data.user) {
      await this.createProfile(data.user.id, userData);
    }

    return data;
  }

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Get current user profile
  async getCurrentProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  // Create user profile
  async createProfile(userId: string, userData: { name: string; teamId: string; role: 'user' | 'admin' }) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name: userData.name,
        team_id: userData.teamId,
        role: userData.role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all teams
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Get all profiles
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();