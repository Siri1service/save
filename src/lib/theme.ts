export const theme = {
  colors: {
    bg: '#09090b',
    surface: '#121215',
    card: '#18181b',
    cardHover: '#202024',
    elevated: '#27272a',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    
    // Minimal monochromatic text
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    textDim: '#52525b',

    // Accents
    primary: '#ffffff',
    primaryText: '#09090b',
    
    // Status & Financial indicators
    income: '#10b981',
    incomeBg: 'rgba(16, 185, 129, 0.12)',
    incomeBorder: 'rgba(16, 185, 129, 0.25)',

    expense: '#f43f5e',
    expenseBg: 'rgba(244, 63, 94, 0.12)',
    expenseBorder: 'rgba(244, 63, 94, 0.25)',

    accent: '#6366f1',
    accentBg: 'rgba(99, 102, 241, 0.15)',

    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.12)',

    info: '#0ea5e9',
    infoBg: 'rgba(14, 165, 233, 0.12)',
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
};

export type ThemeMode = 'dark' | 'light';
export type ThemeAccent = 'mono' | 'blue' | 'green' | 'purple' | 'rose' | 'amber';

export const themeAccentOptions: { id: ThemeAccent; label: string; color: string }[] = [
  { id: 'mono', label: 'โมโนโครม', color: '#71717a' },
  { id: 'blue', label: 'น้ำเงิน', color: '#2563eb' },
  { id: 'green', label: 'เขียว', color: '#059669' },
  { id: 'purple', label: 'ม่วง', color: '#7c3aed' },
  { id: 'rose', label: 'ชมพู', color: '#e11d48' },
  { id: 'amber', label: 'ส้มทอง', color: '#d97706' },
];

const accentPalettes: Record<ThemeAccent, { accent: string; accentBg: string; primary: string }> = {
  mono: { accent: '#6366f1', accentBg: 'rgba(99, 102, 241, 0.15)', primary: '#ffffff' },
  blue: { accent: '#2563eb', accentBg: 'rgba(37, 99, 235, 0.15)', primary: '#2563eb' },
  green: { accent: '#059669', accentBg: 'rgba(5, 150, 105, 0.15)', primary: '#059669' },
  purple: { accent: '#7c3aed', accentBg: 'rgba(124, 58, 237, 0.15)', primary: '#7c3aed' },
  rose: { accent: '#e11d48', accentBg: 'rgba(225, 29, 72, 0.15)', primary: '#e11d48' },
  amber: { accent: '#d97706', accentBg: 'rgba(217, 119, 6, 0.15)', primary: '#d97706' },
};

const themePalettes: Record<ThemeMode, typeof theme.colors> = {
  dark: {
    ...theme.colors,
    bg: '#09090b',
    surface: '#121215',
    card: '#18181b',
    cardHover: '#202024',
    elevated: '#27272a',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    textDim: '#52525b',
    primary: '#ffffff',
    primaryText: '#09090b',
  },
  light: {
    ...theme.colors,
    bg: '#f4f4f5',
    surface: '#ffffff',
    card: '#ffffff',
    cardHover: '#f4f4f5',
    elevated: '#e4e4e7',
    border: 'rgba(24, 24, 27, 0.1)',
    borderStrong: 'rgba(24, 24, 27, 0.18)',
    text: '#18181b',
    textSecondary: '#3f3f46',
    textMuted: '#71717a',
    textDim: '#a1a1aa',
    primary: '#18181b',
    primaryText: '#ffffff',
  },
};

export const applyTheme = (mode: ThemeMode, accent: ThemeAccent = 'mono'): void => {
  const accentColors = accentPalettes[accent];
  Object.assign(theme.colors, themePalettes[mode], {
    primary: accent === 'mono' ? (mode === 'dark' ? '#ffffff' : '#18181b') : accentColors.primary,
    primaryText: accent === 'mono' ? (mode === 'dark' ? '#09090b' : '#ffffff') : '#ffffff',
    accent: accentColors.accent,
    accentBg: accentColors.accentBg,
  });
  document.documentElement.dataset.theme = mode;
  document.documentElement.dataset.accent = accent;
  document.documentElement.style.colorScheme = mode;
};
