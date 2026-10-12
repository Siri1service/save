import React from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from '../components/Icon';
import { SummaryCard } from '../components/SummaryCard';
import { CategoryBreakdown } from '../components/Charts';
import { Transaction } from '../types';

interface DashboardScreenProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onViewAllTransactions: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onAddTransaction,
  onEditTransaction,
  onViewAllTransactions,
}) => {
  const { filteredTransactions, activeWorkspace } = useApp();

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Financial Summary */}
      <SummaryCard onAddClick={onAddTransaction} />

      {/* Visual Analytics / Progress Bars */}
      <CategoryBreakdown />

      {/* Recent Transactions Section */}
      <div
        style={{
          backgroundColor: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.text }}>
              รายการล่าสุด ({activeWorkspace?.name})
            </h3>
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              แสดง 5 รายการล่าสุดในบัญชี
            </span>
          </div>

          <button
            onClick={onViewAllTransactions}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <span>ดูประวัติทั้งหมด</span>
            <Icon name="ChevronRight" size={14} color="#818cf8" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: theme.colors.textDim,
              fontSize: '13px',
            }}
          >
            ยังไม่มีรายการบันทึกในกระเป๋านี้ กดปุ่ม "บันทึกรายการ" เพื่อเริ่มต้น
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors.elevated,
                  border: `1px solid ${theme.colors.border}`,
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
                        tx.type === 'income' ? theme.colors.incomeBg : theme.colors.expenseBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name={tx.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'}
                      size={18}
                      color={tx.type === 'income' ? '#10b981' : '#f43f5e'}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.text }}>
                        {tx.title}
                      </span>
                      {tx.category_name && (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '1px 6px',
                            borderRadius: theme.radius.full,
                            backgroundColor: `${tx.category_color || '#6366f1'}22`,
                            color: tx.category_color || '#a5b4fc',
                          }}
                        >
                          {tx.category_name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textMuted, marginTop: '2px' }}>
                      {tx.date} {tx.notes ? `• ${tx.notes}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: tx.type === 'income' ? '#10b981' : '#f43f5e',
                    }}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                  </div>
                  <div style={{ fontSize: '10px', color: theme.colors.textDim }}>คลิกเพื่อแก้ไข</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

