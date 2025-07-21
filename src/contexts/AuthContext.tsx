
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'member' | 'reception';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Logging utility for key operations
export const logOperation = (operation: string, details: any = {}) => {
  console.log(`[GYM_SYSTEM] ${new Date().toISOString()} - ${operation}:`, details);
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logOperation('Auth State Change', { event, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // For now, set a default role if profile doesn't exist
        setUserRole('member');
        setLoading(false);
        return;
      }

      setProfile(data);
      setUserRole(data.role as UserRole);
      logOperation('Profile Loaded', { userId, role: data.role });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserRole('member'); // Default role
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    logOperation('Sign In Attempt', { email });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logOperation('Sign In Failed', { email, error: error.message });
    } else {
      logOperation('Sign In Success', { email });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    logOperation('Sign Up Attempt', { email, role });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logOperation('Sign Up Failed', { email, error: error.message });
      return { error };
    }

    // Create profile after successful signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          role: role,
          full_name: fullName,
        });

      if (profileError) {
        logOperation('Profile Creation Failed', { email, error: profileError.message });
        return { error: profileError };
      }
    }

    logOperation('Sign Up Success', { email, role });
    return { error: null };
  };

  const signOut = async () => {
    logOperation('Sign Out', { userId: user?.id });
    await supabase.auth.signOut();
    setUserRole(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    userRole,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
