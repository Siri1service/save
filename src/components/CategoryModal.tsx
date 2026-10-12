import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { TransactionType } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#64748b', // Slate
];

const PRESET_ICONS = [
  'Tag',
  'Wallet',
  'TrendingUp',
  'Utensils',
  'Coffee',
  'Car',
  'ShoppingBag',
  'Receipt',
  'Home',
  'Users',
  'Heart',
  'Zap',
  'Coins',
  'Gift',
  'Briefcase',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, deleteCategory } = useApp();

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCategory(name.trim(), activeTab, selectedIcon, selectedColor);
      setName('');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`คุณแน่ใจว่าต้องการลบหมวดหมู่ "${catName}"?`)) {
      await deleteCategory(id);
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
              จัดการหมวดหมู่ (Categories)
            </h2>
            <p style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              เพิ่มและลบหมวดหมู่รายรับและรายจ่ายตามต้องการ
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

        {/* Income / Expense Switch */}
        <div
          style={{
            display: 'flex',
            backgroundColor: theme.colors.elevated,
            padding: '4px',
            borderRadius: theme.radius.full,
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: theme.radius.full,
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'expense' ? '600' : '400',
              backgroundColor: activeTab === 'expense' ? theme.colors.expense : 'transparent',
              color: activeTab === 'expense' ? '#ffffff' : theme.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            หมวดหมู่รายจ่าย ({categories.filter((c) => c.type === 'expense').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: theme.radius.full,
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'income' ? '600' : '400',
              backgroundColor: activeTab === 'income' ? theme.colors.income : 'transparent',
              color: activeTab === 'income' ? '#ffffff' : theme.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            หมวดหมู่รายรับ ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>

        {/* Add Category Form */}
        <form
          onSubmit={handleAddCategory}
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: theme.radius.lg,
            padding: '16px',
            marginBottom: '20px',
            border: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.text }}>
            + เพิ่มหมวดหมู่{activeTab === 'income' ? 'รายรับ' : 'รายจ่าย'}ใหม่
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '4px' }}>
              ชื่อหมวดหมู่ *
            </label>
            <input
              type="text"
              placeholder="เช่น ค่าโฆษณา, ค่าน้ำมัน, ช้อปปิ้ง"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: theme.colors.card,
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

          {/* Color palette picker */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              เลือกสีประจำหมวดหมู่
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: selectedColor === c ? '2px solid #ffffff' : 'none',
                    cursor: 'pointer',
                    boxShadow: selectedColor === c ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textMuted, marginBottom: '6px' }}>
              เลือกไอคอน
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '80px', overflowY: 'auto' }}>
              {PRESET_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  style={{
                    padding: '6px',
                    borderRadius: theme.radius.sm,
                    border: selectedIcon === iconName ? `1px solid ${selectedColor}` : `1px solid ${theme.colors.border}`,
                    backgroundColor: selectedIcon === iconName ? 'rgba(255, 255, 255, 0.1)' : theme.colors.card,
                    cursor: 'pointer',
                  }}
                >
                  <Icon name={iconName} size={16} color={selectedIcon === iconName ? selectedColor : theme.colors.textMuted} />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '9px 16px',
              borderRadius: theme.radius.md,
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: theme.colors.primaryText,
              fontSize: '13px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มหมวดหมู่'}
          </button>
        </form>

        {/* Existing categories list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: theme.colors.textDim, fontSize: '13px' }}>
              ยังไม่มีหมวดหมู่อยู่ในรายการ
            </div>
          ) : (
            currentCategories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.elevated,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: theme.radius.sm,
                      backgroundColor: `${cat.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={cat.icon || 'Tag'} size={15} color={cat.color} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: theme.colors.text }}>
                    {cat.name}
                  </span>
                  {cat.is_default && (
                    <span style={{ fontSize: '10px', color: theme.colors.textDim }}>
                      (พื้นฐาน)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.textDim,
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="ลบหมวดหมู่"
                >
                  <Icon name="Trash2" size={15} color="currentColor" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
