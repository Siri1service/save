import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../lib/theme';
import { Icon } from '../components/Icon';
import { isSupabaseConfigured } from '../lib/supabase';

export const AuthScreen: React.FC = () => {
  const { login, signup, resendSignupConfirmation, authNotice } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [canResendConfirmation, setCanResendConfirmation] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setCanResendConfirmation(false);

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFeedback({ type: 'error', message: 'กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com' });
      return;
    }
    if (password.length < 8) {
      setFeedback({ type: 'error', message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' });
      return;
    }
    if (mode === 'signup' && fullName.trim().length < 2) {
      setFeedback({ type: 'error', message: 'กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = mode === 'login'
        ? await login(normalizedEmail, password)
        : await signup(normalizedEmail, fullName.trim(), password);
      setFeedback(result.success
        ? { type: 'success', message: result.message || (mode === 'login' ? 'เข้าสู่ระบบสำเร็จ' : 'สมัครสมาชิกสำเร็จ') }
        : { type: 'error', message: result.error || 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง' });
      setCanResendConfirmation(Boolean(result.requiresEmailConfirmation));
    } catch (error) {
      console.error('Authentication request failed:', error);
      setFeedback({ type: 'error', message: 'เกิดข้อผิดพลาดระหว่างเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setFeedback({ type: 'error', message: 'กรุณากรอกอีเมลที่ใช้สมัครก่อนส่งลิงก์ยืนยันอีกครั้ง' });
      return;
    }

    setIsResendingConfirmation(true);
    try {
      const result = await resendSignupConfirmation(normalizedEmail);
      setFeedback(result.success
        ? { type: 'success', message: result.message || 'ส่งอีเมลยืนยันอีกครั้งแล้ว' }
        : { type: 'error', message: result.error || 'ส่งอีเมลยืนยันไม่สำเร็จ' });
    } catch (error) {
      console.error('Failed to resend signup confirmation:', error);
      setFeedback({ type: 'error', message: 'ส่งอีเมลยืนยันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: theme.colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: theme.colors.card,
          border: `1px solid ${theme.colors.borderStrong}`,
          borderRadius: theme.radius.xl,
          padding: '32px 28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.primary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Icon name="Wallet" size={24} color="#09090b" />
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              color: theme.colors.text,
              margin: '0 0 4px 0',
            }}
          >
            SAVE
          </h1>
          <p style={{ fontSize: '13px', color: theme.colors.textMuted, margin: 0 }}>
            Beta version 0.1.0 © Siri.DEV
          </p>

          {!isSupabaseConfigured && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                borderRadius: theme.radius.md,
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                fontSize: '11px',
                lineHeight: 1.6,
              }}
              role="status"
            >
              ระบบยังไม่พร้อมเข้าสู่ระบบจริง กรุณาตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env แล้วเริ่มระบบใหม่
            </div>
          )}
        </div>

        {/* Mode Toggle (Login vs Signup) */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.colors.border}`, marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFeedback(null);
              setCanResendConfirmation(false);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: mode === 'login' ? '600' : '400',
              color: mode === 'login' ? theme.colors.text : theme.colors.textSecondary,
              borderBottom: mode === 'login' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setFeedback(null);
              setCanResendConfirmation(false);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: mode === 'signup' ? '600' : '400',
              color: mode === 'signup' ? theme.colors.text : theme.colors.textSecondary,
              borderBottom: mode === 'signup' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            สมัครสมาชิก
          </button>
        </div>

        {authNotice && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: theme.radius.md,
              padding: '10px 14px',
              color: '#f87171',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            {authNotice}
          </div>
        )}

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            style={{
              backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              borderRadius: theme.radius.md,
              padding: '10px 14px',
              color: feedback.type === 'error' ? '#f87171' : '#34d399',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Form */}
        <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                ชื่อ-นามสกุล *
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="สมชาย ใจดี"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: theme.colors.elevated,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: '10px 14px',
                  color: theme.colors.text,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              อีเมล (Email) *
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: theme.colors.elevated,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: '10px 14px',
                color: theme.colors.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              รหัสผ่าน (อย่างน้อย 8 ตัวอักษร) *
            </label>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: '100%',
                backgroundColor: theme.colors.elevated,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: '10px 14px',
                color: theme.colors.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isSupabaseConfigured}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: theme.radius.md,
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: theme.colors.primaryText,
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting || !isSupabaseConfigured ? 'not-allowed' : 'pointer',
              opacity: !isSupabaseConfigured ? 0.55 : 1,
              marginTop: '6px',
              transition: 'opacity 0.15s ease',
            }}
          >
            {isSubmitting
              ? 'กำลังดำเนินการ...'
              : mode === 'login'
              ? 'เข้าสู่ระบบ'
              : 'สมัครเป็นผู้ใช้งาน'}
          </button>
        </form>

        {canResendConfirmation && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={isResendingConfirmation || !isSupabaseConfigured}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '10px',
              borderRadius: theme.radius.md,
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: 'transparent',
              color: theme.colors.textSecondary,
              fontSize: '12px',
              cursor: isResendingConfirmation ? 'not-allowed' : 'pointer',
            }}
          >
            {isResendingConfirmation ? 'กำลังส่งอีเมล...' : 'ส่งอีเมลยืนยันอีกครั้ง'}
          </button>
        )}

      </div>
    </div>
  );
};
