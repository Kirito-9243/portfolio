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
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const targets = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick whichever observed section has the most viewport coverage
        // right now, rather than reacting to every crossing independently.
        let best: { id: string; ratio: number } | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.ratio)) {
            best = { id: entry.target.id, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActiveId(best.id);
      },
      { threshold: [0.3, 0.5, 0.7] }
    );

    targets.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
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