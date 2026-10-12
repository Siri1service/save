import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { WorkspaceRole } from '../types';
import { useAuth } from '../context/AuthContext';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'กรุณาลองใหม่';
};

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { activeWorkspace, members, inviteMember, removeMember, updateMemberRole } = useApp();
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const canManageMembers = Boolean(isAdmin || (user && activeWorkspace?.owner_id === user.id));

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFeedback({ type: 'error', message: 'กรุณากรอกอีเมลที่ถูกต้อง' });
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteMember(normalizedEmail, role);
      setEmail('');
      setFeedback({
        type: 'success',
        message: `บันทึกคำเชิญสำหรับ ${normalizedEmail} แล้ว กรุณาให้เพื่อนสมัครหรือเข้าสู่ระบบด้วยอีเมลนี้เพื่อรับสิทธิ์เข้าถึง`,
      });
    } catch (error) {
      console.error('Failed to invite workspace member:', error);
      setFeedback({
        type: 'error',
        message: `ส่งคำเชิญไม่สำเร็จ: ${getErrorMessage(error)}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabels: Record<WorkspaceRole, { title: string; desc: string; color: string }> = {
    owner: { title: 'เจ้าของ (Owner)', desc: 'จัดการทุกอย่าง รวมถึงสิทธิ์สมาชิกและลบบัญชี', color: '#10b981' },
    editor: { title: 'ผู้แก้ไข (Editor)', desc: 'บันทึก แก้ไข ลบ รายรับ-รายจ่าย และหมวดหมู่ได้', color: '#6366f1' },
    viewer: { title: 'ผู้เข้าชม (Viewer)', desc: 'ดูสรุป ประวัติ และส่งออกรายงาน PDF/CSV เท่านั้น', color: '#eab308' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.colors.card,
          border: `1px solid ${theme.colors.borderStrong}`,
          borderRadius: theme.radius.xl,
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.text }}>
              เชิญเพื่อน & กำหนดสิทธิ์การเข้าถึง
            </h2>
            <p style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              แชร์ข้อมูลใน "{activeWorkspace?.name}" กับเพื่อนหรือหุ้นส่วน
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.textMuted,
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <Icon name="X" size={20} color="currentColor" />
          </button>
        </div>

        {!canManageMembers && (
          <p style={{ fontSize: '12px', color: theme.colors.textMuted, marginBottom: '16px' }}>
            เฉพาะเจ้าของ workspace เท่านั้นที่เชิญหรือจัดการสมาชิกได้
          </p>
        )}

        {canManageMembers && <form
          onSubmit={handleInvite}
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: theme.radius.lg,
            padding: '16px',
            marginBottom: '20px',
            border: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.text }}>
            สร้างคำเชิญใหม่
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '4px' }}>
              Email ของผู้ที่จะเชิญ *
            </label>
            <input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: '9px 12px',
                color: theme.colors.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '4px' }}>
              กำหนดระดับสิทธิ์ (Permission)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as WorkspaceRole)}
              style={{
                width: '100%',
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: '9px 12px',
                color: theme.colors.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="editor">ผู้แก้ไข (Editor) - บันทึกและแก้ไขรายการได้</option>
              <option value="viewer">ผู้เข้าชม (Viewer) - ดูข้อมูลและส่งออกรายงานเท่านั้น</option>
            </select>
            <p style={{ fontSize: '11px', color: theme.colors.textDim, marginTop: '4px' }}>
              {roleLabels[role]?.desc}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '10px 16px',
              borderRadius: theme.radius.md,
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: theme.colors.primaryText,
              fontSize: '13px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {isSubmitting ? 'กำลังสร้างคำเชิญ...' : 'สร้างคำเชิญ'}
          </button>
        </form>}

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            style={{
              padding: '10px 12px',
              marginBottom: '16px',
              borderRadius: theme.radius.md,
              backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: feedback.type === 'error' ? '#f87171' : '#34d399',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Existing Members */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '10px' }}>
            สมาชิกและคำเชิญ ({members.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.elevated,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: theme.colors.text,
                    }}
                  >
                    {m.full_name?.charAt(0) || m.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: theme.colors.text }}>
                      {m.full_name || m.email}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>{m.email}</div>
                    {m.status === 'pending' && (
                      <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '2px' }}>
                        รอสมัคร/เข้าสู่ระบบด้วยอีเมลนี้
                      </div>
                    )}
                  </div>
                </div>

                {canManageMembers && m.user_id !== user?.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={m.role}
                      onChange={async (e) => {
                        try {
                          await updateMemberRole(m.id, e.target.value as WorkspaceRole);
                        } catch (error) {
                          console.error('Failed to update workspace member role:', error);
                          setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'เปลี่ยนสิทธิ์ไม่สำเร็จ' });
                        }
                      }}
                      style={{
                        backgroundColor: theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radius.sm,
                        padding: '4px 8px',
                        color: roleLabels[m.role]?.color || theme.colors.text,
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <button
                      onClick={async () => {
                        if (confirm(`ยกเลิกสิทธิ์ของ ${m.email}?`)) {
                          try {
                            await removeMember(m.id);
                          } catch (error) {
                            console.error('Failed to remove workspace member:', error);
                            setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'ยกเลิกคำเชิญไม่สำเร็จ' });
                          }
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.colors.textDim,
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="ลบสมาชิก"
                    >
                      <Icon name="Trash2" size={14} color="currentColor" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
