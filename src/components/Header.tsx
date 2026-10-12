import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenWorkspaceModal: () => void;
  onOpenInviteModal: () => void;
  onOpenCategoryModal: () => void;
  onOpenExportModal: () => void;
  activeTab: 'dashboard' | 'transactions' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWorkspaceModal,
  onOpenInviteModal,
  onOpenCategoryModal,
  onOpenExportModal,
  activeTab,
  setActiveTab,
}) => {
  const { user, isAdmin, logout, switchDemoRole } = useAuth();
  const { activeWorkspace } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
            <Icon name="Wallet" size={18} color="#09090b" />
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

              {/* Quick Role Switch for Demo/Testing */}
              <div style={{ padding: '8px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                <div style={{ fontSize: '11px', color: theme.colors.textDim, marginBottom: '6px' }}>
                  สลับบทบาททดสอบ (Demo Switch):
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      switchDemoRole('user');
                      setShowUserMenu(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '4px',
                      fontSize: '11px',
                      borderRadius: theme.radius.sm,
                      border: `1px solid ${!isAdmin ? '#10b981' : theme.colors.border}`,
                      backgroundColor: !isAdmin ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: !isAdmin ? '#10b981' : theme.colors.textMuted,
                      cursor: 'pointer',
                    }}
                  >
                    User
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setShowUserMenu(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '4px',
                      fontSize: '11px',
                      borderRadius: theme.radius.sm,
                      border: `1px solid ${isAdmin ? '#6366f1' : theme.colors.border}`,
                      backgroundColor: isAdmin ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: isAdmin ? '#a5b4fc' : theme.colors.textMuted,
                      cursor: 'pointer',
                    }}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
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
