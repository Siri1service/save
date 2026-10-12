import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { WorkspaceRole } from '../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { activeWorkspace, members, inviteMember, removeMember, updateMemberRole } = useApp();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      alert('กรุณากรอก Email ที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteMember(email.trim(), role);
      setEmail('');
      alert(`ส่งคำเชิญไปยัง ${email} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชิญสมาชิก');
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

        {/* Invite Form */}
        <form
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
            ส่งคำเชิญใหม่
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
              <option value="owner">เจ้าของร่วม (Owner) - สิทธิ์เต็มรูปแบบ</option>
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
            {isSubmitting ? 'กำลังส่งคำเชิญ...' : 'ส่งคำเชิญ'}
          </button>
        </form>

        {/* Existing Members */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '10px' }}>
            สมาชิกที่มีสิทธิ์เข้าถึง ({members.length} คน)
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
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={m.role}
                    onChange={(e) => updateMemberRole(m.id, e.target.value as WorkspaceRole)}
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
                    <option value="owner">Owner</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  <button
                    onClick={() => {
                      if (confirm(`ยกเลิกสิทธิ์ของ ${m.email}?`)) {
                        removeMember(m.id);
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
