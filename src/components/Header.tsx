import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { ThemeMode } from '../lib/theme';

interface HeaderProps {
  onOpenWorkspaceModal: () => void;
  onOpenInviteModal: () => void;
  onOpenCategoryModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettings: () => void;
  activeTab: 'dashboard' | 'transactions' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'admin') => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWorkspaceModal,
  onOpenInviteModal,
  onOpenCategoryModal,
  onOpenExportModal,
  onOpenSettings,
  activeTab,
  setActiveTab,
  themeMode,
  onToggleTheme,
}) => {
  const { user, isAdmin, logout, updateProfile } = useAuth();
  const { activeWorkspace } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const fullName = profileName.trim();
    if (fullName.length < 2) {
      setProfileFeedback('กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร');
      return;
    }

    setIsSavingProfile(true);
    setProfileFeedback(null);
    try {
      await updateProfile({ full_name: fullName });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile name:', error);
      setProfileFeedback(error instanceof Error ? error.message : 'แก้ไขชื่อผู้ใช้ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <header
      style={{
        backgroundColor: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Workspace Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="Wallet" size={18} color={theme.colors.primaryText} />
          </div>
          <div>
            <span
              style={{
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '-0.5px',
                color: theme.colors.text,
              }}
            >
              SAVE
            </span>
          </div>
        </div>

        {/* Workspace Switcher Pill */}
        {activeWorkspace && (
          <button
            onClick={onOpenWorkspaceModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.borderStrong}`,
              padding: '6px 12px',
              borderRadius: theme.radius.full,
              color: theme.colors.text,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="คลิกเพื่อสลับหรือจัดการกระเป๋าเงิน/ร้านค้า"
          >
            <Icon
              name={activeWorkspace.type === 'shop' ? 'Store' : 'User'}
              size={14}
              color={activeWorkspace.type === 'shop' ? '#10b981' : '#6366f1'}
            />
            <span style={{ fontWeight: '500' }}>{activeWorkspace.name}</span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: theme.radius.full,
                backgroundColor:
                  activeWorkspace.type === 'shop'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(99, 102, 241, 0.15)',
                color:
                  activeWorkspace.type === 'shop' ? '#10b981' : '#818cf8',
              }}
            >
              {activeWorkspace.type === 'shop' ? 'ร้านค้า' : 'ส่วนบุคคล'}
            </span>
            <Icon name="ChevronDown" size={12} color={theme.colors.textMuted} />
          </button>
        )}
      </div>

      {/* Navigation Tabs (Dashboard, History, Admin) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: theme.radius.full,
            fontSize: '13px',
            fontWeight: activeTab === 'dashboard' ? '600' : '400',
            backgroundColor:
              activeTab === 'dashboard' ? theme.colors.elevated : 'transparent',
            color:
              activeTab === 'dashboard'
                ? theme.colors.text
                : theme.colors.textSecondary,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Icon name="LayoutDashboard" size={15} color="currentColor" />
          <span>แดชบอร์ด</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: theme.radius.full,
            fontSize: '13px',
            fontWeight: activeTab === 'transactions' ? '600' : '400',
            backgroundColor:
              activeTab === 'transactions' ? theme.colors.elevated : 'transparent',
            color:
              activeTab === 'transactions'
                ? theme.colors.text
                : theme.colors.textSecondary,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Icon name="Clock" size={15} color="currentColor" />
          <span>ประวัติย้อนหลัง</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: theme.radius.full,
              fontSize: '13px',
              fontWeight: activeTab === 'admin' ? '600' : '400',
              backgroundColor:
                activeTab === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'admin' ? '#a5b4fc' : theme.colors.textSecondary,
              border: activeTab === 'admin' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
              cursor: 'pointer',
            }}
          >
            <Icon name="Shield" size={15} color={activeTab === 'admin' ? '#a5b4fc' : 'currentColor'} />
            <span>จัดการระบบ (Admin)</span>
          </button>
        )}
      </nav>

      {/* Action Utilities & User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onOpenSettings}
          aria-label="การตั้งค่า"
          title="การตั้งค่า"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.full,
            color: theme.colors.textSecondary,
            cursor: 'pointer',
          }}
        >
          <Icon name="Settings" size={16} color="currentColor" />
        </button>
        <button
          onClick={onToggleTheme}
          aria-label={themeMode === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
          title={themeMode === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.full,
            color: theme.colors.textSecondary,
            cursor: 'pointer',
          }}
        >
          <Icon name={themeMode === 'dark' ? 'Sun' : 'Moon'} size={16} color="currentColor" />
        </button>

        {/* Invite Friend */}
        <button
          onClick={onOpenInviteModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            padding: '6px 12px',
            borderRadius: theme.radius.md,
            color: theme.colors.textSecondary,
            fontSize: '13px',
            cursor: 'pointer',
          }}
          title="เชิญเพื่อนร่วมกระเป๋าเงิน"
        >
          <Icon name="UserPlus" size={14} color="currentColor" />
          <span style={{ display: 'none', minWidth: '0px' }}>เชิญเพื่อน</span>
          <span style={{ fontSize: '12px' }}>เชิญเพื่อน</span>
        </button>

        {/* Categories */}
        <button
          onClick={onOpenCategoryModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            padding: '6px 12px',
            borderRadius: theme.radius.md,
            color: theme.colors.textSecondary,
            fontSize: '13px',
            cursor: 'pointer',
          }}
          title="จัดการหมวดหมู่"
        >
          <Icon name="Tag" size={14} color="currentColor" />
          <span style={{ fontSize: '12px' }}>หมวดหมู่</span>
        </button>

        {/* Export PDF/CSV */}
        <button
          onClick={onOpenExportModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            padding: '6px 12px',
            borderRadius: theme.radius.md,
            color: theme.colors.textSecondary,
            fontSize: '13px',
            cursor: 'pointer',
          }}
          title="ส่งออกรายงาน PDF / CSV"
        >
          <Icon name="Download" size={14} color="currentColor" />
          <span style={{ fontSize: '12px' }}>ส่งออก</span>
        </button>

        {/* User Profile Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              padding: '4px 8px 4px 4px',
              borderRadius: theme.radius.full,
              color: theme.colors.text,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: theme.colors.elevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>
              {user?.full_name?.split(' ')[0] || 'User'}
            </span>
            <Icon name="ChevronDown" size={12} color={theme.colors.textMuted} />
          </button>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '240px',
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.borderStrong}`,
                borderRadius: theme.radius.lg,
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                zIndex: 100,
              }}
            >
              <div style={{ paddingBottom: '10px', borderBottom: `1px solid ${theme.colors.border}` }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: theme.colors.text }}>
                  {user?.full_name}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>{user?.email}</div>
                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: theme.radius.full,
                      backgroundColor: isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: isAdmin ? '#a5b4fc' : theme.colors.textSecondary,
                    }}
                  >
                    สถานะ: {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งานทั่วไป (User)'}
                  </span>
                </div>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  <label style={{ fontSize: '11px', color: theme.colors.textMuted }}>
                    ชื่อที่แสดง
                    <input
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      autoFocus
                      required
                      minLength={2}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: '4px',
                        padding: '8px',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radius.sm,
                        backgroundColor: theme.colors.elevated,
                        color: theme.colors.text,
                      }}
                    />
                  </label>
                  {profileFeedback && <div role="alert" style={{ color: '#f87171', fontSize: '11px' }}>{profileFeedback}</div>}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile} style={{ flex: 1 }}>ยกเลิก</button>
                    <button type="submit" disabled={isSavingProfile} style={{ flex: 1 }}>{isSavingProfile ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setProfileName(user?.full_name || '');
                    setProfileFeedback(null);
                    setIsEditingProfile(true);
                  }}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textSecondary,
                    fontSize: '12px',
                    cursor: 'pointer',
                    borderRadius: theme.radius.sm,
                  }}
                >
                  <Icon name="Pencil" size={13} color="currentColor" />
                  <span>แก้ไขชื่อผู้ใช้</span>
                </button>
              )}

              {/* Logout */}
              <button
                onClick={async () => {
                  try {
                    await logout();
                    setShowUserMenu(false);
                  } catch (error) {
                    console.error('Failed to sign out:', error);
                    alert('ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
                  }
                }}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: theme.radius.sm,
                }}
              >
                <Icon name="LogOut" size={14} color="#ef4444" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
