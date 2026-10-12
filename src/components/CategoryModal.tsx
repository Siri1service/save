import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { theme } from '../lib/theme';
import { Icon } from './Icon';
import { Category, TransactionType } from '../types';

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
  const { categories, addCategory, updateCategory, moveCategory, deleteCategory } = useApp();

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategories = categories
    .filter((c) => c.type === activeTab)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedColor(category.color);
    setSelectedIcon(category.icon || 'Tag');
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon('Tag');
  };

  const handleTabChange = (tab: TransactionType) => {
    if (editingCategory && editingCategory.type !== tab) cancelEdit();
    setFeedback(null);
    setActiveTab(tab);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
        cancelEdit();
      } else {
        await addCategory(name.trim(), activeTab, selectedIcon, selectedColor);
        setName('');
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      setFeedback(error instanceof Error ? `บันทึกหมวดหมู่ไม่สำเร็จ: ${error.message}` : 'บันทึกหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`คุณแน่ใจว่าต้องการลบหมวดหมู่ "${catName}"?`)) {
      try {
        await deleteCategory(id);
        if (editingCategory?.id === id) cancelEdit();
      } catch (error) {
        console.error('Failed to delete category:', error);
        setFeedback(error instanceof Error ? `ลบหมวดหมู่ไม่สำเร็จ: ${error.message}` : 'ลบหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่');
      }
    }
  };

  const handleMoveCategory = async (category: Category, direction: -1 | 1) => {
    try {
      await moveCategory(category.id, direction);
      setFeedback(null);
    } catch (error) {
      console.error('Failed to reorder category:', error);
      setFeedback(error instanceof Error ? `จัดลำดับไม่สำเร็จ: ${error.message}` : 'จัดลำดับไม่สำเร็จ กรุณาลองใหม่');
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
              เพิ่ม แก้ไข และจัดลำดับหมวดหมู่รายรับและรายจ่ายได้ตามต้องการ
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
            onClick={() => handleTabChange('expense')}
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
            onClick={() => handleTabChange('income')}
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
            {editingCategory ? 'แก้ไขหมวดหมู่' : `+ เพิ่มหมวดหมู่${activeTab === 'income' ? 'รายรับ' : 'รายจ่าย'}ใหม่`}
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
            {isSubmitting ? 'กำลังบันทึก...' : editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
          </button>
          {editingCategory && (
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSubmitting}
              style={{
                padding: '9px 16px',
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: 'transparent',
                color: theme.colors.textSecondary,
                fontSize: '13px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              ยกเลิก
            </button>
          )}
        </form>

        {feedback && (
          <div role="alert" style={{ color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>
            {feedback}
          </div>
        )}

        {/* Existing categories list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: theme.colors.textDim, fontSize: '13px' }}>
              ยังไม่มีหมวดหมู่อยู่ในรายการ
            </div>
          ) : (
            currentCategories.map((cat, index) => (
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => void handleMoveCategory(cat, -1)}
                    disabled={index === 0}
                    aria-label={`เลื่อน ${cat.name} ขึ้น`}
                    title="เลื่อนขึ้น"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: index === 0 ? theme.colors.textDim : theme.colors.textSecondary,
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Icon name="ChevronUp" size={16} color="currentColor" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMoveCategory(cat, 1)}
                    disabled={index === currentCategories.length - 1}
                    aria-label={`เลื่อน ${cat.name} ลง`}
                    title="เลื่อนลง"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: index === currentCategories.length - 1 ? theme.colors.textDim : theme.colors.textSecondary,
                      cursor: index === currentCategories.length - 1 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Icon name="ChevronDown" size={16} color="currentColor" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditCategory(cat)}
                    aria-label={`แก้ไข ${cat.name}`}
                    title="แก้ไขหมวดหมู่"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.colors.textSecondary,
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Icon name="Pencil" size={15} color="currentColor" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(cat.id, cat.name)}
                    aria-label={`ลบ ${cat.name}`}
                    title="ลบหมวดหมู่"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.colors.textDim,
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Icon name="Trash2" size={15} color="currentColor" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
