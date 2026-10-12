import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { WorkspaceType } from '../types';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ isOpen, onClose }) => {
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    createWorkspace,
    deleteWorkspace,
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkspaceType>('personal');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณากรอกชื่อกระเป๋าเงิน/ร้านค้า');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkspace(name.trim(), type, description.trim());
      setName('');
      setDescription('');
      setIsCreating(false);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้าง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, wsName: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกระเป๋า/ร้านค้า "${wsName}"? ข้อมูลรายรับ-รายจ่ายทั้งหมดในบัญชีนี้จะถูกลบ`)) {
      await deleteWorkspace(id);
    }
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
              จัดการกระเป๋าเงิน & ร้านค้า
            </h2>
            <p style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              สลับ, สร้าง หรือลบบัญชีส่วนบุคคลและร้านค้าภายใน User เดียวกัน
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

        {/* Create Toggle Button */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: theme.radius.lg,
              border: `1px dashed ${theme.colors.borderStrong}`,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: theme.colors.text,
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon name="Plus" size={16} color="currentColor" />
            <span>สร้างกระเป๋าเงิน / ร้านค้าใหม่</span>
          </button>
        )}

        {/* Creation Form */}
        {isCreating && (
          <form
            onSubmit={handleCreate}
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: theme.radius.lg,
              padding: '16px',
              marginBottom: '18px',
              border: `1px solid ${theme.colors.borderStrong}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
              สร้างบัญชีใหม่
            </div>

            {/* Type selector: Personal or Shop */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                ประเภทบัญชี *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setType('personal')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: theme.radius.md,
                    border: type === 'personal' ? '1px solid #6366f1' : `1px solid ${theme.colors.border}`,
                    backgroundColor: type === 'personal' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: type === 'personal' ? '#a5b4fc' : theme.colors.textSecondary,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="User" size={14} color="currentColor" />
                  <span>ส่วนบุคคล (Personal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('shop')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: theme.radius.md,
                    border: type === 'shop' ? '1px solid #10b981' : `1px solid ${theme.colors.border}`,
                    backgroundColor: type === 'shop' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: type === 'shop' ? '#10b981' : theme.colors.textSecondary,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="Store" size={14} color="currentColor" />
                  <span>ร้านค้า / ธุรกิจ (Shop)</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '4px' }}>
                ชื่อกระเป๋า / ร้านค้า *
              </label>
              <input
                type="text"
                placeholder={type === 'shop' ? 'เช่น ร้านกาแฟ Minimal Cafe' : 'เช่น ค่าใช้จ่ายส่วนตัว, ท่องเที่ยว'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: '8px 12px',
                  color: theme.colors.text,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '4px' }}>
                คำอธิบายสั้นๆ (ถ้ามี)
              </label>
              <input
                type="text"
                placeholder="เช่น บันทึกยอดขายประจำวันและต้นทุนร้าน"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: '8px 12px',
                  color: theme.colors.text,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: theme.radius.md,
                  border: 'none',
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.primaryText,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {isSubmitting ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
              </button>
            </div>
          </form>
        )}

        {/* Existing Workspaces List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspace?.id;
            return (
              <div
                key={ws.id}
                onClick={() => {
                  setActiveWorkspaceId(ws.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: theme.radius.lg,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : theme.colors.elevated,
                  border: isActive ? `1px solid ${theme.colors.borderStrong}` : `1px solid ${theme.colors.border}`,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: theme.radius.md,
                      backgroundColor:
                        ws.type === 'shop' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name={ws.type === 'shop' ? 'Store' : 'User'}
                      size={18}
                      color={ws.type === 'shop' ? '#10b981' : '#818cf8'}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
                        {ws.name}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: theme.radius.full,
                            backgroundColor: '#10b981',
                            color: '#09090b',
                            fontWeight: '600',
                          }}
                        >
                          ใช้งานอยู่
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                      {ws.description || (ws.type === 'shop' ? 'บัญชีร้านค้า / ธุรกิจ' : 'บัญชีส่วนบุคคล')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {workspaces.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ws.id, ws.name);
                      }}
                      style={{
                        padding: '6px',
                        borderRadius: theme.radius.sm,
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: theme.colors.textDim,
                        cursor: 'pointer',
                      }}
                      title="ลบบัญชีนี้"
                    >
                      <Icon name="Trash2" size={15} color="currentColor" />
                    </button>
                  )}
                  <Icon name="ChevronRight" size={16} color={theme.colors.textMuted} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

