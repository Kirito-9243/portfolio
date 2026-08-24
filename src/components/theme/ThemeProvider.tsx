"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";
const DEFAULT_THEME: Theme = "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always the deterministic default here -- both on the server AND on the
  // client's first (hydration) render. The previous version read
  // document.documentElement.classList in this initializer, which is fine
  // on the server (falls back to DEFAULT_THEME) but on the client runs
  // *after* NO_FLASH_THEME_SCRIPT has already added the real "dark"/"light"
  // class from localStorage -- so a returning dark-mode visitor's client
  // render disagreed with the server's "light" assumption immediately,
  // which is exactly what a hydration mismatch is. Page colors never
  // flashed either way (that's all driven by the CSS class the inline
  // script sets before hydration even starts, not by this state), so the
  // only thing this ever affected was this one render.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // Runs once, after hydration has already committed -- so updating state
  // here is a normal client-side re-render, not something React has to
  // reconcile against server-rendered HTML. This picks up whatever the
  // no-flash script already put on <html>.
  useEffect(() => {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setThemeState(current);
  }, []);

  const applyTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.classList.toggle("light", next === "light");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — theme just won't persist.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme, applyTheme]);

  const setTheme = useCallback((next: Theme) => applyTheme(next), [applyTheme]);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>.");
  }
  return ctx;
}

export const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=window.localStorage.getItem('${STORAGE_KEY}')==='dark'?'dark':'light';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('${DEFAULT_THEME}');}})();`;