"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * THEME TOGGLE
 *
 * Minimal sun/moon switch, not a traditional track-and-thumb toggle (per
 * spec). Rendered at the page level (see page.tsx) alongside NavRail, not
 * nested inside HeroSection — same "fixed" positioning constraint applies:
 * it must sit outside any transformed/animated ancestor.
 *
 * The icon swap uses suppressHydrationWarning — see ThemeProvider.tsx's
 * header comment for why: the page's actual colors never flash (the inline
 * script sets those before hydration), only this icon is state-driven
 * enough to theoretically differ for one React commit.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
      className="fixed right-6 top-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 sm:right-8 sm:top-8"
      style={{
        borderColor: "var(--hero-border)",
        backgroundColor: "var(--background)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="moon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ opacity: 0, rotate: -50, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 50, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <path
              d="M20.5 14.5c-1.2.5-2.5.8-3.9.8-5.5 0-10-4.5-10-10 0-1.4.3-2.7.8-3.9C4 3 1.5 6.7 1.5 11c0 6.1 4.9 11 11 11 4.3 0 8-2.5 9.5-6.1-.5.2-1 .4-1.5.6z"
              fill="#e8e2d0"
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ opacity: 0, rotate: 50, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -50, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <circle cx="12" cy="12" r="4.5" fill="#f59e0b" />
            <g stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2.5v2.2" />
              <path d="M12 19.3v2.2" />
              <path d="M4.2 4.2l1.6 1.6" />
              <path d="M18.2 18.2l1.6 1.6" />
              <path d="M2.5 12h2.2" />
              <path d="M19.3 12h2.2" />
              <path d="M4.2 19.8l1.6-1.6" />
              <path d="M18.2 5.8l1.6-1.6" />
            </g>
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}