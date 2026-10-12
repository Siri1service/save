import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToCSV, exportToPDF } from '../lib/exportUtils';
import { theme } from '../lib/theme';
import { Icon } from './Icon';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { filteredTransactions, transactions, activeWorkspace, period } = useApp();

  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [dataScope, setDataScope] = useState<'filtered' | 'all'>('filtered');

  if (!isOpen || !activeWorkspace) return null;

  const targetTransactions = dataScope === 'filtered' ? filteredTransactions : transactions.filter((t) => t.workspace_id === activeWorkspace.id);

  const handleExport = async () => {
    if (targetTransactions.length === 0) {
      alert('ไม่มีรายการข้อมูลสำหรับส่งออก');
      return;
    }

    const periodName = dataScope === 'filtered' ? `ช่วง_${period}` : 'ทั้งหมด';

    try {
      if (format === 'csv') {
        exportToCSV(targetTransactions, activeWorkspace, periodName);
      } else {
        await exportToPDF(targetTransactions, activeWorkspace, periodName);
      }
      onClose();
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('ไม่สามารถส่งออกรายงานได้ กรุณาลองใหม่อีกครั้ง');
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
          maxWidth: '460px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.text }}>
              ส่งออกรายงานการเงิน
            </h2>
            <p style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              ดาวน์โหลดประวัติรายรับ-รายจ่ายในรูปแบบ PDF หรือ CSV
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

        {/* Format Selector: PDF vs CSV */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '8px' }}>
            เลือกรูปแบบไฟล์ที่ต้องการ *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* PDF Option */}
            <div
              onClick={() => setFormat('pdf')}
              style={{
                border: format === 'pdf' ? '2px solid #ffffff' : `1px solid ${theme.colors.border}`,
                backgroundColor: format === 'pdf' ? 'rgba(255, 255, 255, 0.08)' : theme.colors.elevated,
                borderRadius: theme.radius.lg,
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Icon name="FileText" size={24} color="#f43f5e" />
                {format === 'pdf' && <Icon name="CheckCircle2" size={16} color="#ffffff" />}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>เอกสาร PDF</div>
                <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>จัดหน้ารายงานสวยงาม พร้อมพิมพ์/แชร์</div>
              </div>
            </div>

            {/* CSV Option */}
            <div
              onClick={() => setFormat('csv')}
              style={{
                border: format === 'csv' ? '2px solid #ffffff' : `1px solid ${theme.colors.border}`,
                backgroundColor: format === 'csv' ? 'rgba(255, 255, 255, 0.08)' : theme.colors.elevated,
                borderRadius: theme.radius.lg,
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Icon name="Table" size={24} color="#10b981" />
                {format === 'csv' && <Icon name="CheckCircle2" size={16} color="#ffffff" />}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>ไฟล์ CSV / Excel</div>
                <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>รองรับภาษาไทย เปิดด้วย MS Excel ได้ทันที</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Scope Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
            ขอบเขตข้อมูลที่ต้องการส่งออก
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setDataScope('filtered')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: theme.radius.md,
                border: dataScope === 'filtered' ? '1px solid #6366f1' : `1px solid ${theme.colors.border}`,
                backgroundColor: dataScope === 'filtered' ? 'rgba(99, 102, 241, 0.15)' : theme.colors.elevated,
                color: dataScope === 'filtered' ? '#a5b4fc' : theme.colors.textSecondary,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ตามตัวกรองปัจจุบัน ({filteredTransactions.length} รายการ)
            </button>
            <button
              type="button"
              onClick={() => setDataScope('all')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: theme.radius.md,
                border: dataScope === 'all' ? '1px solid #6366f1' : `1px solid ${theme.colors.border}`,
                backgroundColor: dataScope === 'all' ? 'rgba(99, 102, 241, 0.15)' : theme.colors.elevated,
                color: dataScope === 'all' ? '#a5b4fc' : theme.colors.textSecondary,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ข้อมูลทั้งหมด ({transactions.filter((t) => t.workspace_id === activeWorkspace.id).length} รายการ)
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
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
            onClick={handleExport}
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
              cursor: 'pointer',
            }}
          >
            <Icon name="Download" size={16} color="#09090b" />
            <span>ดาวน์โหลด ({format.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
