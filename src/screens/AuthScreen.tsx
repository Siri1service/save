import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../lib/theme';
import { Icon } from '../components/Icon';
import { isSupabaseConfigured } from '../lib/supabase';

export const AuthScreen: React.FC = () => {
  const { login, signup, switchDemoRole } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [roleType, setRoleType] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('กรุณากรอก Email ให้ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await login(email.trim(), password, roleType === 'admin');
        if (!res.success) setErrorMessage(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
      } else {
        if (!fullName.trim()) {
          setErrorMessage('กรุณากรอกชื่อ-นามสกุล');
          setIsSubmitting(false);
          return;
        }
        const res = await signup(email.trim(), fullName.trim(), password, roleType === 'admin');
        if (!res.success) setErrorMessage(res.error || 'สมัครสมาชิกไม่สำเร็จ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
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
            Minimal & Modern Expense Management
          </p>

          {!isSupabaseConfigured && (
            <div
              style={{
                marginTop: '12px',
                padding: '6px 12px',
                borderRadius: theme.radius.full,
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: '#a5b4fc',
                fontSize: '11px',
                display: 'inline-block',
              }}
            >
              โหมดทดสอบ (Demo Mode พร้อมใช้งานทันที)
            </div>
          )}
        </div>

        {/* Role Segmented Switch (User vs Admin Login) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: theme.colors.elevated,
            padding: '3px',
            borderRadius: theme.radius.full,
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setRoleType('user')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: theme.radius.full,
              border: 'none',
              fontSize: '13px',
              fontWeight: roleType === 'user' ? '600' : '400',
              backgroundColor: roleType === 'user' ? theme.colors.card : 'transparent',
              color: roleType === 'user' ? theme.colors.text : theme.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ผู้ใช้งานทั่วไป (User)
          </button>
          <button
            type="button"
            onClick={() => setRoleType('admin')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: theme.radius.full,
              border: 'none',
              fontSize: '13px',
              fontWeight: roleType === 'admin' ? '600' : '400',
              backgroundColor: roleType === 'admin' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: roleType === 'admin' ? '#c7d2fe' : theme.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ผู้ดูแลระบบ (Admin)
          </button>
        </div>

        {/* Mode Toggle (Login vs Signup) */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.colors.border}`, marginBottom: '20px' }}>
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage('');
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
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
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

        {/* Error notification */}
        {errorMessage && (
          <div
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
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                ชื่อ-นามสกุล *
              </label>
              <input
                type="text"
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
              placeholder={roleType === 'admin' ? 'admin@save.app' : 'user@example.com'}
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
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: theme.radius.md,
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: theme.colors.primaryText,
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              transition: 'opacity 0.15s ease',
            }}
          >
            {isSubmitting
              ? 'กำลังดำเนินการ...'
              : mode === 'login'
              ? `เข้าสู่ระบบ (${roleType === 'admin' ? 'Admin' : 'User'})`
              : `ยืนยันการสมัครสมาชิก`}
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: `1px solid ${theme.colors.border}`,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '11px', color: theme.colors.textDim, marginBottom: '10px' }}>
            ทดลองใช้งานด่วน (One-Click Quick Access):
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => switchDemoRole('user')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: theme.radius.md,
                border: '1px solid rgba(16, 185, 129, 0.4)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              ทดลองเป็น User
            </button>
            <button
              type="button"
              onClick={() => switchDemoRole('admin')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: theme.radius.md,
                border: '1px solid rgba(99, 102, 241, 0.4)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#a5b4fc',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              ทดลองเป็น Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
