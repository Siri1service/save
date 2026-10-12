import React from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';

export const CategoryBreakdown: React.FC = () => {
  const { stats, activeWorkspace } = useApp();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        marginTop: '8px',
      }}
    >
      {/* Expense by Category Breakdown */}
      <div
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          padding: '20px',
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.text }}>
              สัดส่วนรายจ่ายแยกตามหมวดหมู่
            </h3>
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              วิเคราะห์โครงสร้างต้นทุนและค่าใช้จ่าย
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.expenseBg,
              color: '#f43f5e',
            }}
          >
            {stats.expenseByCategory.length} หมวดหมู่
          </span>
        </div>

        {stats.expenseByCategory.length === 0 ? (
          <div
            style={{
              padding: '32px 0',
              textAlign: 'center',
              color: theme.colors.textDim,
              fontSize: '13px',
            }}
          >
            ยังไม่มีรายการรายจ่ายในช่วงเวลานี้
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stats.expenseByCategory.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: item.color || '#f43f5e',
                      }}
                    />
                    <span style={{ color: theme.colors.text, fontWeight: '500' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: theme.colors.textMuted, fontSize: '12px' }}>{item.percentage}%</span>
                    <span style={{ color: theme.colors.text, fontWeight: '600' }}>
                      -{item.amount.toLocaleString()} ฿
                    </span>
                  </div>
                </div>

                {/* Minimal Sleek Progress Bar */}
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: theme.radius.full,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: item.color || '#f43f5e',
                      borderRadius: theme.radius.full,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Income by Category Breakdown */}
      <div
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          padding: '20px',
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.text }}>
              สัดส่วนรายรับแยกตามหมวดหมู่
            </h3>
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              แหล่งที่มาของกระแสเงินสด
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.incomeBg,
              color: '#10b981',
            }}
          >
            {stats.incomeByCategory.length} หมวดหมู่
          </span>
        </div>

        {stats.incomeByCategory.length === 0 ? (
          <div
            style={{
              padding: '32px 0',
              textAlign: 'center',
              color: theme.colors.textDim,
              fontSize: '13px',
            }}
          >
            ยังไม่มีรายการรายรับในช่วงเวลานี้
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stats.incomeByCategory.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: item.color || '#10b981',
                      }}
                    />
                    <span style={{ color: theme.colors.text, fontWeight: '500' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: theme.colors.textMuted, fontSize: '12px' }}>{item.percentage}%</span>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>
                      +{item.amount.toLocaleString()} ฿
                    </span>
                  </div>
                </div>

                {/* Minimal Sleek Progress Bar */}
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: theme.radius.full,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: item.color || '#10b981',
                      borderRadius: theme.radius.full,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

