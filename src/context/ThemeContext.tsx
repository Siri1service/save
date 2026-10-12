import React, { createContext, useContext, useState } from 'react';
import { applyTheme, ThemeMode } from '../lib/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSavedTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem('save_app_theme');
  return savedTheme === 'light' ? 'light' : 'dark';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const initialMode = getSavedTheme();
    applyTheme(initialMode);
    return initialMode;
  });

  const toggleTheme = () => {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    applyTheme(nextMode);
    localStorage.setItem('save_app_theme', nextMode);
    setMode(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
