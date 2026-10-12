import React from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from '../components/Icon';
import { FilterPeriod, Transaction } from '../types';

interface TransactionsScreenProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenExportModal: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  onAddTransaction,
  onEditTransaction,
  onOpenExportModal,
}) => {
  const {
    filteredTransactions,
    period,
    setPeriod,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    stats,
    activeWorkspace,
  } = useApp();

  const periods: { label: string; value: FilterPeriod }[] = [
    { label: 'เดือนนี้', value: 'month' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'วันนี้', value: 'today' },
    { label: 'ปีนี้', value: 'year' },
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'กำหนดเอง', value: 'custom' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header with Title and Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.text }}>
            ประวัติรายรับ-รายจ่าย
          </h1>
          <p style={{ fontSize: '13px', color: theme.colors.textMuted }}>
            {activeWorkspace?.name} • ทั้งหมด {filteredTransactions.length} รายการ
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onOpenExportModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              padding: '8px 14px',
              borderRadius: theme.radius.md,
              color: theme.colors.text,
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <Icon name="Download" size={15} color="currentColor" />
            <span>ส่งออก PDF / CSV</span>
          </button>

          <button
            onClick={onAddTransaction}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: theme.colors.primary,
              border: 'none',
              padding: '8px 16px',
              borderRadius: theme.radius.md,
              color: theme.colors.primaryText,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Icon name="Plus" size={15} color="#09090b" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div
            style={{
              flex: 1,
              minWidth: '220px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: theme.colors.elevated,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              padding: '8px 12px',
            }}
          >
            <Icon name="Search" size={15} color={theme.colors.textMuted} />
            <input
              type="text"
              placeholder="ค้นหารายการ, หมวดหมู่, หรือหมายเหตุ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: theme.colors.text,
                fontSize: '13px',
                outline: 'none',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}
              >
                <Icon name="X" size={14} color="currentColor" />
              </button>
            )}
          </div>

          {/* Type Filter Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: theme.colors.elevated,
              padding: '3px',
              borderRadius: theme.radius.md,
            }}
          >
            {(['all', 'income', 'expense'] as const).map((t) => {
              const labelMap = { all: 'ทั้งหมด', income: 'เฉพาะรายรับ', expense: 'เฉพาะรายจ่าย' };
              const isSelected = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: theme.radius.sm,
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: isSelected ? '600' : '400',
                    backgroundColor: isSelected ? theme.colors.card : 'transparent',
                    color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  {labelMap[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: theme.colors.textDim, marginRight: '4px' }}>ช่วงเวลา:</span>
          {periods.map((p) => {
            const isSelected = period === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: theme.radius.full,
                  fontSize: '11px',
                  border: isSelected ? `1px solid ${theme.colors.borderStrong}` : `1px solid ${theme.colors.border}`,
                  backgroundColor: isSelected ? theme.colors.elevated : 'transparent',
                  color: isSelected ? theme.colors.text : theme.colors.textMuted,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Range Picker */}
        {period === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>ตั้งแต่วันที่:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{
                backgroundColor: theme.colors.elevated,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.sm,
                padding: '6px 10px',
                color: theme.colors.text,
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>ถึงวันที่:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{
                backgroundColor: theme.colors.elevated,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.sm,
                padding: '6px 10px',
                color: theme.colors.text,
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Mini Summary Stats for Current Filter */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
        }}
      >
        <div style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, padding: '12px' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>รายรับช่วงนี้</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>
            +{stats.totalIncome.toLocaleString()} ฿
          </div>
        </div>

        <div style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, padding: '12px' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>รายจ่ายช่วงนี้</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#f43f5e', marginTop: '2px' }}>
            -{stats.totalExpense.toLocaleString()} ฿
          </div>
        </div>

        <div style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, padding: '12px' }}>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>สุทธิ (Balance)</div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: stats.netBalance >= 0 ? theme.colors.text : '#f43f5e',
              marginTop: '2px',
            }}
          >
            {stats.netBalance >= 0 ? '+' : ''}{stats.netBalance.toLocaleString()} ฿
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredTransactions.length === 0 ? (
          <div
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              padding: '60px 20px',
              textAlign: 'center',
              color: theme.colors.textDim,
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <Icon name="Inbox" size={32} color={theme.colors.textDim} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.textSecondary }}>
              ไม่พบรายการตรงกับเงื่อนไขที่เลือก
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มรายการ" ด้านบน
            </div>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onEditTransaction(tx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: theme.radius.md,
                    backgroundColor:
                      tx.type === 'income' ? theme.colors.incomeBg : theme.colors.expenseBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    name={tx.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'}
                    size={20}
                    color={tx.type === 'income' ? '#10b981' : '#f43f5e'}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
                      {tx.title}
                    </span>
                    {tx.category_name && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 8px',
                          borderRadius: theme.radius.full,
                          backgroundColor: `${tx.category_color || '#6366f1'}22`,
                          color: tx.category_color || '#a5b4fc',
                          fontWeight: '500',
                        }}
                      >
                        {tx.category_name}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.colors.textMuted, marginTop: '2px' }}>
                    <span>{tx.date}</span>
                    {tx.notes && <span> • {tx.notes}</span>}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: tx.type === 'income' ? '#10b981' : '#f43f5e',
                  }}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                </div>
                <div style={{ fontSize: '11px', color: theme.colors.textDim }}>คลิกเพื่อแก้ไข</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

