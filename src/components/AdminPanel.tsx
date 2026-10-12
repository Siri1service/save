import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { UserProfile } from '../types';

export const AdminPanel: React.FC = () => {
  const {
    allUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    emailTemplates,
    emailLogs,
    sendEmailToUser,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'inactive_90d' | 'suspended'>('all');
  
  // Email sending modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<UserProfile | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(emailTemplates[0]?.id || 'inactivity_90d');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Active tab inside Admin Panel
  const [adminTab, setAdminTab] = useState<'users' | 'email_logs'>('users');

  // Days calculation helper
  const getDaysSinceLastActive = (dateStr?: string) => {
    if (!dateStr) return 999;
    const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filtered users
  const filteredUsers = allUsers.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    const daysInactive = getDaysSinceLastActive(u.last_sign_in_at);

    if (filterMode === 'inactive_90d') {
      return daysInactive >= 90;
    }
    if (filterMode === 'suspended') {
      return u.status === 'suspended';
    }
    return true;
  });

  const inactiveUsersCount = allUsers.filter((u) => getDaysSinceLastActive(u.last_sign_in_at) >= 90).length;

  // Open email modal for a specific user
  const handleOpenEmailModal = (user: UserProfile, defaultTemplateId: string = 'inactivity_90d') => {
    setSelectedUserForEmail(user);
    setSelectedTemplateId(defaultTemplateId);

    const template = emailTemplates.find((t) => t.id === defaultTemplateId) || emailTemplates[0];
    const days = getDaysSinceLastActive(user.last_sign_in_at);
    const lastActiveFormatted = user.last_sign_in_at
      ? `${new Date(user.last_sign_in_at).toLocaleDateString('th-TH')} (${days} วันที่แล้ว)`
      : 'ไม่มีข้อมูล';

    const personalizedSubject = template.subject
      .replace(/{NAME}/g, user.full_name || user.email)
      .replace(/{EMAIL}/g, user.email);

    const personalizedContent = template.content
      .replace(/{NAME}/g, user.full_name || user.email)
      .replace(/{EMAIL}/g, user.email)
      .replace(/{LAST_ACTIVE}/g, lastActiveFormatted);

    setEmailSubject(personalizedSubject);
    setEmailBody(personalizedContent);
    setIsEmailModalOpen(true);
  };

  // Change template in email modal
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!selectedUserForEmail) return;

    const template = emailTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const days = getDaysSinceLastActive(selectedUserForEmail.last_sign_in_at);
    const lastActiveFormatted = selectedUserForEmail.last_sign_in_at
      ? `${new Date(selectedUserForEmail.last_sign_in_at).toLocaleDateString('th-TH')} (${days} วันที่แล้ว)`
      : 'ไม่มีข้อมูล';

    setEmailSubject(
      template.subject
        .replace(/{NAME}/g, selectedUserForEmail.full_name || selectedUserForEmail.email)
        .replace(/{EMAIL}/g, selectedUserForEmail.email)
    );
    setEmailBody(
      template.content
        .replace(/{NAME}/g, selectedUserForEmail.full_name || selectedUserForEmail.email)
        .replace(/{EMAIL}/g, selectedUserForEmail.email)
        .replace(/{LAST_ACTIVE}/g, lastActiveFormatted)
    );
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEmail) return;

    setIsSending(true);
    try {
      await sendEmailToUser(
        selectedUserForEmail.email,
        selectedTemplateId,
        emailSubject,
        emailBody,
        selectedUserForEmail.id
      );
      alert(`ส่งอีเมลไปยัง ${selectedUserForEmail.email} เรียบร้อยแล้ว`);
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งอีเมล');
    } finally {
      setIsSending(false);
    }
  };

  // Batch notify all > 90d inactive users
  const handleBatchNotifyInactive = async () => {
    const inactiveUsers = allUsers.filter((u) => getDaysSinceLastActive(u.last_sign_in_at) >= 90);
    if (inactiveUsers.length === 0) {
      alert('ไม่มีผู้ใช้ที่ไม่ได้เข้าใช้งานเกิน 90 วัน');
      return;
    }

    if (
      confirm(
        `ยืนยันส่งอีเมลแจ้งเตือนลบฐานข้อมูลให้แก่ผู้ใช้ที่ไม่ได้เข้าใช้งานเกิน 90 วัน ทั้งหมด ${inactiveUsers.length} ท่าน?`
      )
    ) {
      for (const u of inactiveUsers) {
        const days = getDaysSinceLastActive(u.last_sign_in_at);
        const lastActiveFormatted = `${new Date(u.last_sign_in_at).toLocaleDateString('th-TH')} (${days} วันที่แล้ว)`;
        const template = emailTemplates.find((t) => t.id === 'inactivity_90d') || emailTemplates[0];

        const personalizedSubject = template.subject
          .replace(/{NAME}/g, u.full_name || u.email)
          .replace(/{EMAIL}/g, u.email);

        const personalizedContent = template.content
          .replace(/{NAME}/g, u.full_name || u.email)
          .replace(/{EMAIL}/g, u.email)
          .replace(/{LAST_ACTIVE}/g, lastActiveFormatted);

        await sendEmailToUser(u.email, 'inactivity_90d', personalizedSubject, personalizedContent, u.id);
      }
      alert(`ดำเนินการส่งการแจ้งเตือนสำเร็จทั้งหมด ${inactiveUsers.length} ราย`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Metrics */}
      <div
        style={{
          backgroundColor: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: theme.radius.full,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              ADMINISTRATION
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.text }}>
              ระบบควบคุมและจัดการผู้ใช้ (Admin Dashboard)
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: theme.colors.textMuted, marginTop: '4px' }}>
            จัดการบัญชีผู้ใช้, ตรวจสอบสถานะการเข้าใช้งาน และส่ง Email แจ้งเตือนตามเงื่อนไข
          </p>
        </div>

        {/* Action: Bulk Alert */}
        {inactiveUsersCount > 0 && (
          <button
            onClick={handleBatchNotifyInactive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '9px 16px',
              borderRadius: theme.radius.lg,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Icon name="AlertTriangle" size={16} color="#f87171" />
            <span>ส่งแจ้งเตือนผู้ใช้ไม่เข้าใช้งาน &gt; 90 วัน ({inactiveUsersCount} คน)</span>
          </button>
        )}
      </div>

      {/* Admin Tab Switcher: Users vs Email Logs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '8px' }}>
        <button
          onClick={() => setAdminTab('users')}
          style={{
            padding: '8px 16px',
            borderRadius: theme.radius.md,
            border: 'none',
            fontSize: '13px',
            fontWeight: adminTab === 'users' ? '600' : '400',
            backgroundColor: adminTab === 'users' ? theme.colors.elevated : 'transparent',
            color: adminTab === 'users' ? theme.colors.text : theme.colors.textSecondary,
            cursor: 'pointer',
          }}
        >
          รายชื่อผู้ใช้งานทั้งหมด ({allUsers.length})
        </button>
        <button
          onClick={() => setAdminTab('email_logs')}
          style={{
            padding: '8px 16px',
            borderRadius: theme.radius.md,
            border: 'none',
            fontSize: '13px',
            fontWeight: adminTab === 'email_logs' ? '600' : '400',
            backgroundColor: adminTab === 'email_logs' ? theme.colors.elevated : 'transparent',
            color: adminTab === 'email_logs' ? theme.colors.text : theme.colors.textSecondary,
            cursor: 'pointer',
          }}
        >
          ประวัติการส่ง Email ({emailLogs.length})
        </button>
      </div>

      {adminTab === 'users' ? (
        <>
          {/* Search & Filter bar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: '8px 12px',
                  width: '100%',
                }}
              >
                <Icon name="Search" size={15} color={theme.colors.textMuted} />
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อ หรือ Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: theme.colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setFilterMode('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: theme.radius.full,
                  fontSize: '12px',
                  border: `1px solid ${filterMode === 'all' ? theme.colors.borderStrong : theme.colors.border}`,
                  backgroundColor: filterMode === 'all' ? theme.colors.elevated : 'transparent',
                  color: filterMode === 'all' ? theme.colors.text : theme.colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                ทั้งหมด ({allUsers.length})
              </button>
              <button
                onClick={() => setFilterMode('inactive_90d')}
                style={{
                  padding: '6px 12px',
                  borderRadius: theme.radius.full,
                  fontSize: '12px',
                  border: `1px solid ${filterMode === 'inactive_90d' ? '#ef4444' : theme.colors.border}`,
                  backgroundColor: filterMode === 'inactive_90d' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  color: filterMode === 'inactive_90d' ? '#ef4444' : theme.colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                ไม่ได้ใช้งาน &gt; 90 วัน ({inactiveUsersCount})
              </button>
              <button
                onClick={() => setFilterMode('suspended')}
                style={{
                  padding: '6px 12px',
                  borderRadius: theme.radius.full,
                  fontSize: '12px',
                  border: `1px solid ${filterMode === 'suspended' ? '#f59e0b' : theme.colors.border}`,
                  backgroundColor: filterMode === 'suspended' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: filterMode === 'suspended' ? '#f59e0b' : theme.colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                ถูกระงับ ({allUsers.filter((u) => u.status === 'suspended').length})
              </button>
            </div>
          </div>

          {/* User Table (Modern Card Layout) */}
          <div
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.colors.elevated, color: theme.colors.textMuted, borderBottom: `1px solid ${theme.colors.border}` }}>
                    <th style={{ padding: '12px 16px' }}>ผู้ใช้งาน</th>
                    <th style={{ padding: '12px 16px' }}>บทบาท (Role)</th>
                    <th style={{ padding: '12px 16px' }}>สถานะ</th>
                    <th style={{ padding: '12px 16px' }}>เข้าใช้งานล่าสุด</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: theme.colors.textDim }}>
                        ไม่พบข้อมูลผู้ใช้ที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const daysInactive = getDaysSinceLastActive(u.last_sign_in_at);
                      const isDangerInactive = daysInactive >= 90;

                      return (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: `1px solid ${theme.colors.border}`,
                            transition: 'background 0.1s ease',
                          }}
                        >
                          {/* User info */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  backgroundColor: theme.colors.elevated,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: theme.colors.text,
                                }}
                              >
                                {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: theme.colors.text }}>{u.full_name}</div>
                                <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as 'user' | 'admin')}
                              style={{
                                backgroundColor: theme.colors.elevated,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: theme.radius.sm,
                                padding: '4px 8px',
                                color: u.role === 'admin' ? '#a5b4fc' : theme.colors.textSecondary,
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              onClick={() => updateUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: theme.radius.full,
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                backgroundColor:
                                  u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: u.status === 'active' ? '#10b981' : '#f87171',
                              }}
                              title="คลิกเพื่อสลับสถานะ"
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: u.status === 'active' ? '#10b981' : '#f87171',
                                }}
                              />
                              {u.status === 'active' ? 'ปกติ (Active)' : 'ระงับ (Suspended)'}
                            </button>
                          </td>

                          {/* Last Active */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: theme.colors.text, fontSize: '12px' }}>
                                {u.last_sign_in_at
                                  ? new Date(u.last_sign_in_at).toLocaleDateString('th-TH')
                                  : '-'}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: isDangerInactive ? '600' : '400',
                                  color: isDangerInactive ? '#ef4444' : theme.colors.textDim,
                                }}
                              >
                                {daysInactive === 0 ? 'วันนี้' : `${daysInactive} วันที่แล้ว`}
                                {isDangerInactive && ' (⚠️ เกิน 90 วัน)'}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              {/* Send Email Button */}
                              <button
                                onClick={() => handleOpenEmailModal(u, isDangerInactive ? 'inactivity_90d' : 'welcome')}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                  border: '1px solid rgba(99, 102, 241, 0.3)',
                                  color: '#a5b4fc',
                                  padding: '5px 10px',
                                  borderRadius: theme.radius.md,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                                title="ส่งอีเมลแจ้งเตือนถึงผู้ใช้นี้"
                              >
                                <Icon name="Mail" size={14} color="currentColor" />
                                <span>ส่ง Email</span>
                              </button>

                              {/* Delete User Button */}
                              <button
                                onClick={() => {
                                  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ ${u.email}? ข้อมูลทั้งหมดจะถูกลบถาวร`)) {
                                    deleteUser(u.id);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: theme.colors.textDim,
                                  cursor: 'pointer',
                                  padding: '5px',
                                }}
                                title="ลบผู้ใช้"
                              >
                                <Icon name="Trash2" size={15} color="currentColor" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Email Logs Table */
        <div
          style={{
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: theme.colors.elevated, color: theme.colors.textMuted, borderBottom: `1px solid ${theme.colors.border}` }}>
                  <th style={{ padding: '12px 16px' }}>ผู้รับ (Recipient)</th>
                  <th style={{ padding: '12px 16px' }}>หัวข้อ (Subject)</th>
                  <th style={{ padding: '12px 16px' }}>ประเภทเทมเพลต</th>
                  <th style={{ padding: '12px 16px' }}>วันที่ส่ง</th>
                  <th style={{ padding: '12px 16px' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: theme.colors.textDim }}>
                      ยังไม่มีประวัติการส่งอีเมล
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500', color: theme.colors.text }}>
                        {log.recipient_email}
                      </td>
                      <td style={{ padding: '12px 16px', color: theme.colors.textSecondary }}>
                        {log.subject}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: theme.radius.full,
                            backgroundColor:
                              log.template_type === 'inactivity_90d'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(99, 102, 241, 0.15)',
                            color: log.template_type === 'inactivity_90d' ? '#ef4444' : '#a5b4fc',
                          }}
                        >
                          {log.template_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: theme.colors.textMuted }}>
                        {new Date(log.created_at).toLocaleString('th-TH')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                          ✓ สำเร็จ
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Dispatcher Modal */}
      {isEmailModalOpen && selectedUserForEmail && (
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
          onClick={() => setIsEmailModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.borderStrong}`,
              borderRadius: theme.radius.xl,
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.text }}>
                  ส่ง Email ถึงผู้ใช้งาน
                </h2>
                <p style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                  ผู้รับ: {selectedUserForEmail.full_name} ({selectedUserForEmail.email})
                </p>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
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

            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Template selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                  เลือกรูปแบบเทมเพลตอีเมล (Template) *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: theme.colors.elevated,
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
                  {emailTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                  หัวข้ออีเมล (Subject) *
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: theme.colors.elevated,
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

              {/* Body */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
                  เนื้อหาอีเมล (Body) *
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  required
                  rows={8}
                  style={{
                    width: '100%',
                    backgroundColor: theme.colors.elevated,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.md,
                    padding: '10px 12px',
                    color: theme.colors.text,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: theme.radius.md,
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.elevated,
                    color: theme.colors.textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: theme.radius.md,
                    border: 'none',
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.primaryText,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Icon name="Send" size={15} color="#09090b" />
                  <span>{isSending ? 'กำลังส่ง...' : 'ยืนยันและส่งอีเมล'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

