"use client";

import * as React from "react";
import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * LINK START BUTTON
 *
 * Fluid_glassButton.tsx as the base (verbatim WebGL liquid-glass shader:
 * pill SDF, fbm noise warp, rim/specular highlights, twinkling stars, click
 * ripple — untouched other than removing Framer's plugin SDK) combined with
 * Glitch_hover.tsx's hover treatment applied to the text label instead of
 * its own hardcoded "HOVER ME" button chrome.
 *
 * The glitch trick (a `::after` pseudo-element duplicating the text via
 * `content: attr(data-text)`, clip-path-sliced into bands on hover) is
 * pure CSS, so it's implemented with styled-jsx (bundled with Next.js,
 * zero extra dependency) rather than styled-components, which the original
 * file used but which isn't installed in this project. Chosen slice colors
 * are pulled from the site's existing "Link Start" burst palette
 * (src/app/page.tsx's BURST_COLORS) instead of the original neon red/cyan,
 * so the glitch reads as part of the same moment rather than a clashing
 * one-off.
 *
 * THEME: LIGHT_THEME is live — background matches the (light) page, border
 * and text use the opposite (dark) tone for contrast. DARK_THEME (light
 * border/text on a dark background) is kept as a named backup for the
 * future dark-mode toggle — do not delete it. `glassColor` (the shader's
 * rim/specular/star tint) stays the same holo blue across both themes as a
 * stable accent, since it's an additive-only shader: against a light base
 * it reads as a softer, edge-concentrated glow rather than the fuller glow
 * it has on a dark base — that's the shader's own math, not something this
 * re-theme changes, so don't be surprised if it looks subtler than before.
 */

export const LIGHT_THEME = {
  baseColor: "#ffffff",
  glassColor: "#5ec8f0",
  textColor: "#0a1620",
  borderColor: "rgba(10, 22, 32, 0.35)",
  textGlow: "rgba(10, 22, 32, 0.12)",
};

// Backup for the future dark-mode toggle — do not delete.
export const DARK_THEME = {
  baseColor: "#0a1620",
  glassColor: "#5ec8f0",
  textColor: "#eaf6ff",
  borderColor: "rgba(234, 246, 255, 0.15)",
  textGlow: "rgba(255, 255, 255, 0.3)",
};

export interface LinkStartButtonProps {
  link?: string;
  text?: string;
  textFont?: React.CSSProperties;
  textColor?: string;
  textGlow?: string;
  padding?: string;
  baseColor?: string;
  glassColor?: string;
  borderColor?: string;
  hoverSpeed?: number;
  borderRadius?: number;
  livePreview?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uHover;
uniform float uClick;
uniform vec3 uBaseColor;
uniform vec3 uGlassColor;
uniform vec2 uResolution;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    for(int i = 0; i < 4; i++) {
        f += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return f;
}

void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= aspect;

    vec2 center = vec2(0.5);
    vec2 dirToCenter = normalize(vUv - center + vec2(0.0001));
    float distToCenter = length(vUv - center);

    float r = 1.0; 
    vec2 b = vec2(max(aspect - 1.0, 0.0), 0.0);
    vec2 d = abs(p) - b;
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
    
    float innerDist = clamp(abs(dist), 0.0, 1.0);

    float t = uTime;
    
    vec2 noiseUv = vUv * vec2(2.0, 1.0); 
    
    vec2 warp = vec2(fbm(noiseUv + t * 0.5), fbm(noiseUv + t * 0.5 + 12.34)) * mix(0.0, 0.4, uHover);
    warp -= dirToCenter * uClick * 0.25 * smoothstep(0.8, 0.0, distToCenter); 
    
    float n1 = fbm(noiseUv + warp + vec2(t, 0.0));
    float n2 = fbm(noiseUv + warp + vec2(n1, t * 1.2));

    float rimWidth = mix(0.15, 0.35, n2) * mix(1.0, 1.4, uHover);
    rimWidth += uClick * 0.15;
    float rim = smoothstep(rimWidth, 0.0, innerDist);
    
    float specDist = abs(innerDist - 0.12 + n1 * 0.08);
    float specular = smoothstep(0.03, 0.0, specDist);

    float rightBias = smoothstep(0.2, 1.0, vUv.x);
    rim *= mix(0.6, 1.5, rightBias);
    specular *= mix(0.5, 2.0, rightBias);

    vec2 starUv = vUv * vec2(aspect * 6.0, 6.0);
    
    starUv.x -= uTime * 0.2; 
    starUv.y += sin(uTime * 0.5 + starUv.x) * mix(0.2, 0.6, uHover); 
    
    starUv += dirToCenter * uClick * 1.5;

    vec2 id = floor(starUv);
    vec2 gv = fract(starUv) - 0.5;
    float nStar = hash(id);
    float star = 0.0;
    
    float starThreshold = mix(0.94, 0.86, uHover); 
    
    if (nStar > starThreshold) { 
        float sizeMod = mix(0.5, 2.5, hash(id + 13.37)); 
        
        vec2 localWiggle = vec2(
            sin(uTime * 2.0 + nStar * 50.0),
            cos(uTime * 2.3 + nStar * 40.0)
        ) * 0.25 * uHover;

        float starDist = length(gv - localWiggle) * sizeMod;
        
        star = smoothstep(0.12, 0.0, starDist);
        star += smoothstep(0.25, 0.0, starDist) * 0.3;

        float twinklePhase = uTime * mix(5.0, 15.0, hash(id + 42.0));
        star *= sin(twinklePhase + nStar * 100.0) * 0.5 + 0.5; 
        
        star *= smoothstep(0.05, 0.2, innerDist); 
    }

    vec3 color = uBaseColor;
    
    float innerLiquid = smoothstep(0.2, 0.9, n2) * (1.0 - innerDist) * mix(0.2, 0.45, uHover);
    color += uGlassColor * innerLiquid;
    
    color += uGlassColor * rim * mix(0.6, 1.2, uHover);
    color += vec3(1.0) * specular * mix(0.8, 2.0, uHover);
    
    color += vec3(1.0) * star * mix(0.8, 1.5, uHover);

    color += uGlassColor * rim * uClick * 0.8;
    color += vec3(1.0) * specular * uClick * 1.5;
    color += uGlassColor * exp(-distToCenter * 6.0) * uClick * 0.6;

    color *= smoothstep(1.5, 0.2, length(vUv - 0.5));

    gl_FragColor = vec4(color, 1.0);
}
`;

export default function LinkStartButton(props: LinkStartButtonProps) {
  const { theme } = useTheme();
  const active = theme === "dark" ? DARK_THEME : LIGHT_THEME;

  const {
    link,
    text = "Link Start",
    textFont = {
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      lineHeight: 1,
    },
    textColor = active.textColor,
    textGlow = active.textGlow,
    padding = "22px 56px",
    baseColor = active.baseColor,
    glassColor = active.glassColor,
    borderColor = active.borderColor,
    hoverSpeed = 0.6,
    borderRadius = 999,
    livePreview = false,
    disabled = false,
    className,
    onClick,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<number>(0);
  const clickRef = useRef<number>(0);
  const outerRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const uniformsRef = useRef({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uClick: { value: 0 },
    uBaseColor: { value: new THREE.Color() },
    uGlassColor: { value: new THREE.Color() },
    uResolution: { value: new THREE.Vector2(1, 1) },
  });

  useEffect(() => {
    uniformsRef.current.uBaseColor.value.set(baseColor);
    uniformsRef.current.uGlassColor.value.set(glassColor);
  }, [baseColor, glassColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;
    let lastTime = performance.now();
    let isIntersecting = false;

    let currentHoverValue = 0;
    let currentClickValue = 0;
    let timeAccumulator = 0;

    const renderLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(renderLoop);

      if (!isIntersecting && !livePreview) {
        lastTime = time;
        return;
      }

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const targetHover = hoverRef.current;
      currentHoverValue = THREE.MathUtils.lerp(currentHoverValue, targetHover, delta * 4);

      if (clickRef.current > 0) {
        currentClickValue = clickRef.current;
        clickRef.current = 0;
      }

      currentClickValue = THREE.MathUtils.lerp(currentClickValue, 0, delta * 6);

      const currentSpeed = THREE.MathUtils.lerp(0.15, hoverSpeed, currentHoverValue);
      timeAccumulator += delta * currentSpeed;

      uniformsRef.current.uTime.value = timeAccumulator;
      uniformsRef.current.uHover.value = currentHoverValue;
      uniformsRef.current.uClick.value = currentClickValue;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        uniformsRef.current.uResolution.value.set(width, height);
      }
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        isIntersecting = entry.isIntersecting;
      }
    });
    intersectionObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [livePreview, hoverSpeed]);

  const isLink = Boolean(link && link !== "");

  const handleMouseDownEvt = useCallback(() => {
    if (disabled) return;
    clickRef.current = 1.0;
    if (outerRef.current) outerRef.current.style.transform = "scale(0.96)";
  }, [disabled]);

  const handleMouseUpEvt = useCallback(() => {
    if (outerRef.current) outerRef.current.style.transform = "scale(1)";
  }, []);

  const handleMouseEnterEvt = useCallback(() => {
    if (disabled) return;
    hoverRef.current = 1;
    if (outerRef.current) outerRef.current.style.zIndex = "10";
  }, [disabled]);

  const handleMouseLeaveEvt = useCallback(() => {
    hoverRef.current = 0;
    if (outerRef.current) {
      outerRef.current.style.transform = "scale(1)";
      outerRef.current.style.zIndex = "1";
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        clickRef.current = 1.0;

        if (outerRef.current) {
          outerRef.current.style.transform = "scale(0.96)";
          setTimeout(() => {
            if (outerRef.current) outerRef.current.style.transform = "scale(1)";
          }, 150);
        }

        if (onClick) {
          onClick(e as unknown as React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>);
        } else if (isLink && outerRef.current instanceof HTMLAnchorElement) {
          outerRef.current.click();
        }
      }
    },
    [onClick, isLink, disabled]
  );

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    borderRadius,
    cursor: disabled ? "default" : "pointer",
    pointerEvents: disabled ? "none" : "auto",
    opacity: disabled ? 0.55 : 1,
    padding,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    backgroundColor: baseColor,
    boxShadow: `inset 0 0 0 1px ${borderColor}, 0 10px 30px -10px rgba(0,0,0,0.5)`,
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, z-index 0s",
    zIndex: 1,
    textDecoration: "none",
    outline: "none",
    border: "none",
    margin: 0,
    fontFamily: "inherit",
  };

  const content = (
    <>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          borderRadius,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      />

      <span className="link-start-text" data-text={text} style={{ color: textColor, ...textFont }}>
        {text}
      </span>

      <style jsx>{`
        .link-start-text {
          position: relative;
          display: inline-block;
          pointer-events: none;
          text-shadow: 0px 2px 10px ${textGlow};
        }
        .link-start-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: ${textColor};
          text-shadow:
            -3px -3px 0 #facc15,
            3px 3px 0 #5ec8f0;
          clip-path: inset(50% 50% 50% 50%);
          pointer-events: none;
        }
        :global(.link-start-btn:hover) .link-start-text::after {
          animation: link-start-glitch 1s steps(2, end);
        }
        @keyframes link-start-glitch {
          0% {
            clip-path: inset(80% -6px 0 0);
            transform: translate(-20px, -10px);
          }
          10% {
            clip-path: inset(10% -6px 85% 0);
            transform: translate(10px, 10px);
          }
          20% {
            clip-path: inset(80% -6px 0 0);
            transform: translate(-10px, 10px);
          }
          30% {
            clip-path: inset(10% -6px 85% 0);
            transform: translate(0px, 5px);
          }
          40% {
            clip-path: inset(50% -6px 30% 0);
            transform: translate(-5px, 0px);
          }
          50% {
            clip-path: inset(10% -6px 85% 0);
            transform: translate(5px, 0px);
          }
          60% {
            clip-path: inset(40% -6px 43% 0);
            transform: translate(5px, 10px);
          }
          70% {
            clip-path: inset(50% -6px 30% 0);
            transform: translate(-10px, 10px);
          }
          80% {
            clip-path: inset(80% -6px 5% 0);
            transform: translate(20px, -10px);
          }
          90% {
            clip-path: inset(80% -6px 0 0);
            transform: translate(-10px, 0px);
          }
          100% {
            clip-path: inset(80% -6px 0 0);
            transform: translate(0);
          }
        }
      `}</style>
    </>
  );

  if (isLink) {
    return (
      <a
        href={link}
        ref={outerRef as React.Ref<HTMLAnchorElement>}
        className={`link-start-btn${className ? ` ${className}` : ""}`}
        style={containerStyle}
        onMouseEnter={handleMouseEnterEvt}
        onMouseLeave={handleMouseLeaveEvt}
        onMouseDown={handleMouseDownEvt}
        onMouseUp={handleMouseUpEvt}
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={outerRef as React.Ref<HTMLButtonElement>}
      className={`link-start-btn${className ? ` ${className}` : ""}`}
      style={containerStyle}
      onMouseEnter={handleMouseEnterEvt}
      onMouseLeave={handleMouseLeaveEvt}
      onMouseDown={handleMouseDownEvt}
      onMouseUp={handleMouseUpEvt}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    >
      {content}
    </button>
  );
}