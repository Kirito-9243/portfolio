"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useGLTF } from "@react-three/drei";
import { hash } from "@/lib/hash";
import HeroSection from "@/components/landing/HeroSection";

// WorldSection mounts real WebGL (ParticleGlobe + LinkStartButton's shader),
// so it's excluded from SSR the same way LandingScene was before it.
const WorldSection = dynamic(() => import("@/components/landing/WorldSection"), { ssr: false });

// Temporary destination until Phase 2 builds the real world route --
// character-test is the proven character-controller foundation Phase 2
// builds on, so arriving there (rough placeholder text and all) is the
// honest current state, not a bug.
const WORLD_ROUTE = "/character-test";
const FLASH_DURATION_MS = 700;
const BURST_DURATION_MS = 850;

const BURST_COLORS = ["#5ec8f0", "#8fd9ff", "#a78bfa", "#f472b6", "#facc15", "#4ade80", "#f8fafc", "#38bdf8"];
const BURST_COUNT = 48;

export default function Home() {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const burstLines = useMemo(
    () =>
      Array.from({ length: BURST_COUNT }, (_, i) => {
        const seed = i + 1;
        return {
          id: i,
          angle: (i / BURST_COUNT) * 360 + (hash(seed) - 0.5) * 6,
          color: BURST_COLORS[Math.floor(hash(seed * 2.1) * BURST_COLORS.length)],
          length: 60 + hash(seed * 3.7) * 50,
          width: 3 + hash(seed * 5.3) * 6,
          delay: hash(seed * 7.9) * 0.15,
        };
      }),
    []
  );

  useEffect(() => {
    // Warm the destination from the moment the landing page loads --
    // route code via Next's own prefetch, and the heavy GLB asset via
    // drei's preload -- so by the time the flash+burst sequence finishes,
    // arriving feels instant instead of picking up mid-load.
    router.prefetch(WORLD_ROUTE);
    useGLTF.preload("/models/Soldier.glb");
  }, [router]);

  function handleEnter() {
    setTransitioning(true);
    setTimeout(() => setShowBurst(true), FLASH_DURATION_MS);
    setTimeout(() => router.push(WORLD_ROUTE), FLASH_DURATION_MS + BURST_DURATION_MS);
  }

  return (
    <main className="relative w-full bg-abyss">
      <HeroSection />
      <WorldSection onEnter={handleEnter} transitioning={transitioning} />

      {/* Phase 1 of the transition: light-blue flash. Fixed to the
          viewport (not the scroll position) so it reads correctly
          regardless of where WorldSection sits on the page. */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            key="flash"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 2.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FLASH_DURATION_MS / 1000, ease: [0.6, 0, 0.9, 0.2] }}
            className="pointer-events-none fixed inset-0 z-40"
            style={{
              background:
                "radial-gradient(circle, rgba(224,242,254,1) 0%, rgba(94,200,240,0.9) 35%, rgba(6,15,19,0) 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 2 of the transition: the Link Start light-tunnel burst.
          Also doubles as a loading buffer -- by the time this finishes,
          router.prefetch + useGLTF.preload have had the full flash+burst
          duration to warm the destination in the background. */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            key="burst"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
            style={{ background: "#eaf6ff" }}
          >
            {burstLines.map((l) => (
              <motion.div
                key={l.id}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 1, 1, 0.5] }}
                transition={{ duration: BURST_DURATION_MS / 1000, delay: l.delay, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: `${l.width}px`,
                  height: `${l.length}vh`,
                  background: l.color,
                  borderRadius: "999px",
                  transformOrigin: "top center",
                  x: "-50%",
                  rotate: l.angle,
                  filter: "blur(1px)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

useGLTF.preload("/models/Soldier.glb");