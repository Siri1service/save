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

export const applyTheme = (mode: ThemeMode): void => {
  Object.assign(theme.colors, themePalettes[mode]);
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
};
