import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  authNotice: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithProvider: (provider: 'google' | 'facebook') => Promise<AuthResult>;
  signup: (email: string, fullName: string, password: string) => Promise<AuthResult>;
  resendSignupConfirmation: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return undefined;
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

async function acceptPendingWorkspaceInvitations(): Promise<void> {
  const { data, error } = await supabase.rpc('accept_workspace_invitations');
  if (error) {
    console.error('Could not accept pending workspace invitations. Check that the workspace invitation migration is applied:', error);
    return;
  }

  if (Array.isArray(data) && data.length > 0) {
    localStorage.setItem('save_app_invited_workspace_id', data[0]);
  }
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
        await acceptPendingWorkspaceInvitations();
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

      let profile: UserProfile;
      try {
        profile = await loadActiveProfile(data.user.id);
      } catch (profileError) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error('Error clearing rejected auth session:', signOutError);
        throw profileError;
      }

      const signedInAt = new Date().toISOString();
      setUser({ ...profile, last_sign_in_at: signedInAt });
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ last_sign_in_at: signedInAt })
        .eq('id', data.user.id);
      if (updateError) console.error('Could not update the last sign-in timestamp:', updateError);

      await acceptPendingWorkspaceInvitations();
      return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
    } catch (error) {
      if (getErrorCode(error) === 'email_not_confirmed') {
        return {
          success: false,
          error: 'อีเมลนี้ยังไม่ได้รับการยืนยัน กรุณากดลิงก์ยืนยันที่ส่งไปทางอีเมลก่อนเข้าสู่ระบบ',
          requiresEmailConfirmation: true,
        };
      }
      if (getErrorCode(error) === 'invalid_credentials') {
        return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง' };
      }
      return { success: false, error: getErrorMessage(error, 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน') };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: 'google' | 'facebook'): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'ระบบยังไม่ได้เชื่อมต่อ Supabase กรุณาตั้งค่าก่อนเข้าสู่ระบบ' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          ...(provider === 'facebook' ? { scopes: 'email' } : {}),
        },
      });
      if (error) throw error;
      return { success: true, message: 'กำลังเชื่อมต่อไปยังผู้ให้บริการเข้าสู่ระบบ...' };
    } catch (error) {
      console.error(`Sign-in with ${provider} failed:`, error);
      return {
        success: false,
        error: `เข้าสู่ระบบด้วย ${provider === 'google' ? 'Google' : 'Facebook'} ไม่สำเร็จ: ${getErrorMessage(error, 'กรุณาตรวจสอบการตั้งค่า Supabase')}`,
      };
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
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;

      if (data.session && data.user) {
        let profile: UserProfile;
        try {
          profile = await loadActiveProfile(data.user.id);
        } catch (profileError) {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) console.error('Error clearing rejected signup session:', signOutError);
          throw profileError;
        }

        setUser(profile);
        await acceptPendingWorkspaceInvitations();
        return { success: true, message: 'สมัครสมาชิกและเข้าสู่ระบบสำเร็จ' };
      }

      return {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลและยืนยันบัญชีก่อนเข้าสู่ระบบ',
        requiresEmailConfirmation: true,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่') };
    } finally {
      setIsLoading(false);
    }
  };

  const resendSignupConfirmation = async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'ระบบยังไม่ได้เชื่อมต่อ Supabase กรุณาตั้งค่าระบบก่อนส่งอีเมลยืนยัน' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      return { success: true, message: 'ส่งอีเมลยืนยันอีกครั้งแล้ว กรุณาตรวจสอบกล่องจดหมายและโฟลเดอร์สแปม' };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'ส่งอีเมลยืนยันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง') };
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
    <AuthContext.Provider value={{
      user,
      authNotice,
      isAdmin,
      isLoading,
      login,
      loginWithProvider,
      signup,
      resendSignupConfirmation,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
