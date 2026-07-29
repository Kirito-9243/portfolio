"use client";

import { motion } from "framer-motion";

/**
 * AMBIENT BACKGROUND
 *
 * Adapted from a Framer marketplace component (three soft blobs that drift
 * and cross-fade between colors, blurred into a nebula-like wash). Stripped
 * of Framer's `addPropertyControls` plugin plumbing — this is a plain
 * client component now.
 *
 * THEME: currently running LIGHT_THEME (the original Framer component's
 * own colors) as the live palette. DARK_THEME is the holographic-blue
 * retint built for the previous pass, kept here as a named backup — do
 * NOT delete it, it's the starting point for the future dark-mode toggle.
 *
 * Sits absolutely positioned behind other content (see WorldSection.tsx).
 */

export const LIGHT_THEME = {
  baseColor: "#ffffff",
  color1: "rgba(0, 122, 255, 0.4)", // blue
  color2: "rgba(175, 82, 222, 0.3)", // purple
  color3: "rgba(50, 173, 230, 0.3)", // cyan
  overlayTint: "rgba(255, 255, 255, 0.5)",
  overlayOpacity: 0.1,
};

// Backup for the future dark-mode toggle — do not delete.
export const DARK_THEME = {
  baseColor: "transparent",
  color1: "rgba(94, 200, 240, 0.35)", // holo blue — #5ec8f0
  color2: "rgba(167, 139, 250, 0.28)", // purple accent — #a78bfa
  color3: "rgba(56, 189, 248, 0.3)", // sky blue accent — #38bdf8
  overlayTint: "rgba(224, 242, 254, 0.5)",
  overlayOpacity: 0.06,
};

interface AmbientBackgroundProps {
  baseColor?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  blurAmount?: number;
  speedMultiplier?: number;
  overlayOpacity?: number;
  overlayTint?: string;
  colorDuration?: number;
  className?: string;
}

export default function AmbientBackground({
  baseColor = LIGHT_THEME.baseColor,
  color1 = LIGHT_THEME.color1,
  color2 = LIGHT_THEME.color2,
  color3 = LIGHT_THEME.color3,
  blurAmount = 60,
  speedMultiplier = 1,
  overlayOpacity = LIGHT_THEME.overlayOpacity,
  overlayTint = LIGHT_THEME.overlayTint,
  colorDuration = 10,
  className,
}: AmbientBackgroundProps) {
  return (
    <div className={className} style={{ ...containerStyle, backgroundColor: baseColor }}>
      {/* BLOB 1 */}
      <motion.div
        style={{ ...blobStyle, backgroundColor: color1, width: "80%", height: "80%", top: "10%", left: "10%" }}
        animate={{ x: [-30, 30], y: [-30, 30], scale: [1, 1.1], backgroundColor: [color1, color2, color3] }}
        transition={{
          default: { duration: 7 * speedMultiplier, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
          backgroundColor: { duration: colorDuration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
        }}
      />

      {/* BLOB 2 */}
      <motion.div
        style={{ ...blobStyle, backgroundColor: color2, width: "70%", height: "70%", top: "15%", right: "15%" }}
        animate={{ x: [50, -50], y: [100, -20], backgroundColor: [color2, color3, color1] }}
        transition={{
          default: { duration: 5 * speedMultiplier, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
          backgroundColor: { duration: colorDuration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
        }}
      />

      {/* BLOB 3 */}
      <motion.div
        style={{ ...blobStyle, backgroundColor: color3, width: "60%", height: "60%", bottom: "10%", left: "20%" }}
        animate={{ x: [-20, 80], y: [100, 50], backgroundColor: [color3, color1, color2] }}
        transition={{
          default: { duration: 6 * speedMultiplier, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
          backgroundColor: { duration: colorDuration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
        }}
      />

      {/* Blur layer — softens the blobs behind it into a wash rather than solid shapes */}
      <div
        style={{
          ...overlayStyle,
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Faint tint — knocks back contrast slightly so the blobs read as
          ambient light rather than flat colored shapes */}
      <div
        style={{
          ...overlayStyle,
          backgroundColor: overlayTint,
          opacity: overlayOpacity,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  isolation: "isolate",
};

const blobStyle: React.CSSProperties = {
  position: "absolute",
  borderRadius: "50%",
  opacity: 0.6,
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  zIndex: 10,
};