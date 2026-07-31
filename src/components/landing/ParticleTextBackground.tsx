"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * PARTICLE TEXT BACKGROUND
 *
 * Adapted from the project's ParticleText.tsx (mouse-reactive canvas
 * particles forming text). Used here strictly as a background texture
 * behind Hero's real content — per spec, never the readable headline.
 * Kept deliberately low-opacity/low-density so it reads as ambient
 * texture, not a second headline competing with the real one.
 *
 * Framer's `addPropertyControls`/`useIsStaticRenderer` plugin plumbing is
 * removed (not installed here, meaningless outside Framer); otherwise the
 * particle-physics logic (mouse repel + spring-return) is unchanged from
 * the source file.
 *
 * Sits `position: absolute; inset: 0` behind Hero's foreground content
 * (see HeroSection.tsx) at a low z-index, so normal DOM stacking lets
 * clicks/hover pass through to the foreground UI everywhere except the
 * genuinely empty space around it — no pointer-events tricks needed.
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
  font?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}

const LIGHT_PARTICLE_COLOR = "#0a1620";
const DARK_PARTICLE_COLOR = "#e0f2fe";

export default function ParticleTextBackground({
  text = "ISHWAR",
  particleColor,
  particleSize = 1.6,
  particleDensity = 4,
  mouseRadius = 90,
  returnSpeed = 0.05,
  opacity = 0.16,
  font = { fontSize: "260px", fontWeight: 800, fontFamily: "var(--font-sans)" },
  className,
  style,
}: ParticleTextBackgroundProps) {
  const { theme } = useTheme();
  const resolvedColor = particleColor ?? (theme === "dark" ? DARK_PARTICLE_COLOR : LIGHT_PARTICLE_COLOR);

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

      ctx.fillStyle = resolvedColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const fontSize = parseInt(font.fontSize as string) || 260;
      const fontWeight = font.fontWeight || 800;
      const fontFamily = font.fontFamily || "sans-serif";
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

      ctx.fillText(text, width / 2, height / 2);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const particles: Particle[] = [];
      const gap = Math.max(2, particleDensity);

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const index = (y * canvas.width + x) * 4;
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
  }, [text, particleDensity, font, resolvedColor]);

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

        ctx.fillStyle = resolvedColor;
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
  }, [isInitialized, particleSize, mouseRadius, returnSpeed, resolvedColor]);

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