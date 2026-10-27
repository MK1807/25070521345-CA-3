import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

const ACCENT_VARS = {
  cyan:    { primary: '#22d3ee', secondary: '#06b6d4', glow: 'rgba(34,211,238,0.25)', ring: 'rgba(34,211,238,0.4)' },
  purple:  { primary: '#8b5cf6', secondary: '#7c3aed', glow: 'rgba(139,92,246,0.25)', ring: 'rgba(139,92,246,0.4)' },
  emerald: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16,185,129,0.25)', ring: 'rgba(16,185,129,0.4)' },
  sunset:  { primary: '#f97316', secondary: '#ea580c', glow: 'rgba(249,115,22,0.25)',  ring: 'rgba(249,115,22,0.4)' },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('pulse_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.themeAccent && ACCENT_VARS[u.themeAccent]) return u.themeAccent;
      }
    } catch {}
    return 'purple';
  });

  const applyTheme = (accentKey) => {
    const vars = ACCENT_VARS[accentKey] || ACCENT_VARS.purple;
    const root = document.documentElement;
    root.style.setProperty('--accent',   vars.primary);
    root.style.setProperty('--accent-2', vars.secondary);
    root.style.setProperty('--glow',     vars.glow);
    root.style.setProperty('--ring',     vars.ring);
    setTheme(accentKey);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme, vars: ACCENT_VARS[theme] || ACCENT_VARS.purple }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { ACCENT_VARS };
