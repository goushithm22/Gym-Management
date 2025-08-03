import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Logging utility for key operations
export const logOperation = (operation, details = {}) => {
  console.log(`[GYM_SYSTEM] ${new Date().toISOString()} - ${operation}:`, details);
};

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profile, setProfile] = useState(null);
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

  const fetchUserProfile = async (userId) => {
    try {
      logOperation('Fetching Profile', { userId });
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        logOperation('Profile Error - Setting Default Role', { error: error.message });
        // For now, set a default role if profile doesn't exist
        setUserRole('member');
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        setUserRole(data.role);
        logOperation('Profile Loaded Successfully', { userId, role: data.role, profileData: data });
      } else {
        logOperation('No Profile Data - Setting Default Role');
        setUserRole('member');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      logOperation('Profile Fetch Exception', { error });
      setUserRole('member'); // Default role
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
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

  const signUp = async (email, password, fullName, role) => {
    logOperation('Sign Up Attempt', { email, role });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
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
