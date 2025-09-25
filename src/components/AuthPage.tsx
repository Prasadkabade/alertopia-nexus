import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Bell, UserPlus, LogIn } from 'lucide-react';
import { authService } from '../services/authService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [teams, setTeams] = useState([
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Engineering' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Marketing' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Sales' },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Support' },
  ]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    teamId: '',
    role: 'user' as 'user' | 'admin',
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(formData.email, formData.password, {
          name: formData.name,
          teamId: formData.teamId,
          role: formData.role,
        });
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        });
      } else {
        await authService.signIn(formData.email, formData.password);
        toast({
          title: "Welcome Back",
          description: "You have been signed in successfully!",
        });
      }
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">AlertPro</h1>
          <p className="text-muted-foreground mt-2">
            Smart Alerting & Notification Platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        required={isSignUp}
                      />
                    </div>

                    <div>
                      <Label htmlFor="team">Team</Label>
                      <Select
                        value={formData.teamId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}
                        required={isSignUp}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'user' | 'admin' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          <p>Demo accounts available:</p>
          <p>Admin: admin@example.com / password</p>
          <p>User: user@example.com / password</p>
        </motion.div>
      </div>
    </div>
  );
};