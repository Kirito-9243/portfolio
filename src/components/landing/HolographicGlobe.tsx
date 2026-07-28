"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { latLongToVector3 } from "@/lib/sphereCoords";
import { hash } from "@/lib/hash";

const RADIUS = 1.9; // shrunk from 2.6 so it clears the title/button around it
const HOLO_COLOR = new THREE.Color("#5ec8f0");
const HOLO_COLOR_BRIGHT = new THREE.Color("#e0f2fe");

/** Latitude/longitude grid lines, built from the same lat/long -> 3D math
 * already used for the old sphere-as-map. */
function buildGraticule(radius: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: HOLO_COLOR, transparent: true, opacity: 0.4 });
  const segments = 64;

  for (let lat = -72; lat <= 72; lat += 18) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const lon = (i / segments) * 360 - 180;
      points.push(latLongToVector3(lat, lon, radius));
    }
    group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  for (let lon = -180; lon < 180; lon += 18) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const lat = (i / segments) * 180 - 90;
      points.push(latLongToVector3(lat, lon, radius));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  return group;
}

// Standard Fresnel rim-light: bright at grazing angles (the silhouette),
// dim head-on -- the classic "glowing edge" hologram look, additive-blended
// onto a slightly larger sphere sitting just outside the wireframe.
const fresnelVertex = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fresnelFragment = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform vec3 uColor;
  uniform float uIntensity;
  void main() {
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.5);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

/**
 * Particles that actually orbit the globe (each on its own tilted circular
 * path, at its own radius/speed/phase) rather than drifting randomly like
 * Sparkles -- this is what gives the "revolving dust" look from the
 * reference image. One Points object, positions recomputed per frame.
 */
function OrbitingParticles({ radius, count = 90 }: { radius: number; count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const seed = i + 1;
        return {
          orbitRadius: radius * (1.15 + hash(seed) * 0.55),
          orbitSpeed: 0.12 + hash(seed * 3.3) * 0.22,
          phase: hash(seed * 5.7) * Math.PI * 2,
          tilt: (hash(seed * 7.1) - 0.5) * 1.4,
        };
      }),
    [radius, count]
  );

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    const attr = pointsRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      const angle = p.phase + t * p.orbitSpeed;
      const x = Math.cos(angle) * p.orbitRadius;
      const z = Math.sin(angle) * p.orbitRadius * Math.cos(p.tilt);
      const y = Math.sin(angle) * p.orbitRadius * Math.sin(p.tilt);
      attr.setXYZ(i, x, y, z);
    });
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={HOLO_COLOR_BRIGHT}
        size={0.05}
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function HolographicGlobe() {
  const spinRef = useRef<THREE.Group>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const graticule = useMemo(() => buildGraticule(RADIUS), []);

  useFrame((state, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.15;
    if (shaderRef.current) {
      // gentle "breathing" glow rather than a flat constant intensity
      shaderRef.current.uniforms.uIntensity.value = 1.1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
    }
  });

  return (
    <group ref={spinRef}>
      {/* faint inner fill, just enough to suggest volume rather than a hollow wire cage */}
      <mesh>
        <sphereGeometry args={[RADIUS, 32, 32]} />
        <meshBasicMaterial color={HOLO_COLOR} transparent opacity={0.05} />
      </mesh>

      <primitive object={graticule} />

      <mesh scale={1.04}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={fresnelVertex}
          fragmentShader={fresnelFragment}
          uniforms={{ uColor: { value: HOLO_COLOR }, uIntensity: { value: 1.1 } }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* outer dust field -- denser than before, scattered star points */}
      <Sparkles count={320} scale={RADIUS * 3.4} size={1.3} speed={0.15} color={HOLO_COLOR} opacity={0.55} />

      {/* dense, bright core field */}
      <Sparkles count={140} scale={RADIUS * 1.4} size={2.0} speed={0.25} color={HOLO_COLOR_BRIGHT} opacity={0.8} />

      {/* actual orbital motion -- the piece Sparkles alone can't give */}
      <OrbitingParticles radius={RADIUS} count={100} />
    </group>
  );
}