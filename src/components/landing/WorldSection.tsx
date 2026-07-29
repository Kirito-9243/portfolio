"use client";

import { motion } from "framer-motion";
import AmbientBackground from "./AmbientBackground";
import ParticleGlobe from "./ParticleGlobe";
import LinkStartButton from "./LinkStartButton";

interface WorldSectionProps {
  onEnter: () => void;
  transitioning: boolean;
}

/**
 * WORLD SECTION
 *
 * What you land on after scrolling past the hero: AmbientBackground filling
 * the section behind everything, ParticleGlobe (Dharwad marked) floating on
 * top of it, and the Link Start button below. Replaces the old
 * LandingScene.tsx + HolographicGlobe.tsx pairing.
 */
export default function WorldSection({ onEnter, transitioning }: WorldSectionProps) {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AmbientBackground />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 px-6">
        <div className="aspect-square w-[min(78vw,620px)]">
          <ParticleGlobe />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: transitioning ? 0 : 1, y: 0 }}
          transition={{ duration: transitioning ? 0.3 : 1, delay: transitioning ? 0 : 0.2 }}
        >
          <LinkStartButton text="Link Start" onClick={onEnter} disabled={transitioning} />
        </motion.div>
      </div>
    </section>
  );
}