"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { hash } from "@/lib/hash";

// Hit-region for hover detection, traced from the actual PNG's alpha
// channel (sampled left/right silhouette edge at 10%-height bands, +3
// percentage points of outward margin so real edge pixels of the artwork
// are never accidentally excluded). This intentionally does NOT chase
// every hair-spike pixel — that would make it brittle to the next avatar
// swap. It's a generous silhouette (narrow hair peak, flared hair,
// narrower neck, wide shoulders) that keeps the four empty square corners
// out of the hoverable area without being tied to exact pixel edges.
// Re-derive these numbers (see conversation) if the avatar art changes
// enough to alter the silhouette meaningfully.
const AVATAR_HIT_CLIP_PATH =
  "polygon(51.1% 2%, 72.9% 10%, 80% 20%, 82.2% 30%, 81.2% 40%, 72.9% 50%, 72.7% 60%, 79% 70%, 95.3% 80%, 98.8% 90%, 100% 100%, 0.2% 100%, 3.1% 90%, 6% 80%, 22.6% 70%, 30.4% 60%, 29% 50%, 21.1% 40%, 18.6% 30%, 24.9% 20%, 27.7% 10%)";

interface HeroPortraitProps {
  src: string;
  alt?: string;
  className?: string;
}

const BURST_COUNT = 14;

export default function HeroPortrait({ src, alt = "Portrait", className }: HeroPortraitProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [isAutoGlitching, setIsAutoGlitching] = useState(false);

  // Ambient glitch loop — fires on its own, independent of hover, so the
  // avatar reads as "alive" even when nobody's cursor is anywhere near it.
  // Random delay between bursts (rather than a fixed interval) is what
  // keeps it from feeling like a metronome; the burst itself is held just
  // past the 0.7s CSS animation length below so the animation completes
  // naturally instead of getting cut off mid-cycle.
  useEffect(() => {
    let burstTimeout: ReturnType<typeof setTimeout> | undefined;
    let cycleTimeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 6000; // ~5-11s between bursts
      cycleTimeout = setTimeout(() => {
        if (cancelled) return;
        setIsAutoGlitching(true);
        burstTimeout = setTimeout(() => {
          if (cancelled) return;
          setIsAutoGlitching(false);
          scheduleNext();
        }, 750);
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (burstTimeout) clearTimeout(burstTimeout);
      if (cycleTimeout) clearTimeout(cycleTimeout);
    };
  }, []);

  // Hover still triggers its own burst (see onHoverStart below); either
  // source can trigger the same glitch animation on the ghost layers.
  const glitchActive = isHovering || isAutoGlitching;

  const burstParticles = useMemo(
    () =>
      Array.from({ length: BURST_COUNT }, (_, i) => {
        const seed = i + 1 + burstKey * 100;
        const angle = hash(seed) * Math.PI * 2;
        const distance = 40 + hash(seed * 2.3) * 70;
        return {
          id: i,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 2 + hash(seed * 3.1) * 3,
          delay: hash(seed * 4.7) * 0.08,
          color: hash(seed * 5.9) > 0.5 ? "#5ec8f0" : "#8fd9ff",
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey]
  );

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <div
        className={`portrait-voxel${glitchActive ? " is-glitching" : ""}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "1.25rem",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="portrait-ghost portrait-ghost--cyan" style={ghostStyle} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="portrait-ghost portrait-ghost--red" style={ghostStyle} />

        {isHovering && (
          <div key={burstKey} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {burstParticles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 0.3 }}
                transition={{ duration: 0.65, delay: p.delay, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hover hit-region — invisible, clipped to AVATAR_HIT_CLIP_PATH so
          only the actual visible portrait triggers the glitch/burst. Both
          the square above (.portrait-voxel, pointer-events: none) and this
          root motion.div (pointer-events: none) let the cursor pass
          straight through to whatever's behind them (the particle canvas)
          everywhere OUTSIDE this clipped shape — clip-path affects hit
          testing the same way it affects painting, so the four empty
          corners of the square are no longer part of the hoverable area. */}
      <motion.div
        aria-hidden
        onHoverStart={() => {
          setIsHovering(true);
          setBurstKey((k) => k + 1);
        }}
        onHoverEnd={() => setIsHovering(false)}
        style={{
          position: "absolute",
          inset: 0,
          clipPath: AVATAR_HIT_CLIP_PATH,
          pointerEvents: "auto",
        }}
      />

      <style jsx>{`
        .portrait-ghost--cyan {
          mix-blend-mode: screen;
          filter: brightness(1.1) saturate(3) hue-rotate(160deg);
        }
        .portrait-ghost--red {
          mix-blend-mode: screen;
          filter: brightness(1.1) saturate(3) hue-rotate(-40deg);
        }
        .is-glitching .portrait-ghost--cyan {
          animation: portrait-glitch-cyan 0.7s steps(2, end) 1;
        }
        .is-glitching .portrait-ghost--red {
          animation: portrait-glitch-red 0.7s steps(2, end) 1;
        }
        @keyframes portrait-glitch-cyan {
          0% { opacity: 0; transform: translateX(0); clip-path: inset(0 0 100% 0); }
          15% { opacity: 0.4; transform: translateX(-4px); clip-path: inset(15% 0 55% 0); }
          35% { opacity: 0.22; transform: translateX(3px); clip-path: inset(55% 0 10% 0); }
          55% { opacity: 0.32; transform: translateX(-2px); clip-path: inset(30% 0 40% 0); }
          75% { opacity: 0.14; transform: translateX(1px); clip-path: inset(60% 0 5% 0); }
          100% { opacity: 0; transform: translateX(0); clip-path: inset(0 0 100% 0); }
        }
        @keyframes portrait-glitch-red {
          0% { opacity: 0; transform: translateX(0); clip-path: inset(100% 0 0 0); }
          15% { opacity: 0.4; transform: translateX(4px); clip-path: inset(50% 0 20% 0); }
          35% { opacity: 0.22; transform: translateX(-3px); clip-path: inset(8% 0 60% 0); }
          55% { opacity: 0.32; transform: translateX(2px); clip-path: inset(35% 0 35% 0); }
          75% { opacity: 0.14; transform: translateX(-1px); clip-path: inset(5% 0 65% 0); }
          100% { opacity: 0; transform: translateX(0); clip-path: inset(100% 0 0 0); }
        }
      `}</style>
    </motion.div>
  );
}

const ghostStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  opacity: 0,
  pointerEvents: "none",
};