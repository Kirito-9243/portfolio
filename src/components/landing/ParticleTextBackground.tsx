"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * PARTICLE TEXT BACKGROUND — v3
 *
 * REAL BUG FIXED: `ctx.font` on a canvas 2D context does not resolve CSS
 * custom properties — `ctx.font = "800 100px var(--font-sans)"` is an
 * invalid font string as far as the canvas font parser is concerned, and
 * per spec an invalid assignment is silently ignored, leaving `ctx.font`
 * at its previous value (the browser default, ~10px sans-serif) rather
 * than throwing. That happened on BOTH the trial measurement and the
 * final draw call, so every scaling calculation in the previous version
 * was operating on a ~10px measurement and then drawing at the browser
 * default regardless of the computed result — confirmed directly against
 * a real canvas before writing this fix, not assumed. Font family is now
 * a hardcoded, always-valid stack; `var(--font-sans)` never reaches
 * canvas again.
 *
 * Also, per feedback that this still read as "a small label": widthFraction
 * raised further (0.92 -> 1.15, deliberately wider than the viewport so it
 * bleeds off both edges — "the width of the particle text should be larger
 * than the avatar itself"), opacity raised (0.55 -> 0.7), particle size
 * bumped slightly, gap widened further to keep particle count reasonable
 * at the new scale.
 */

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

interface ParticleTextBackgroundProps {
  text?: string;
  particleColor?: string;
  particleSize?: number;
  particleDensity?: number;
  mouseRadius?: number;
  returnSpeed?: number;
  opacity?: number;
  /** Fraction of the canvas width the text should span, 0-1+ (>1 bleeds off both edges). */
  widthFraction?: number;
  fontWeight?: number;
  className?: string;
  style?: CSSProperties;
}

const PARTICLE_COLOR = "#5ec8f0"; // var(--accent) — same in both themes
// Deliberately NOT a CSS variable — see header comment. A generic bold
// sans-serif stack that every browser can resolve inside a canvas font
// string; visually close enough to the page's Rajdhani font for
// background typography that's meant to read as texture, not body copy.
const CANVAS_FONT_STACK = "Arial, Helvetica, sans-serif";

export default function ParticleTextBackground({
  text = "KIRITO",
  particleColor = PARTICLE_COLOR,
  particleSize = 2.6,
  particleDensity = 14,
  mouseRadius = 120,
  returnSpeed = 0.05,
  opacity = 0.7,
  widthFraction = 1.15,
  fontWeight = 800,
  className,
  style,
}: ParticleTextBackgroundProps) {
  // Kept for API symmetry with the rest of the theme-aware components even
  // though the particle color no longer varies by theme (see header).
  useTheme();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  // Build the particle field from the rendered text's pixel data.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setIsInitialized(false);
    const timeoutId = setTimeout(() => {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      // Measure at a trial size, then scale so the text spans
      // `widthFraction` of the canvas width, regardless of font/text length.
      const TRIAL_SIZE = 100;
      ctx.font = `${fontWeight} ${TRIAL_SIZE}px ${CANVAS_FONT_STACK}`;
      const measuredWidth = ctx.measureText(text).width || TRIAL_SIZE;
      const targetWidth = width * widthFraction;
      const fontSize = Math.max(24, (TRIAL_SIZE * targetWidth) / measuredWidth);

      ctx.fillStyle = particleColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontWeight} ${fontSize}px ${CANVAS_FONT_STACK}`;
      ctx.fillText(text, width / 2, height / 2);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const particles: Particle[] = [];
      const gap = Math.max(2, particleDensity) * dpr;

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
          const alpha = pixels[index + 3];
          if (alpha > 128) {
            const px = x / dpr;
            const py = y / dpr;
            particles.push({ x: px, y: py, baseX: px, baseY: py, vx: 0, vy: 0 });
          }
        }
      }

      particlesRef.current = particles;
      setIsInitialized(true);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [text, particleDensity, fontWeight, particleColor, widthFraction]);

  // Physics + draw loop.
  useEffect(() => {
    if (!isInitialized) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * 2;
          particle.vy -= Math.sin(angle) * force * 2;
        }

        particle.vx += (particle.baseX - particle.x) * returnSpeed;
        particle.vy += (particle.baseY - particle.y) * returnSpeed;
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isInitialized, particleSize, mouseRadius, returnSpeed, particleColor]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ ...style, width: "100%", height: "100%", opacity, transition: "opacity 0.4s ease" }}
    />
  );
}