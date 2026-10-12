import React, { createContext, useContext, useState } from 'react';
import { applyTheme, ThemeAccent, ThemeMode } from '../lib/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  accent: ThemeAccent;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSavedTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem('save_app_theme');
  return savedTheme === 'light' ? 'light' : 'dark';
};

const getSavedAccent = (): ThemeAccent => {
  const savedAccent = localStorage.getItem('save_app_theme_accent');
  return savedAccent === 'blue' || savedAccent === 'green' || savedAccent === 'purple'
    || savedAccent === 'rose' || savedAccent === 'amber' ? savedAccent : 'mono';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accent, setAccentState] = useState<ThemeAccent>(() => getSavedAccent());
  const [mode, setMode] = useState<ThemeMode>(() => {
    const initialMode = getSavedTheme();
    applyTheme(initialMode, getSavedAccent());
    return initialMode;
  });

  const changeMode = (nextMode: ThemeMode) => {
    applyTheme(nextMode, accent);
    localStorage.setItem('save_app_theme', nextMode);
    setMode(nextMode);
  };

  const changeAccent = (nextAccent: ThemeAccent) => {
    applyTheme(mode, nextAccent);
    localStorage.setItem('save_app_theme_accent', nextAccent);
    setAccentState(nextAccent);
  };

  const toggleTheme = () => {
    changeMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode: changeMode, setAccent: changeAccent, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
