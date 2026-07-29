"use client";

import * as React from "react";
import { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * PARTICLE GLOBE
 *
 * Adapted from a Framer marketplace component (vanilla Three.js — not
 * React Three Fiber, so it must NOT be wrapped in an r3f <Canvas>; it mounts
 * and drives its own renderer directly via `mountRef`). Landmass is built by
 * sampling `earthMap` (a black-land/white-ocean image) with a Fibonacci
 * sphere distribution, so the dot layout is real geography, not procedural
 * noise.
 *
 * Changes from the original Framer file:
 *  - Removed `addPropertyControls`/`ControlType`/`useIsStaticRenderer`/
 *    `RenderTarget` (Framer's plugin SDK — not installed here, not
 *    meaningful outside the Framer canvas). The component always renders
 *    interactively now.
 *  - Flattened the nested `layout`/`styling`/`particleSizing`/`interactions`/
 *    `uiCustomization` prop groups (that nesting only existed to organize
 *    Framer's property panel) into one flat, typed props interface.
 *  - `backgroundColor` defaults to transparent (not part of either theme
 *    below — it's what lets AmbientBackground show through behind the
 *    globe, independent of light/dark palette).
 *  - `earthMap` defaults to the uploaded /textures/earth-water.png.
 *
 * THEME: LIGHT_THEME (the original Framer component's own ocean/dot/marker
 * colors) is live. DARK_THEME is last pass's holographic-blue retint, kept
 * as a named backup for the future dark-mode toggle — do not delete it.
 *  - `markers` defaults to a single "DHARWAD, IN" pin; the original
 *    showcase markers (Kinshasa/Tokyo/NY/London/Sydney/São Paulo) are kept
 *    below, commented out, exactly as requested.
 *  - Added `touchAction: "none"` on the mount container so drag-to-rotate
 *    works on mobile instead of fighting page scroll.
 *  - The "plus"-style marker card's body section now only renders when a
 *    marker actually has an image/description/button — previously a
 *    label-only marker (like Dharwad) would still pop open an empty gap
 *    on hover, since that section rendered unconditionally.
 */

// --- Types ---
export interface GlobeMarker {
  label: string;
  lat: number;
  lng: number;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface ParticleGlobeProps {
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  earthMap?: string;
  invertMap?: boolean;
  oceanColorHighlight?: string;
  oceanColorDark?: string;
  oceanColorLight?: string;
  dotColor?: string;
  dotDensity?: number;
  rotationSpeed?: number;
  globeScale?: number;
  positionX?: number;
  positionY?: number;
  baseSize?: number;
  sizeRandomness?: number;
  enableHover?: boolean;
  hoverDelay?: number;
  hoverParticleColor?: string;
  lensRadius?: number;
  lensMagnification?: number;
  lensBulge?: number;
  lensParticleScale?: number;
  markers?: GlobeMarker[];
  markerType?: "pin" | "plus";
  useCustomCursor?: boolean;
  cursorColor?: string;
  cursorLineOpacity?: number;
  cursorDotSize?: number;
  markerBgColor?: string;
  markerIconBgColor?: string;
  markerActiveBgColor?: string;
  markerIconColor?: string;
  markerActiveIconColor?: string;
  markerTextColor?: string;
  pinColor?: string;
}

// --- Theme ---
export const LIGHT_THEME = {
  oceanColorHighlight: "#FAFAFC",
  oceanColorDark: "#A2B9DB",
  oceanColorLight: "#D1E0F2",
  dotColor: "#FFFFFF",
  hoverParticleColor: "#C8D7FA",
  cursorColor: "#D4D4D4",
  markerBgColor: "#1E1E23",
  markerIconBgColor: "#2A2A2A",
  markerActiveBgColor: "#FFFFFF",
  markerIconColor: "#FFFFFF",
  markerActiveIconColor: "#111111",
  markerTextColor: "#FFFFFF",
  pinColor: "#FFFFFF",
};

// Backup for the future dark-mode toggle — do not delete.
export const DARK_THEME = {
  oceanColorHighlight: "#8fd9ff",
  oceanColorDark: "#0a1c2e",
  oceanColorLight: "#3f8fa3",
  dotColor: "#e0f2fe",
  hoverParticleColor: "#a78bfa",
  cursorColor: "#8fd9ff",
  markerBgColor: "#0d1e24",
  markerIconBgColor: "#16232a",
  markerActiveBgColor: "#e0f2fe",
  markerIconColor: "#e0f2fe",
  markerActiveIconColor: "#0a1620",
  markerTextColor: "#e4d9bc",
  pinColor: "#8fd9ff",
};

// --- Default markers ---
// Kept per request: the original showcase pins stay in the file, commented
// out, so they're one uncomment away from coming back. Only Dharwad (home)
// is active.
const DEFAULT_MARKERS: GlobeMarker[] = [
  // {
  //   label: "KINSHASA, DRC",
  //   lat: -4.4419,
  //   lng: 15.2663,
  //   description: "A major cultural and intellectual center.",
  //   image:
  //     "https://images.unsplash.com/photo-1547471080-7fc2caa7f5a6?auto=format&fit=crop&q=80&w=600",
  //   buttonText: "Explore More",
  //   buttonLink: "https://framer.com",
  // },
  // {
  //   label: "TOKYO, JPN",
  //   lat: 35.6762,
  //   lng: 139.6503,
  //   description: "The bustling capital of Japan.",
  //   image:
  //     "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600",
  //   buttonText: "View City",
  //   buttonLink: "https://framer.com",
  // },
  // {
  //   label: "NEW YORK, USA",
  //   lat: 40.7128,
  //   lng: -74.006,
  //   description: "The city that never sleeps.",
  //   image:
  //     "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600",
  //   buttonText: "Discover",
  //   buttonLink: "https://framer.com",
  // },
  // { label: "LONDON, UK", lat: 51.5074, lng: -0.1278 },
  // { label: "SYDNEY, AUS", lat: -33.8688, lng: 151.2093 },
  // { label: "SAO PAULO, BRA", lat: -23.5505, lng: -46.6333 },

  // Home base.
  { label: "DHARWAD, IN", lat: 15.4589, lng: 75.0078 },
];

// --- Helper Functions ---
function parseColor(colorStr?: string): { color: THREE.Color; alpha: number } {
  const c = new THREE.Color();
  let a = 1.0;
  if (!colorStr) return { color: c, alpha: a };

  if (colorStr.startsWith("rgba") || colorStr.startsWith("hsla")) {
    const parts = colorStr.match(/[\d.]+/g);
    if (parts && parts.length >= 4) {
      a = parseFloat(parts[3]);
    }
    c.setStyle(colorStr);
  } else if (colorStr.startsWith("#") && colorStr.length === 9) {
    a = parseInt(colorStr.slice(7, 9), 16) / 255;
    c.set(colorStr.slice(0, 7));
  } else {
    c.set(colorStr);
  }
  return { color: c, alpha: a };
}

// --- Icons & UI Styles ---
function LocationIcon({ color, shadowColor }: { color: string; shadowColor?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0px 0px 4px ${shadowColor || color})` }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z"
        fill={color}
      />
    </svg>
  );
}

const markerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px 6px 6px",
  borderRadius: "30px",
  background: "rgba(30, 30, 30, 0.4)",
  backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.0) 100%)",
  backdropFilter: "blur(12px) saturate(120%)",
  WebkitBackdropFilter: "blur(12px) saturate(120%)",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSize: "14px",
  fontWeight: 400,
  letterSpacing: "0.2px",
  willChange: "transform, opacity",
};

const butteryEase = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function ParticleGlobe({
  className,
  style,
  backgroundColor = "transparent",
  earthMap = "/textures/earth-water.png",
  invertMap = false,
  oceanColorHighlight = LIGHT_THEME.oceanColorHighlight,
  oceanColorDark = LIGHT_THEME.oceanColorDark,
  oceanColorLight = LIGHT_THEME.oceanColorLight,
  dotColor = LIGHT_THEME.dotColor,
  dotDensity = 80000,
  rotationSpeed = 0.06,
  globeScale = 1.1,
  positionX = 0,
  positionY = 0,
  baseSize = 5,
  sizeRandomness = 1,
  enableHover = true,
  hoverDelay = 0,
  hoverParticleColor = LIGHT_THEME.hoverParticleColor,
  lensRadius = 0.45,
  lensMagnification = 0.02,
  lensBulge = 0.02,
  lensParticleScale = 1,
  markers = DEFAULT_MARKERS,
  markerType = "plus",
  useCustomCursor = true,
  cursorColor = LIGHT_THEME.cursorColor,
  cursorLineOpacity = 0.2,
  cursorDotSize = 5,
  markerBgColor = LIGHT_THEME.markerBgColor,
  markerIconBgColor = LIGHT_THEME.markerIconBgColor,
  markerActiveBgColor = LIGHT_THEME.markerActiveBgColor,
  markerIconColor = LIGHT_THEME.markerIconColor,
  markerActiveIconColor = LIGHT_THEME.markerActiveIconColor,
  markerTextColor = LIGHT_THEME.markerTextColor,
  pinColor = LIGHT_THEME.pinColor,
}: ParticleGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useRef(false);
  const markersRef = useRef(markers);
  const markerElsRef = useRef<(HTMLDivElement | null)[]>([]);

  const markersDataRef = useRef<
    { x: number; y: number; visible: boolean; localPos: THREE.Vector3 }[]
  >([]);

  const parsedCursor = parseColor(cursorColor);
  const rgbCursor = `${Math.round(parsedCursor.color.r * 255)}, ${Math.round(
    parsedCursor.color.g * 255
  )}, ${Math.round(parsedCursor.color.b * 255)}`;

  const parsedPin = parseColor(pinColor);
  const pinShadowColor = `rgba(${Math.round(parsedPin.color.r * 255)}, ${Math.round(
    parsedPin.color.g * 255
  )}, ${Math.round(parsedPin.color.b * 255)}, 0.4)`;

  // Pre-calculate local positions
  useEffect(() => {
    markersRef.current = markers;
    markerElsRef.current = markerElsRef.current.slice(0, markers.length);

    markersDataRef.current = markers.map((marker) => {
      const latRad = marker.lat * (Math.PI / 180);
      const lngRad = marker.lng * (Math.PI / 180);

      const y = Math.sin(latRad);
      const radiusAtY = Math.cos(latRad);
      const x = Math.sin(lngRad) * radiusAtY;
      const z = Math.cos(lngRad) * radiusAtY;

      const markerRadius = 1.02;
      const localPos = new THREE.Vector3(x * markerRadius, y * markerRadius, z * markerRadius);

      return { x: -9999, y: -9999, visible: false, localPos };
    });
  }, [markers]);

  useEffect(() => {
    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    // Pre-allocate zero-garbage variables
    const tempWorldPos = new THREE.Vector3();
    const tempCenter = new THREE.Vector3();
    const tempCamDir = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();
    const inverseMatrix = new THREE.Matrix4();
    const localRay = new THREE.Ray();
    const intersectPoint = new THREE.Vector3();
    const mathSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.98);

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const container = mountRef.current;
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    mainGroup.rotation.order = "YXZ";

    let appearProgress = 0.0;
    const effectiveScale = Math.min(1, width / 2.4, height / 2.4) * globeScale;

    let baseScale = effectiveScale;
    let currentScale = effectiveScale;

    mainGroup.position.set(positionX, positionY, 0);
    mainGroup.scale.setScalar(currentScale);

    let targetRotationX = 0.2;
    let targetRotationY = -Math.PI / 4;

    mainGroup.rotation.set(0.6, -Math.PI / 1.5, 0);

    scene.add(mainGroup);

    // 2. Base Mesh (Animated Ocean Shader)
    const baseGeo = new THREE.SphereGeometry(0.98, 64, 64);

    const colorH = parseColor(oceanColorHighlight).color;
    const colorD = parseColor(oceanColorDark).color;
    const colorL = parseColor(oceanColorLight).color;

    const oceanUniforms = {
      uTime: { value: 0.0 },
      uAppear: { value: appearProgress },
      uColorHighlight: { value: new THREE.Vector3(colorH.r, colorH.g, colorH.b) },
      uColorDark: { value: new THREE.Vector3(colorD.r, colorD.g, colorD.b) },
      uColorLight: { value: new THREE.Vector3(colorL.r, colorL.g, colorL.b) },
    };

    const baseMat = new THREE.ShaderMaterial({
      uniforms: oceanUniforms,
      vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * vec4(vPosition, 1.0);
                }
            `,
      fragmentShader: `
                uniform float uTime;
                uniform float uAppear;
                uniform vec3 uColorHighlight;
                uniform vec3 uColorDark;
                uniform vec3 uColorLight;

                varying vec3 vNormal;
                varying vec3 vPosition;

                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                float snoise(vec3 v) {
                    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i  = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min( g.xyz, l.zxy );
                    vec3 i2 = max( g.xyz, l.zxy );
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute( permute( permute(
                                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4( x.xy, y.xy );
                    vec4 b1 = vec4( x.zw, y.zw );
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
                }

                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(-vPosition);
                    
                    vec3 lightDir = normalize(vec3(1.0, -0.2, 0.5));
                    float ndotl = dot(normal, lightDir);
                    float rightSide = smoothstep(-0.5, 1.0, ndotl);
                    
                    float n1 = snoise(normal * 2.0 + uTime * 0.15) * 0.5 + 0.5;
                    float n2 = snoise(normal * 4.0 - uTime * 0.1) * 0.5 + 0.5;
                    
                    float mixVal = rightSide * 0.7 + n1 * 0.3;
                    vec3 base = mix(uColorHighlight, uColorDark, smoothstep(0.1, 0.9, mixVal));
                    base = mix(base, uColorLight, n2 * 0.2);
                    
                    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
                    float rimNoise = snoise(normal * 12.0 + uTime * 0.2) * 0.5 + 0.5;
                    float rimStrength = smoothstep(0.65 - rimNoise * 0.1, 0.85, rim);
                    
                    vec3 finalColor = mix(base, uColorHighlight, rimStrength * 0.6);
                    
                    // Smooth ocean fade in
                    float easeAppear = 1.0 - pow(1.0 - clamp(uAppear * 1.5, 0.0, 1.0), 3.0);
                    gl_FragColor = vec4(finalColor, easeAppear);
                }
            `,
      transparent: true,
      opacity: 1,
      depthWrite: true,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.renderOrder = 0;
    mainGroup.add(baseMesh);

    // 3. Globe Small Particles
    let dotsMesh: THREE.Points | null = null;
    const parsedDotLocal = parseColor(dotColor);
    const parsedHoverColor = parseColor(hoverParticleColor);

    const dotsUniforms = {
      color: { value: parsedDotLocal.color },
      uHoverColor: { value: parsedHoverColor.color },
      opacity: { value: parsedDotLocal.alpha },
      uHoverPos: { value: new THREE.Vector3(0, 0, 0) },
      uHoverActive: { value: 0.0 },
      uHoverRadius: { value: lensRadius },
      uTime: { value: 0.0 },
      uAppear: { value: appearProgress },
      uLensMag: { value: lensMagnification },
      uLensBulge: { value: lensBulge },
      uLensScale: { value: lensParticleScale },
    };

    const buildGlobe = (imgData: ImageData | null) => {
      try {
        const positions: number[] = [];
        const sizes: number[] = [];
        const randoms: number[] = [];
        const phi = Math.PI * (3 - Math.sqrt(5));
        const actualNumPoints = dotDensity * 3;

        for (let i = 0; i < actualNumPoints; i++) {
          const rawY = 1 - (i / (actualNumPoints - 1)) * 2;
          const radiusAtY = Math.sqrt(1 - rawY * rawY);
          const theta = phi * i;

          let x = Math.cos(theta) * radiusAtY;
          let y = rawY;
          let z = Math.sin(theta) * radiusAtY;

          x += (Math.random() - 0.5) * 0.008;
          y += (Math.random() - 0.5) * 0.008;
          z += (Math.random() - 0.5) * 0.008;

          const len = Math.sqrt(x * x + y * y + z * z);
          x /= len;
          y /= len;
          z /= len;

          const u = 0.5 + Math.atan2(x, z) / (2 * Math.PI);
          const v = 0.5 - Math.asin(y) / Math.PI;

          let isValid = false;

          if (imgData) {
            const px = Math.min(Math.floor(u * imgData.width), imgData.width - 1);
            const py = Math.min(Math.floor(v * imgData.height), imgData.height - 1);

            if (px >= 0 && py >= 0) {
              const r = imgData.data[(py * imgData.width + px) * 4];
              const isDark = r < 128;
              if (invertMap ? !isDark : isDark) {
                isValid = true;
              }
            }
          } else {
            // Sparse dot layout fallback if no map is provided
            if (Math.random() < 0.35) {
              isValid = true;
            }
          }

          if (isValid) {
            const randVal = Math.random();
            const finalSize = baseSize * (1.0 + (randVal - 0.5) * sizeRandomness * 2.0);

            positions.push(x, y, z);
            sizes.push(Math.max(0.1, finalSize));
            randoms.push(randVal);
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
        geo.setAttribute("aRandom", new THREE.Float32BufferAttribute(randoms, 1));

        const mat = new THREE.ShaderMaterial({
          uniforms: dotsUniforms,
          vertexShader: `
                        attribute float aSize;
                        attribute float aRandom;
                        
                        uniform vec3 uHoverPos;
                        uniform float uHoverActive;
                        uniform float uHoverRadius;
                        uniform float uTime;
                        uniform float uAppear;
                        
                        uniform float uLensMag;
                        uniform float uLensBulge;
                        uniform float uLensScale;
                        
                        varying float vAlpha;
                        varying float vEffect;
                        
                        void main() { 
                            vec3 pos = position;
                            
                            // Particles Cinematic Assembly Animation
                            float delay = aRandom * 0.5; 
                            float p = clamp((uAppear - delay) / 0.5, 0.0, 1.0); 
                            float easeP = 1.0 - pow(1.0 - p, 3.0); 
                            
                            vec3 normal = normalize(pos);
                            vec3 startPos = pos + normal * (1.0 - easeP) * (0.5 + aRandom * 0.5);
                            pos = mix(startPos, pos, easeP);

                            float dist = distance(pos, uHoverPos);
                            float effect = 1.0 - smoothstep(0.0, uHoverRadius, dist);
                            vEffect = effect * uHoverActive;
                            
                            if (vEffect > 0.0) {
                                vec3 toCenter = pos - uHoverPos;
                                float distToCenter = length(toCenter);
                                
                                if (distToCenter > 0.001) {
                                    vec3 tangentPush = normalize(toCenter - dot(toCenter, normal) * normal);
                                    float magnify = sin(effect * 3.14159) * uLensMag * uHoverActive;
                                    pos += tangentPush * magnify;
                                    
                                    float bulge = sin(effect * 1.570796) * uLensBulge * uHoverActive;
                                    pos += normal * bulge;
                                }
                            }

                            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0); 
                            gl_Position = projectionMatrix * mvPosition; 
                            
                            float pulse = sin(uTime * 2.0 + aRandom * 10.0) * 0.15 + 0.85;
                            float scale = 1.0 + (effect * uLensScale * uHoverActive);
                            scale *= easeP; 

                            gl_PointSize = (aSize * scale * pulse) * (2.0 / -mvPosition.z); 
                            vAlpha = 0.4 + 0.6 * aRandom; 
                        }
                    `,
          fragmentShader: `
                        uniform vec3 color; 
                        uniform vec3 uHoverColor;
                        uniform float opacity;
                        uniform float uAppear;
                        
                        varying float vAlpha;
                        varying float vEffect;
                        
                        void main() { 
                            float dist = length(gl_PointCoord - vec2(0.5)); 
                            if (dist > 0.5) discard; 
                            
                            float strength = 1.0 - (dist * 2.0);
                            strength = pow(strength, 1.2);
                            
                            vec3 finalColor = mix(color, uHoverColor, vEffect);
                            gl_FragColor = vec4(finalColor, strength * opacity * vAlpha * uAppear); 
                        }
                    `,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        dotsMesh = new THREE.Points(geo, mat);
        dotsMesh.renderOrder = 1;
        mainGroup.add(dotsMesh);
      } catch {
        // swallow — a failed globe build just leaves an empty ocean sphere
      }
    };

    if (earthMap) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = earthMap;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("no 2d context");
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          buildGlobe(imgData);
        } catch {
          buildGlobe(null);
        }
      };
      img.onerror = () => buildGlobe(null);
    } else {
      buildGlobe(null);
    }

    // 4. Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-2, -2);
    let targetHoverActive = 0;
    let currentHoverActive = 0;
    const localHoverPos = new THREE.Vector3();

    let rawMouseX = -9999;
    let rawMouseY = -9999;
    let cursorPosX = -9999;
    let cursorPosY = -9999;
    let currentSnappedIdx = -1;
    let zoomedIdx = -1;
    let isHoveringGlobe = false;
    let isHoveringUI = false;
    let hoverStartTimestamp = 0;

    // Guide-line crosshair should only appear once the cursor is close to
    // the globe itself, not merely anywhere inside the (larger, square)
    // mount container. Fraction of min(width, height); lower = must get
    // closer to the globe before the lines fade in.
    const CURSOR_ACTIVATION_RADIUS_FACTOR = 0.42;
    const updateCursorVisibility = (clientX: number, clientY: number) => {
      if (!cursorRef.current || !useCustomCursor) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const activationRadius = Math.min(width, height) * CURSOR_ACTIVATION_RADIUS_FACTOR;
      const near = Math.hypot(x - width / 2, y - height / 2) < activationRadius;
      const targetOpacity = near ? "1" : "0";
      if (cursorRef.current.style.opacity !== targetOpacity) {
        cursorRef.current.style.opacity = targetOpacity;
      }
    };


    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(".marker-button");
      if (btn) return;

      const markerContainer = target.closest(".marker-glass-container");
      if (markerType === "plus" && currentSnappedIdx !== -1 && markerContainer) {
        zoomedIdx = zoomedIdx === currentSnappedIdx ? -1 : currentSnappedIdx;
        return;
      }

      zoomedIdx = -1;
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      dragVelocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      rawMouseX = e.clientX - rect.left;
      rawMouseY = e.clientY - rect.top;

      const target = e.target as HTMLElement;
      isHoveringUI = !!target.closest(".marker-glass-container") || !!target.closest(".marker-pin-wrap");

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        dragVelocity.x = deltaX * 0.005;
        dragVelocity.y = deltaY * 0.005;

        targetRotationY += dragVelocity.x;
        targetRotationX += dragVelocity.y;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      updateCursorVisibility(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onPointerLeave = () => {
      if (!isDragging) {
        rawMouseX = -9999;
        rawMouseY = -9999;
        isHoveringUI = false;
      }
      if (cursorRef.current && useCustomCursor) {
        cursorRef.current.style.opacity = "0";
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      updateCursorVisibility(e.clientX, e.clientY);
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointerenter", onPointerEnter);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointerleave", onPointerLeave);

    const snapMarker = (idx: number) => {
      const el = markerElsRef.current[idx];
      if (!el) return;
      const glassContainer = el.querySelector<HTMLElement>(".marker-glass-container");
      const iconBox = el.querySelector<HTMLElement>(".marker-icon-box");
      const iconSvg = el.querySelector<HTMLElement>(".marker-svg");
      const textWrap = el.querySelector<HTMLElement>(".marker-title-wrap");
      const bodyWrap = el.querySelector<HTMLElement>(".marker-body-wrap");

      if (glassContainer) {
        glassContainer.style.backgroundColor = "var(--marker-bg)";
        glassContainer.style.backgroundImage =
          "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)";
        glassContainer.style.backdropFilter = "blur(24px) saturate(200%)";
        glassContainer.style.setProperty("-webkit-backdrop-filter", "blur(24px) saturate(200%)");
        glassContainer.style.borderColor = "var(--marker-border-active)";
        glassContainer.style.boxShadow =
          "0 16px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)";
        glassContainer.style.pointerEvents = "auto";
        glassContainer.style.cursor = "pointer";
      }
      if (iconBox) {
        iconBox.style.backgroundColor = "var(--marker-active-bg)";
      }
      if (iconSvg) {
        iconSvg.style.transform = "rotate(45deg) scale(1.1)";
        iconSvg.style.fill = "var(--marker-active-icon-color)";
      }
      if (textWrap) {
        textWrap.style.maxWidth = "250px";
        textWrap.style.opacity = "1";
      }
      if (bodyWrap) {
        bodyWrap.style.maxHeight = "400px";
        bodyWrap.style.opacity = "1";
        bodyWrap.style.marginTop = "8px";
      }

      const pinWrap = el.querySelector<HTMLElement>(".marker-pin-wrap");
      if (pinWrap) {
        pinWrap.style.transform = "scale(1.15)";
      }
    };

    const unSnapMarker = (idx: number) => {
      const el = markerElsRef.current[idx];
      if (!el) return;
      const glassContainer = el.querySelector<HTMLElement>(".marker-glass-container");
      const iconBox = el.querySelector<HTMLElement>(".marker-icon-box");
      const iconSvg = el.querySelector<HTMLElement>(".marker-svg");
      const textWrap = el.querySelector<HTMLElement>(".marker-title-wrap");
      const bodyWrap = el.querySelector<HTMLElement>(".marker-body-wrap");

      if (glassContainer) {
        glassContainer.style.backgroundColor = "rgba(20, 20, 25, 0.0)";
        glassContainer.style.backgroundImage = "none";
        glassContainer.style.backdropFilter = "blur(0px)";
        glassContainer.style.setProperty("-webkit-backdrop-filter", "blur(0px)");
        glassContainer.style.borderColor = "rgba(0,0,0,0)";
        glassContainer.style.boxShadow = "none";
        glassContainer.style.pointerEvents = "none";
        glassContainer.style.cursor = "default";
      }
      if (iconBox) {
        iconBox.style.backgroundColor = "var(--marker-icon-bg)";
      }
      if (iconSvg) {
        iconSvg.style.transform = "rotate(0deg) scale(1)";
        iconSvg.style.fill = "var(--marker-icon-color)";
      }
      if (textWrap) {
        textWrap.style.maxWidth = "0px";
        textWrap.style.opacity = "0";
      }
      if (bodyWrap) {
        bodyWrap.style.maxHeight = "0px";
        bodyWrap.style.opacity = "0";
        bodyWrap.style.marginTop = "0px";
      }

      const pinWrap = el.querySelector<HTMLElement>(".marker-pin-wrap");
      if (pinWrap) {
        pinWrap.style.transform = "scale(1)";
      }
    };

    let animationFrameId: number | null = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isIntersecting.current) return;

      const time = performance.now() * 0.001;

      // Cinematic Reveal Lerp
      if (appearProgress < 1.0) {
        appearProgress += (1.0 - appearProgress) * 0.008;
        if (appearProgress > 0.999) appearProgress = 1.0;

        if (baseMesh.material instanceof THREE.ShaderMaterial) {
          baseMesh.material.uniforms.uAppear.value = appearProgress;
        }
        if (dotsMesh && dotsMesh.material instanceof THREE.ShaderMaterial) {
          dotsMesh.material.uniforms.uAppear.value = appearProgress;
        }
      }

      if (baseMesh.material instanceof THREE.ShaderMaterial) {
        baseMesh.material.uniforms.uTime.value = time;
      }
      if (dotsMesh && dotsMesh.material instanceof THREE.ShaderMaterial) {
        dotsMesh.material.uniforms.uTime.value = time;
      }

      // Zoom / Fly-To Lerp Logic
      if (zoomedIdx !== -1 && markersRef.current[zoomedIdx]) {
        const marker = markersRef.current[zoomedIdx];
        const latRad = marker.lat * (Math.PI / 180);
        const lngRad = marker.lng * (Math.PI / 180);

        targetRotationY = -lngRad;
        targetRotationX = latRad;

        currentScale += (baseScale * 1.55 - currentScale) * 0.08;
      } else {
        const introEffectiveScale = baseScale * (0.85 + 0.15 * appearProgress);
        currentScale += (introEffectiveScale - currentScale) * 0.08;
      }
      mainGroup.scale.setScalar(currentScale);

      // Apply momentum, auto-rotation, and smooth damping
      if (!isDragging && zoomedIdx === -1 && currentSnappedIdx === -1) {
        const cinematicSpin = (1.0 - appearProgress) * 0.015;
        targetRotationY += rotationSpeed * 0.016 + cinematicSpin;
      }

      if (!isDragging) {
        targetRotationY += dragVelocity.x;
        targetRotationX += dragVelocity.y;
        dragVelocity.x *= 0.95;
        dragVelocity.y *= 0.95;
      }

      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.1;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.1;

      renderer.render(scene, camera);

      // 2. High-Performance Zero-Garbage Marker Positioning
      tempCenter.set(0, 0, 0).applyMatrix4(mainGroup.matrixWorld);

      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach((_marker, idx) => {
          const el = markerElsRef.current[idx];
          const mData = markersDataRef.current[idx];
          if (!el || !mData) return;

          tempWorldPos.copy(mData.localPos).applyMatrix4(mainGroup.matrixWorld);

          tempNormal.copy(tempWorldPos).sub(tempCenter).normalize();
          tempCamDir.copy(camera.position).sub(tempWorldPos).normalize();
          const dot = tempNormal.dot(tempCamDir);

          let opacity = 1;
          if (dot < -0.1) opacity = 0;
          else if (dot < 0.2) opacity = (dot + 0.1) / 0.3;

          if (opacity > 0) {
            tempWorldPos.project(camera);
            const screenX = (tempWorldPos.x * 0.5 + 0.5) * width;
            const screenY = (-(tempWorldPos.y * 0.5) + 0.5) * height;

            el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`;
            el.style.opacity = (Math.max(0, Math.min(1, opacity)) * appearProgress).toFixed(2);
            el.style.visibility = "visible";

            mData.x = screenX;
            mData.y = screenY;
            mData.visible = true;
          } else {
            el.style.opacity = "0";
            el.style.visibility = "hidden";
            mData.visible = false;
          }
        });
      }

      // 3. Snapping Logic (Only active if markerType is "plus")
      let nextSnapIdx = -1;

      if (markerType === "plus") {
        if (zoomedIdx !== -1) {
          nextSnapIdx = zoomedIdx;
        } else if (isHoveringUI && currentSnappedIdx !== -1) {
          nextSnapIdx = currentSnappedIdx;
        } else if (!isDragging && rawMouseX !== -9999) {
          if (
            currentSnappedIdx !== -1 &&
            markersDataRef.current[currentSnappedIdx] &&
            markersDataRef.current[currentSnappedIdx].visible
          ) {
            const dist = Math.hypot(
              markersDataRef.current[currentSnappedIdx].x - rawMouseX,
              markersDataRef.current[currentSnappedIdx].y - rawMouseY
            );
            if (dist < 140) nextSnapIdx = currentSnappedIdx;
          }

          if (nextSnapIdx === -1) {
            let minDist = 40;
            markersDataRef.current.forEach((pos, idx) => {
              if (pos.visible) {
                const dist = Math.hypot(pos.x - rawMouseX, pos.y - rawMouseY);
                if (dist < minDist) {
                  minDist = dist;
                  nextSnapIdx = idx;
                }
              }
            });
          }
        }
      }

      // 4. State changes for snapping
      if (nextSnapIdx !== currentSnappedIdx) {
        if (currentSnappedIdx !== -1) unSnapMarker(currentSnappedIdx);
        if (nextSnapIdx !== -1) snapMarker(nextSnapIdx);
        currentSnappedIdx = nextSnapIdx;
      }

      // 5. Cursor Target Calculation & Lerping
      let targetX = rawMouseX;
      let targetY = rawMouseY;
      if (markerType === "plus" && currentSnappedIdx !== -1 && markersDataRef.current[currentSnappedIdx]) {
        targetX = markersDataRef.current[currentSnappedIdx].x;
        targetY = markersDataRef.current[currentSnappedIdx].y;
      }

      if (rawMouseX !== -9999) {
        if (cursorPosX === -9999) {
          cursorPosX = rawMouseX;
          cursorPosY = rawMouseY;
        } else {
          cursorPosX += (targetX - cursorPosX) * 0.15;
          cursorPosY += (targetY - cursorPosY) * 0.15;
        }
      } else {
        cursorPosX = -9999;
        cursorPosY = -9999;
      }

      // 6. High Performance Raycast Update (Zero allocations)
      if (cursorPosX !== -9999) {
        mouse.x = (cursorPosX / width) * 2 - 1;
        mouse.y = -(cursorPosY / height) * 2 + 1;
      } else {
        mouse.x = -2;
        mouse.y = -2;
      }

      if (enableHover && cursorPosX !== -9999) {
        raycaster.setFromCamera(mouse, camera);

        inverseMatrix.copy(mainGroup.matrixWorld).invert();
        localRay.copy(raycaster.ray).applyMatrix4(inverseMatrix);

        const isIntersected = localRay.intersectSphere(mathSphere, intersectPoint) !== null;

        if (isIntersected) {
          if (!isHoveringGlobe) {
            isHoveringGlobe = true;
            hoverStartTimestamp = performance.now();
          }
          if (performance.now() - hoverStartTimestamp >= hoverDelay * 1000) {
            targetHoverActive = 1.0;
            localHoverPos.copy(intersectPoint);
          }
        } else {
          isHoveringGlobe = false;
          targetHoverActive = 0.0;
        }
      } else {
        targetHoverActive = 0.0;
      }

      currentHoverActive += (targetHoverActive - currentHoverActive) * 0.15;
      if (dotsMesh && dotsMesh.material instanceof THREE.ShaderMaterial) {
        dotsMesh.material.uniforms.uHoverActive.value = currentHoverActive;
        if (currentHoverActive > 0.01) {
          dotsMesh.material.uniforms.uHoverPos.value.copy(localHoverPos);
        }
      }

      // 7. Apply to Custom Cursor DOM via translate3d
      if (cursorRef.current && useCustomCursor && cursorPosX !== -9999) {
        cursorRef.current.style.transform = `translate3d(${cursorPosX}px, ${cursorPosY}px, 0)`;
      }
    };

    const visibilityObserver = new IntersectionObserver((entries) => {
      isIntersecting.current = entries[0].isIntersecting;
    });
    visibilityObserver.observe(container);

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      width = entries[0].contentRect.width;
      height = entries[0].contentRect.height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointerenter", onPointerEnter);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointerleave", onPointerLeave);

      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      scene.clear();

      renderer.forceContextLoss();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    earthMap,
    invertMap,
    oceanColorHighlight,
    oceanColorDark,
    oceanColorLight,
    dotColor,
    dotDensity,
    baseSize,
    sizeRandomness,
    globeScale,
    rotationSpeed,
    positionX,
    positionY,
    enableHover,
    hoverDelay,
    hoverParticleColor,
    lensRadius,
    lensMagnification,
    lensBulge,
    lensParticleScale,
    markerType,
    useCustomCursor,
  ]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minWidth: 100,
        minHeight: 100,
        ...style,
        position: "relative",
        background: backgroundColor,
        overflow: "hidden",
        cursor: useCustomCursor ? "none" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",

        // Injecting CSS Custom Properties mapping to prop values
        ["--marker-bg" as string]: markerBgColor,
        ["--marker-border-active" as string]: `rgba(${rgbCursor}, 0.3)`,
        ["--marker-icon-bg" as string]: markerIconBgColor,
        ["--marker-active-bg" as string]: markerActiveBgColor,
        ["--marker-icon-color" as string]: markerIconColor,
        ["--marker-active-icon-color" as string]: markerActiveIconColor,
        ["--marker-text-color" as string]: markerTextColor,
      }}
    >
      {/* Custom Cursor Crosshair Layer */}
      {useCustomCursor && (
        <div
          ref={cursorRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 99999,
            opacity: 0,
            transition: `opacity 0.3s ${butteryEase}`,
            willChange: "transform",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "200vw",
              height: "1px",
              background: `rgba(${rgbCursor}, ${cursorLineOpacity})`,
              top: "0",
              left: "-100vw",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "1px",
              height: "200vh",
              background: `rgba(${rgbCursor}, ${cursorLineOpacity})`,
              top: "-100vh",
              left: "0",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: `${cursorDotSize}px`,
              height: `${cursorDotSize}px`,
              background: `rgb(${rgbCursor})`,
              boxShadow: `0 0 10px rgb(${rgbCursor})`,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* 3D Canvas Container */}
      <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", zIndex: 1 }} />

      {/* Interactive Markers UI Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
          overflow: "hidden",
        }}
      >
        {markers.map((marker, idx) => {
          const hasBody = Boolean(marker.image || marker.description || marker.buttonText);
          return (
            <div
              key={idx}
              ref={(el) => {
                markerElsRef.current[idx] = el;
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                willChange: "transform, opacity",
                pointerEvents: "none",
              }}
            >
              {markerType === "plus" ? (
                <div
                  className="marker-glass-container"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "rgba(20, 20, 25, 0)",
                    backdropFilter: "blur(0px)",
                    WebkitBackdropFilter: "blur(0px)",
                    borderRadius: "10px",
                    padding: "4px",
                    border: `1px solid rgba(0, 0, 0, 0)`,
                    transition:
                      "background-color 0.5s ease, backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease",
                    transform: "translate(-18px, -18px) translateZ(0)",
                    willChange: "background-color, backdrop-filter, border-color, box-shadow",
                    pointerEvents: "none",
                  }}
                >
                  {/* Header (Icon + Label) */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      className="marker-icon-box"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        backgroundColor: "var(--marker-icon-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: `background-color 0.5s ease, transform 0.5s ${butteryEase}`,
                      }}
                    >
                      <svg
                        className="marker-svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="var(--marker-icon-color)"
                        style={{ transition: `transform 0.5s ${butteryEase}, fill 0.5s ease` }}
                      >
                        <path d="M5.5 0v5.5H0v1h5.5V12h1V6.5H12v-1H6.5V0h-1z" />
                      </svg>
                    </div>
                    <div
                      className="marker-title-wrap"
                      style={{
                        maxWidth: "0px",
                        opacity: 0,
                        overflow: "hidden",
                        willChange: "max-width, opacity",
                        transition: `max-width 0.6s ${butteryEase}, opacity 0.5s ${butteryEase}`,
                        transform: "translateZ(0)",
                      }}
                    >
                      <div
                        style={{
                          paddingLeft: "10px",
                          paddingRight: "8px",
                          color: "var(--marker-text-color)",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                          fontSize: "13px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {marker.label}
                      </div>
                    </div>
                  </div>

                  {/* Expanding Rich Media Body — only rendered when there's
                      actually image/description/button content, so a
                      label-only marker (e.g. Dharwad) doesn't pop open an
                      empty gap when snapped. */}
                  {hasBody && (
                    <div
                      className="marker-body-wrap"
                      style={{
                        maxHeight: "0px",
                        opacity: 0,
                        marginTop: "0px",
                        overflow: "hidden",
                        willChange: "max-height, opacity, margin-top",
                        transition: `max-height 0.6s ${butteryEase}, opacity 0.5s ${butteryEase}, margin-top 0.6s ${butteryEase}`,
                        transform: "translateZ(0)",
                      }}
                    >
                      <div style={{ padding: "0 4px 4px 4px", display: "flex", flexDirection: "column", gap: "8px", width: "220px" }}>
                        {marker.image && (
                          <img
                            src={marker.image}
                            alt={marker.label}
                            decoding="async"
                            style={{
                              width: "100%",
                              height: "120px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              willChange: "transform",
                              transform: "translateZ(0)",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                            }}
                          />
                        )}
                        {marker.description && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.8)",
                              whiteSpace: "normal",
                              lineHeight: "1.4",
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                            }}
                          >
                            {marker.description}
                          </div>
                        )}
                        {marker.buttonText && (
                          <a
                            className="marker-button"
                            href={marker.buttonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "block",
                              textAlign: "center",
                              textDecoration: "none",
                              padding: "8px",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "#fff",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                              transition: "background 0.2s",
                              pointerEvents: "auto",
                            }}
                            onMouseOver={(e) => ((e.target as HTMLElement).style.background = "rgba(255,255,255,0.2)")}
                            onMouseOut={(e) => ((e.target as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
                          >
                            {marker.buttonText}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="marker-pin-wrap"
                  style={{
                    ...markerStyle,
                    transform: "translate(-50%, -50%) scale(1)",
                    transition: `transform 0.4s ${butteryEase}`,
                    pointerEvents: "none",
                  }}
                >
                  <LocationIcon color={pinColor} shadowColor={pinShadowColor} />
                  <span style={{ color: "var(--marker-text-color)" }}>{marker.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}