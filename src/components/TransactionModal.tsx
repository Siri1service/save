import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
}) => {
  const { categories, addTransaction, updateTransaction, deleteTransaction } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories by selected transaction type
  const availableCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setTitle(editingTransaction.title);
      setCategoryId(editingTransaction.category_id || '');
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingTransaction, isOpen]);

  // Set default category when type changes if none selected
  useEffect(() => {
    if (!categoryId && availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }
    if (!title.trim()) {
      alert('กรุณากรอกชื่อรายการ');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          type,
          amount: parsedAmount,
          title: title.trim(),
          category_id: categoryId,
          category_name: selectedCat?.name,
          category_color: selectedCat?.color,
          date,
          notes: notes.trim(),
        });
      } else {
        await addTransaction({
          type,
          amount: parsedAmount,
          title: title.trim(),
          category_id: categoryId,
          category_name: selectedCat?.name,
          category_color: selectedCat?.color,
          date,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTransaction) return;
    if (confirm('ยืนยันการลบรายการนี้?')) {
      await deleteTransaction(editingTransaction.id);
      onClose();
    }
  };

  const quickAmounts = [100, 300, 500, 1000, 3000];

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
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.text }}>
            {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h2>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Income vs Expense Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: theme.colors.elevated,
              padding: '4px',
              borderRadius: theme.radius.full,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: theme.radius.full,
                border: 'none',
                fontSize: '13px',
                fontWeight: type === 'expense' ? '600' : '400',
                backgroundColor: type === 'expense' ? theme.colors.expense : 'transparent',
                color: type === 'expense' ? '#ffffff' : theme.colors.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: theme.radius.full,
                border: 'none',
                fontSize: '13px',
                fontWeight: type === 'income' ? '600' : '400',
                backgroundColor: type === 'income' ? theme.colors.income : 'transparent',
                color: type === 'income' ? '#ffffff' : theme.colors.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              จำนวนเงิน (บาท) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  backgroundColor: theme.colors.elevated,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: '12px 14px',
                  color: theme.colors.text,
                  fontSize: '24px',
                  fontWeight: '700',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textMuted,
                  fontSize: '14px',
                }}
              >
                THB
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String((parseFloat(amount) || 0) + q))}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.full,
                    padding: '3px 10px',
                    fontSize: '11px',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  +{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              ชื่อรายการ *
            </label>
            <input
              type="text"
              placeholder="เช่น ข้าวกลางวัน, กาแฟ, ยอดขายหน้าร้าน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: theme.colors.elevated,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: '10px 14px',
                color: theme.colors.text,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              หมวดหมู่ *
            </label>
            {availableCategories.length === 0 ? (
              <div style={{ fontSize: '12px', color: theme.colors.warning }}>
                ไม่มีหมวดหมู่สำหรับประเภทนี้ กรุณาเพิ่มหมวดหมู่ในเมนู "หมวดหมู่"
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '130px', overflowY: 'auto' }}>
                {availableCategories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: theme.radius.full,
                        border: isSelected
                          ? `1px solid ${c.color || theme.colors.primary}`
                          : `1px solid ${theme.colors.border}`,
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : theme.colors.elevated,
                        color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: c.color || '#6366f1',
                        }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              วันที่
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: theme.colors.elevated,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: '10px 14px',
                color: theme.colors.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              placeholder="บันทึกรายละเอียดเพิ่มเติม..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                backgroundColor: theme.colors.elevated,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: '8px 12px',
                color: theme.colors.text,
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {editingTransaction && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '10px 16px',
                  borderRadius: theme.radius.md,
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ลบรายการ
              </button>
            )}
            <button
              type="button"
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
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '10px 16px',
                borderRadius: theme.radius.md,
                border: 'none',
                backgroundColor: theme.colors.primary,
                color: theme.colors.primaryText,
                fontSize: '13px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
