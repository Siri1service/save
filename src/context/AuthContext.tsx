import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { isSupabaseConfigured, supabase, LOCAL_STORAGE_KEYS } from '../lib/supabase';
import { INITIAL_USERS } from '../lib/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, asAdmin?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, fullName: string, password?: string, asAdmin?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
            } else {
              // Create profile fallback
              const newProfile: UserProfile = {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || 'ผู้ใช้งาน',
                role: (session.user.user_metadata?.role as UserRole) || 'user',
                status: 'active',
                last_sign_in_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              };
              setUser(newProfile);
            }
          }
        } else {
          // Read from local storage or default to first mock user
          const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            const defaultUser = INITIAL_USERS[0]; // Somchai (User)
            setUser(defaultUser);
            localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string, asAdmin?: boolean) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || '123456',
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            // Update last sign in
            await supabase.from('profiles').update({ last_sign_in_at: new Date().toISOString() }).eq('id', data.user.id);
            setUser(profile);
          }
        }
        return { success: true };
      } else {
        // Mock sign in
        const existingUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS) || 'null') || INITIAL_USERS;
        let matchedUser = existingUsers.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase());

        if (!matchedUser) {
          // Auto create user if not found in mock mode
          matchedUser = {
            id: `user-${Date.now()}`,
            email,
            full_name: email.split('@')[0],
            role: asAdmin ? 'admin' : 'user',
            status: 'active',
            last_sign_in_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
          const updatedUsers = [...existingUsers, matchedUser];
          localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        }

        matchedUser.last_sign_in_at = new Date().toISOString();
        setUser(matchedUser);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(matchedUser));
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'เข้าสู่ระบบไม่สำเร็จ' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, fullName: string, password?: string, asAdmin?: boolean) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || '123456',
          options: {
            data: {
              full_name: fullName,
              role: asAdmin ? 'admin' : 'user',
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email,
            full_name: fullName,
            role: asAdmin ? 'admin' : 'user',
            status: 'active',
            last_sign_in_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
          setUser(profile);
        }
        return { success: true };
      } else {
        // Mock signup
        const existingUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS) || 'null') || INITIAL_USERS;
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          email,
          full_name: fullName,
          role: asAdmin ? 'admin' : 'user',
          status: 'active',
          last_sign_in_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        const updatedUsers = [...existingUsers, newUser];
        localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
        setUser(newUser);
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'สมัครสมาชิกไม่สำเร็จ' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    setUser(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS) || 'null') || INITIAL_USERS;
    const target = existingUsers.find((u: UserProfile) => u.role === role) || (role === 'admin' ? INITIAL_USERS[1] : INITIAL_USERS[0]);
    setUser(target);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(target));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        signup,
        logout,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
