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
    // Failsafe: Always clear loading after 5 seconds
    const loadingTimeout = setTimeout(() => {
      logOperation('Loading Timeout - Force Clear Loading');
      setLoading(false);
    }, 5000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logOperation('Initial Session Check', { hasSession: !!session, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        logOperation('No Initial Session - Setting Loading False');
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      logOperation('Session Check Error', { error: error.message });
      setLoading(false);
      clearTimeout(loadingTimeout);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logOperation('Auth State Change', { event, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Don't await here to prevent blocking
        fetchUserProfile(session.user.id);
      } else {
        setUserRole(null);
        setProfile(null);
        setLoading(false);
        clearTimeout(loadingTimeout);
        logOperation('Auth State Change - No User, Loading Set False');
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      logOperation('Fetching Profile', { userId });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      logOperation('Profile Query Complete', { hasData: !!data, hasError: !!error, error: error?.message });

      if (error) {
        console.error('Error fetching profile:', error);
        logOperation('Profile Error - Setting Default Role', { error: error.message });
        setUserRole('member');
      } else if (data) {
        setProfile(data);
        setUserRole(data.role);
        logOperation('Profile Loaded Successfully', { userId, role: data.role });
      } else {
        logOperation('No Profile Data - Setting Default Role');
        setUserRole('member');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      logOperation('Profile Fetch Exception', { error: error.message });
      setUserRole('member');
    }
    
    // Always set loading to false
    setLoading(false);
    logOperation('Loading Set to False');
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
    setUser(null);
    setSession(null);
    setUserRole(null);
    setProfile(null);
    setLoading(false);
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
