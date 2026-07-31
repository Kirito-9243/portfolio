"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * THEME PROVIDER
 *
 * Minimal hand-rolled light/dark context — deliberately not next-themes or
 * any other package, per "do not introduce unnecessary dependencies." This
 * does the same three things any theme system needs to:
 *
 *  1. Hold the current theme in React state (`useTheme()` below).
 *  2. Reflect it onto <html> as a class (`.light` / `.dark`), which
 *     globals.css uses to swap the underlying CSS custom properties
 *     (--background, --foreground, etc.) — see globals.css.
 *  3. Persist it to localStorage, and avoid a flash of the wrong theme on
 *     load via NO_FLASH_THEME_SCRIPT, which layout.tsx injects as an
 *     inline <script> in <head> that runs before hydration.
 *
 * Default is "light" (matches the current site default), not
 * prefers-color-scheme — dark is opt-in via the toggle, by design.
 *
 * Known trade-off: ThemeToggle's icon is state-driven (sun vs. moon) and
 * reads `theme` on first client render, which can differ for one React
 * commit from the server's neutral "light" guess if the visitor's saved
 * preference is "dark" — the actual page colors never flash (the inline
 * script sets the DOM class before hydration even starts), only the toggle
 * icon could theoretically re-render once. ThemeToggle uses
 * suppressHydrationWarning for exactly that one element rather than adding
 * mount-deferral machinery for a one-frame icon swap.
 */

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
  // Matches whatever the inline no-flash script already applied to <html>,
  // so this first client render agrees with the DOM instead of fighting it.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return DEFAULT_THEME;
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

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

/**
 * Injected via <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
 * in layout.tsx's <head>. Runs before React hydrates, so the correct class
 * is already on <html> by first paint — no flash of the wrong theme.
 */
export const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=window.localStorage.getItem('${STORAGE_KEY}')==='dark'?'dark':'light';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('${DEFAULT_THEME}');}})();`;