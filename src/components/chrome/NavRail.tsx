"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * NAV RAIL
 *
 * Data-driven so adding a section later is a one-line change. Home and
 * Globe point at real sections on this page (#home, #globe). Projects,
 * Skills, and Contact are included per spec but don't have matching
 * sections yet (they live in the Aincrad tower per the README's Phase 4-5)
 * — clicking them, or the active-indicator logic, safely no-ops until
 * those sections exist; see NAV_ITEMS' `implemented` flag.
 *
 * Rendered at the page level (see page.tsx), not nested inside HeroSection
 * — `position: fixed` breaks under a transformed ancestor, and
 * framer-motion's Hero animations rely on transform.
 */

interface NavItem {
  id: string;
  label: string;
  implemented: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", implemented: true },
  { id: "globe", label: "Globe", implemented: true },
  { id: "projects", label: "Projects", implemented: false },
  { id: "skills", label: "Skills", implemented: false },
  { id: "contact", label: "Contact", implemented: false },
];

export default function NavRail() {
  const [activeId, setActiveId] = useState<string>("home");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // IntersectionObserver callbacks only report entries whose ratio just
    // crossed a threshold — NOT a full snapshot of every observed element
    // every time. Keeping a persistent map of every section's most recent
    // ratio and recomputing "best" across the whole map (not just the
    // current batch) is what makes the comparison correct.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratiosRef.current.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratiosRef.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );

    // The actual root cause of the "stuck on Home" bug: WorldSection is
    // dynamically imported (`ssr: false`), so #globe doesn't exist in the
    // DOM yet when this effect first runs on mount — a plain
    // getElementById-once approach silently never observes it at all,
    // Home stays the only entry ever in the ratio map, and activeId never
    // moves. A MutationObserver picks up sections as they mount late,
    // which also makes this correct for any future section (Projects,
    // Skills, Contact) regardless of how it's loaded.
    const observedIds = new Set<string>();
    const tryObserveAll = () => {
      for (const item of NAV_ITEMS) {
        if (observedIds.has(item.id)) continue;
        const el = document.getElementById(item.id);
        if (el) {
          observer.observe(el);
          observedIds.add(item.id);
        }
      }
    };

    tryObserveAll();
    const mutationObserver = new MutationObserver(tryObserveAll);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const handleNavigate = (item: NavItem) => {
    if (!item.implemented) return;
    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-5 sm:left-8 md:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeId === item.id;
        const isHovered = hoveredId === item.id;
        const expanded = isHovered || isActive;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigate(item)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            disabled={!item.implemented}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-3 py-1"
            style={{ cursor: item.implemented ? "pointer" : "default" }}
          >
            <motion.span
              aria-hidden
              className="block h-[2px] rounded-full"
              animate={{
                width: expanded ? 28 : 16,
                backgroundColor: isActive ? "var(--accent)" : "var(--hero-border)",
                opacity: item.implemented ? 1 : 0.45,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ backgroundColor: isActive ? "var(--accent)" : "var(--hero-border)" }}
            />
            <motion.span
              className="whitespace-nowrap font-sans text-xs uppercase tracking-[0.25em]"
              initial={false}
              animate={{
                opacity: expanded ? 1 : 0,
                x: expanded ? 0 : -6,
              }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: isActive ? "var(--accent)" : "var(--foreground)" }}
            >
              {item.label}
            </motion.span>
          </button>
        );
      })}
    </nav>
  );
}