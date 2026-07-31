"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParticleTextBackground from "./ParticleTextBackground";
import HeroPortrait from "./HeroPortrait";

/**
 * HERO SECTION
 *
 * Two-column desktop layout (text left, portrait right), single column on
 * mobile (text, then portrait). NavRail and ThemeToggle are NOT rendered
 * here — see page.tsx for why (fixed positioning + framer-motion transforms
 * on this section's own animated wrappers don't mix).
 *
 * PORTRAIT_SRC is the one line to change when the real voxel/pixel-art
 * portrait replaces the placeholder — HeroPortrait itself has no knowledge
 * of what image it's showing.
 *
 * Assumption flagged in the main response: "Ishwar" is inferred from the
 * particle-text example list, not previously confirmed — it's used here
 * as the single name constant, not scattered through the file.
 */

const PORTRAIT_SRC = "/images/hero-portrait-placeholder.png";
const NAME = "Ishwar";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-center overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Background texture — decorative, kept out of tab order and below content */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <ParticleTextBackground text={NAME.toUpperCase()} />
      </div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 py-28 sm:px-10 md:grid-cols-2 md:px-16 lg:px-20"
      >
        {/* Left — intro text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="font-sans text-xs uppercase tracking-[0.35em]"
            style={{ color: "var(--accent)" }}
          >
            Portfolio · 2026
          </p>

          <h1
            className="mt-4 font-sans text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl"
            style={{ color: "var(--foreground)" }}
          >
            {NAME}
          </h1>

          <p
            className="mt-4 font-sans text-base uppercase tracking-[0.25em] sm:text-lg"
            style={{ color: "var(--accent)" }}
          >
            AI Engineer · Machine Learning Enthusiast
          </p>

          <p
            className="mt-6 max-w-md font-sans text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--muted)" }}
          >
            Final-year CS student building systems at the intersection of
            reinforcement learning and real-time engineering — from a
            multi-agent crisis-training simulator trained with PPO to
            production APIs and accessibility tooling shipped end to end.
            This portfolio is one more system: built, not templated.
          </p>
        </motion.div>

        {/* Right — portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto aspect-[4/5] w-full max-w-sm md:mx-0 md:ml-auto"
        >
          <HeroPortrait src={PORTRAIT_SRC} alt={NAME} />
        </motion.div>
      </motion.div>

      {/* Blend into the Globe section below — both sides already share
          var(--background), so this is a soft content fade, not a color
          patch over a seam. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
        aria-hidden
      />

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { duration: 1, delay: 1.1 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ color: "var(--muted)" }}
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}