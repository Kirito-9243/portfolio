"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { hash } from "@/lib/hash";

/**
 * HERO PORTRAIT — v3
 *
 * Per feedback: the previous version pixelated the source image on canvas.
 * That was correct when the source was a plain photo, but the current
 * source (Reference B) is already finished voxel artwork — running it
 * through a downscale/upscale pipeline would just muddy a crisp image.
 * This version renders `src` directly: no pixelation, no blur, no radial
 * mask, no filters on the base image.
 *
 * `src` is still the only thing that knows about the actual asset — the
 * caller (HeroSection.tsx) owns the path, so swapping in a future,
 * improved voxel render is still a one-line change here.
 *
 * The hover glitch (RGB-split ghost layers) and particle burst are kept
 * from the previous build, just re-pointed at the raw image instead of a
 * canvas-derived one — flagged as a judgment call in the main response.
 */

interface HeroPortraitProps {
  src: string;
  alt?: string;
  className?: string;
}

const BURST_COUNT = 14;

export default function HeroPortrait({ src, alt = "Portrait", className }: HeroPortraitProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

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
      onHoverStart={() => {
        setIsHovering(true);
        setBurstKey((k) => k + 1);
      }}
      onHoverEnd={() => setIsHovering(false)}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <div
        className={`portrait-voxel${isHovering ? " is-hovering" : ""}`}
        style={{ position: "relative", width: "100%", height: "100%", borderRadius: "1.25rem", overflow: "hidden" }}
      >
        {/* Reference B, used directly — no processing */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />

        {/* RGB-split ghost layers — same raw image, invisible until hover */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="portrait-ghost portrait-ghost--cyan" style={ghostStyle} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="portrait-ghost portrait-ghost--red" style={ghostStyle} />

        {/* Particle burst */}
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

      <style jsx>{`
        .portrait-ghost--cyan {
          mix-blend-mode: screen;
          filter: brightness(1.1) saturate(3) hue-rotate(160deg);
        }
        .portrait-ghost--red {
          mix-blend-mode: screen;
          filter: brightness(1.1) saturate(3) hue-rotate(-40deg);
        }
        .is-hovering .portrait-ghost--cyan {
          animation: portrait-glitch-cyan 0.7s steps(2, end) 1;
        }
        .is-hovering .portrait-ghost--red {
          animation: portrait-glitch-red 0.7s steps(2, end) 1;
        }
        @keyframes portrait-glitch-cyan {
          0% { opacity: 0; transform: translateX(0); clip-path: inset(0 0 100% 0); }
          15% { opacity: 0.55; transform: translateX(-8px); clip-path: inset(15% 0 55% 0); }
          35% { opacity: 0.35; transform: translateX(5px); clip-path: inset(55% 0 10% 0); }
          55% { opacity: 0.5; transform: translateX(-4px); clip-path: inset(30% 0 40% 0); }
          75% { opacity: 0.2; transform: translateX(2px); clip-path: inset(60% 0 5% 0); }
          100% { opacity: 0; transform: translateX(0); clip-path: inset(0 0 100% 0); }
        }
        @keyframes portrait-glitch-red {
          0% { opacity: 0; transform: translateX(0); clip-path: inset(100% 0 0 0); }
          15% { opacity: 0.55; transform: translateX(8px); clip-path: inset(50% 0 20% 0); }
          35% { opacity: 0.35; transform: translateX(-5px); clip-path: inset(8% 0 60% 0); }
          55% { opacity: 0.5; transform: translateX(4px); clip-path: inset(35% 0 35% 0); }
          75% { opacity: 0.2; transform: translateX(-2px); clip-path: inset(5% 0 65% 0); }
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