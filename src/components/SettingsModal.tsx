import React from 'react';
import { theme, ThemeAccent, ThemeMode, themeAccentOptions } from '../lib/theme';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './Icon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { mode, accent, setMode, setAccent } = useTheme();
  if (!isOpen) return null;

  const themeModes: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'dark', label: 'มืด', icon: 'Moon' },
    { id: 'light', label: 'สว่าง', icon: 'Sun' },
  ];

  const selectAccent = (nextAccent: ThemeAccent) => setAccent(nextAccent);

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: theme.radius.xl,
          border: `1px solid ${theme.colors.borderStrong}`,
          backgroundColor: theme.colors.card,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <h2 id="settings-title" style={{ fontSize: '18px', color: theme.colors.text, fontWeight: 600 }}>
              การตั้งค่า
            </h2>
            <p style={{ fontSize: '12px', marginTop: '4px', color: theme.colors.textMuted }}>
              ปรับรูปแบบสีให้เหมาะกับการใช้งาน
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดการตั้งค่า"
            style={{ border: 'none', background: 'none', color: theme.colors.textMuted, cursor: 'pointer' }}
          >
            <Icon name="X" size={20} color="currentColor" />
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
            โหมดธีม
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {themeModes.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={mode === option.id}
                onClick={() => setMode(option.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: theme.radius.md,
                  border: `1px solid ${mode === option.id ? theme.colors.accent : theme.colors.border}`,
                  backgroundColor: mode === option.id ? theme.colors.accentBg : theme.colors.elevated,
                  color: theme.colors.text,
                  cursor: 'pointer',
                }}
              >
                <Icon name={option.icon} size={16} color="currentColor" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ color: theme.colors.text, fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>
            สีหลักของธีม
          </h3>
          <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '12px' }}>
            เลือกชุดสีสำหรับปุ่มและส่วนที่เน้น ระบบจะจดจำตัวเลือกนี้บนอุปกรณ์
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
            {themeAccentOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={accent === option.id}
                onClick={() => selectAccent(option.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 8px',
                  borderRadius: theme.radius.md,
                  border: `1px solid ${accent === option.id ? option.color : theme.colors.border}`,
                  backgroundColor: accent === option.id ? theme.colors.elevated : 'transparent',
                  color: theme.colors.text,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: '14px', height: '14px', flex: '0 0 14px', borderRadius: '50%', backgroundColor: option.color }} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
