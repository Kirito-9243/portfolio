"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParticleTextBackground from "./ParticleTextBackground";
import HeroPortrait from "./HeroPortrait";

/**
 * HERO SECTION — v3, rebuilt as explicit stacked layers
 *
 * Previous version positioned the avatar and text with ad-hoc top/bottom
 * `vh` offsets inside one shared wrapper. That's fragile — it only adds up
 * correctly for the exact viewport proportions it was eyeballed against,
 * which is very likely why the avatar rendered cut off and low on an
 * actual machine even though the numbers looked reasonable in isolation.
 *
 * This version is four independent `absolute inset-0` layers stacked by
 * z-index, each using flexbox internally to position its own content —
 * flexbox centering/alignment is self-correcting across viewport sizes in
 * a way manually-computed vh offsets aren't. This also directly matches
 * the requested architecture: layer overlap, not shared flow.
 *
 *   Layer 1 (z-10): ParticleTextBackground — "KIRITO", large background type
 *   Layer 2 (z-20): Avatar — large, top-anchored, the focal point
 *   Layer 3 (z-30): Hero content — name + title, bottom-left, supporting
 *   (Layer 0 / ambient background and Layer 4 / nav+toggle are
 *   intentionally not here — nav/toggle render at the page level in
 *   page.tsx, and no ambient-background layer exists in Hero today; adding
 *   one wasn't in the requirements list and "do not add new visual
 *   effects" is explicit, so it's left as an open slot, not filled.)
 *
 * PORTRAIT_SRC still the one line to change for a future asset swap.
 */

const PORTRAIT_SRC = "/images/hero-avatar-voxel.png";
const NAME = "Kirito";

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
      className="relative h-screen w-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="absolute inset-0">
        {/* Layer 1 — background typography */}
        <div className="absolute inset-0 z-10" aria-hidden>
          <ParticleTextBackground text={NAME.toUpperCase()} />
        </div>

        {/* Layer 2 — avatar, large and top-anchored, the focal point.
            Flex + top padding instead of a computed top offset: this
            centers/aligns correctly regardless of exact viewport
            dimensions, which a fixed vh value doesn't. */}
        <div className="absolute inset-0 z-20 flex justify-center pt-[2vh] sm:pt-[1vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-square h-[min(94vh,92vw)] sm:h-[min(94vh,80vw)] md:h-[min(94vh,62vw)] lg:h-[min(96vh,52vw)]"
          >
            <HeroPortrait src={PORTRAIT_SRC} alt={NAME} />
          </motion.div>
        </div>

        {/* Layer 3 — supporting text, bottom-left. Pushed clear of the
            fixed nav rail (~left-6/8 + expands on hover) with a much
            larger left offset than before. */}
        <div className="absolute inset-0 z-30 flex items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pb-24 pl-28 sm:pl-32 md:pb-28 md:pl-40 lg:pl-48"
          >
            <h1
              className="font-sans text-4xl font-bold leading-none sm:text-5xl md:text-6xl"
              style={{ color: "var(--foreground)" }}
            >
              {NAME}
            </h1>
            <p
              className="mt-3 font-sans text-sm uppercase tracking-[0.2em] sm:text-base"
              style={{ color: "var(--accent)" }}
            >
              AI Engineer
            </p>
            <p
              className="font-sans text-sm uppercase tracking-[0.2em] sm:text-base"
              style={{ color: "var(--muted)" }}
            >
              Machine Learning Enthusiast
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Blend into the Globe section below — both sides already share
          var(--background), so this is a soft content fade, not a color
          patch over a seam. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-48"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
        aria-hidden
      />

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { duration: 1, delay: 1.1 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
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