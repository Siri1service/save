import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  authNotice: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, fullName: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

async function loadActiveProfile(authUserId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('ไม่พบข้อมูลโปรไฟล์ กรุณาติดต่อผู้ดูแลระบบ');

  const profile = data as UserProfile;
  if (profile.status !== 'active') {
    throw new Error('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
  }

  return profile;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) return;

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session?.user) return;

        const profile = await loadActiveProfile(data.session.user.id);
        if (isMounted) setUser(profile);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setAuthNotice(getErrorMessage(error, 'ไม่สามารถตรวจสอบสถานะบัญชีได้ กรุณาเข้าสู่ระบบใหม่'));
        }
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error('Error clearing invalid auth session:', signOutError);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'ระบบยังไม่ได้เชื่อมต่อ Supabase กรุณาตั้งค่าในไฟล์ .env ก่อนเข้าสู่ระบบ' };
    }

    setIsLoading(true);
    setAuthNotice(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('ไม่พบข้อมูลบัญชีผู้ใช้');

      try {
        const profile = await loadActiveProfile(data.user.id);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq('id', data.user.id);
        if (updateError) throw updateError;

        setUser({ ...profile, last_sign_in_at: new Date().toISOString() });
        return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
      } catch (profileError) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error('Error clearing rejected auth session:', signOutError);
        throw profileError;
      }
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน') };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, fullName: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'ระบบยังไม่ได้เชื่อมต่อ Supabase กรุณาตั้งค่าในไฟล์ .env ก่อนสมัครสมาชิก' };
    }

    setIsLoading(true);
    setAuthNotice(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      if (data.session && data.user) {
        try {
          const profile = await loadActiveProfile(data.user.id);
          setUser(profile);
          return { success: true, message: 'สมัครสมาชิกและเข้าสู่ระบบสำเร็จ' };
        } catch (profileError) {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) console.error('Error clearing rejected signup session:', signOutError);
          throw profileError;
        }
      }

      return {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลและยืนยันบัญชีก่อนเข้าสู่ระบบ',
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่') };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const { role: _role, status: _status, ...safeUpdates } = updates;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update(safeUpdates).eq('id', user.id);
      if (error) throw error;
    }

    setUser({ ...user, ...safeUpdates });
  };

  const isAdmin = user?.role === 'admin' && user.status === 'active';

  return (
    <AuthContext.Provider value={{ user, authNotice, isAdmin, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
