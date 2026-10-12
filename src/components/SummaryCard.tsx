import React from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { FilterPeriod } from '../types';

export const SummaryCard: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => {
  const { stats, activeWorkspace, period, setPeriod } = useApp();

  const periods: { label: string; value: FilterPeriod }[] = [
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
    { label: 'ปีนี้', value: 'year' },
    { label: 'ทั้งหมด', value: 'all' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top bar with Period Tabs and Add Transaction Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Period Selector Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: theme.colors.card,
            padding: '3px',
            borderRadius: theme.radius.full,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          {periods.map((p) => {
            const isActive = period === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: theme.radius.full,
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  backgroundColor: isActive ? theme.colors.elevated : 'transparent',
                  color: isActive ? theme.colors.text : theme.colors.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onAddClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: theme.colors.primary,
            color: theme.colors.primaryText,
            border: 'none',
            padding: '8px 18px',
            borderRadius: theme.radius.full,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
            transition: 'transform 0.1s ease',
          }}
        >
          <Icon name="Plus" size={16} color="#09090b" />
          <span>บันทึกรายการ</span>
        </button>
      </div>

      {/* Grid of Summary Cards (Minimal & Modern) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Net Balance */}
        <div
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.xl,
            padding: '20px',
            border: `1px solid ${theme.colors.border}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              ยอดคงเหลือสุทธิ (Net Balance)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: theme.radius.md,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="Wallet" size={16} color={theme.colors.textSecondary} />
            </div>
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-1px',
              color: stats.netBalance >= 0 ? theme.colors.text : '#f43f5e',
            }}
          >
            {stats.netBalance >= 0 ? '' : '-'}
            {Math.abs(stats.netBalance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '6px', color: theme.colors.textMuted }}>
              ฿
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textDim }}>
            {activeWorkspace?.type === 'shop' ? 'กำไรดำเนินงานสุทธิ' : 'เงินคงเหลือในกระเป๋า'}
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.xl,
            padding: '20px',
            border: `1px solid ${theme.colors.incomeBorder}`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#34d399' }}>
              รายรับทั้งหมด (Income)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.incomeBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="ArrowDownLeft" size={16} color="#10b981" />
            </div>
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-1px',
              color: '#10b981',
            }}
          >
            +{stats.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '6px', color: '#10b981' }}>
              ฿
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textDim }}>
            {activeWorkspace?.type === 'shop' ? 'ยอดขายและรายรับรวม' : 'เงินเดือนและรายได้'}
          </div>
        </div>

        {/* Card 3: Total Expense */}
        <div
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.xl,
            padding: '20px',
            border: `1px solid ${theme.colors.expenseBorder}`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#fb7185' }}>
              รายจ่ายทั้งหมด (Expense)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.expenseBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="ArrowUpRight" size={16} color="#f43f5e" />
            </div>
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-1px',
              color: '#f43f5e',
            }}
          >
            -{stats.totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '6px', color: '#f43f5e' }}>
              ฿
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textDim }}>
            {activeWorkspace?.type === 'shop' ? 'ต้นทุนและค่าใช้จ่ายร้าน' : 'ค่าใช้จ่ายประจำวัน'}
          </div>
        </div>

        {/* Card 4: Savings Rate / Profit Margin */}
        <div
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.xl,
            padding: '20px',
            border: `1px solid ${theme.colors.border}`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              {activeWorkspace?.type === 'shop' ? 'อัตรากำไร (Margin)' : 'อัตราการออม (Savings)'}
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: theme.radius.md,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="PieChart" size={16} color="#818cf8" />
            </div>
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-1px',
              color: stats.savingsRate >= 20 ? '#10b981' : stats.savingsRate > 0 ? '#f59e0b' : theme.colors.textMuted,
            }}
          >
            {stats.savingsRate}%
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textDim }}>
            {stats.savingsRate >= 20 ? 'สัดส่วนทางการเงินยอดเยี่ยม' : 'ควบคุมรายจ่ายให้เหมาะสม'}
          </div>
        </div>
      </div>
    </div>
  );
};
