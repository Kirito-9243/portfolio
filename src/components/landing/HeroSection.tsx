"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParticleTextBackground from "./ParticleTextBackground";
import HeroPortrait from "./HeroPortrait";

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
        {/* Layer 1 — background typography. pointer-events-auto explicitly
            (it's already the default, but stating it keeps the intent
            obvious now that the layers above it are deliberately none):
            this is the layer that needs to actually receive the mouse for
            the particle repel effect. */}
        <div className="absolute inset-0 z-10 pointer-events-auto" aria-hidden>
          <ParticleTextBackground text={NAME.toUpperCase()} />
        </div>

        {/* Layer 2 — avatar, large and BOTTOM-anchored so the shoulders read
            as grounded near the viewport edge instead of floating with a
            gap underneath (that gap was the previous bug: h-[min(94vh,92vw)]
            means the box is frequently width-bound and shorter than the
            viewport, and top-anchoring left the leftover space dangling
            below it). Bottom-anchoring means whatever space the responsive
            height formula doesn't use collects above the avatar instead,
            which is what "grounded" actually needs regardless of aspect
            ratio. The gradient fade + scroll cue near the bottom (further
            down this file) sit above this layer and soften the avatar's
            bottom edge rather than hard-cropping it.

            pointer-events-none on this wrapper, with pointer-events-auto
            re-enabled just on the avatar's own box: this div is
            `inset-0`, i.e. it covers the ENTIRE hero regardless of how
            small the visible avatar is within it, and — being on top of
            Layer 1 in stacking order — an auto (default) pointer-events
            here was silently swallowing every mousemove over the whole
            hero before it ever reached the particle-text canvas beneath
            it.

            The sizing box below is intentionally NOT pointer-events-auto:
            HeroPortrait now owns a precisely clip-path'd hit-region sized
            to the actual visible silhouette (not the whole square), so
            the empty transparent corners of the square correctly fall
            through all the way to the canvas instead of being caught here
            one level too early. See HeroPortrait.tsx. */}
        <div className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none">
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
            larger left offset than before. pointer-events-none for the
            same reason as Layer 2 above — this is plain text with nothing
            clickable in it, so there's no reason for its full-bleed
            wrapper to block the particle canvas underneath. */}
        <div className="absolute inset-0 z-30 flex items-end pointer-events-none">
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