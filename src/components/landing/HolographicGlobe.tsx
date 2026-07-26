"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { latLongToVector3 } from "@/lib/sphereCoords";

const RADIUS = 2.6;
const HOLO_COLOR = new THREE.Color("#5ec8f0");
const HOLO_COLOR_BRIGHT = new THREE.Color("#e0f2fe");

/** Latitude/longitude grid lines, built from the same lat/long -> 3D math
 * already used for the old sphere-as-map. Denser than the first pass
 * (18deg steps instead of 30deg) per feedback that it needed more lines. */
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

      {/* outer dust field -- sparse, wide, matches the scattered star points
          in the reference image */}
      <Sparkles count={220} scale={RADIUS * 3.2} size={1.3} speed={0.15} color={HOLO_COLOR} opacity={0.55} />

      {/* dense, bright core field -- the reference image's glowing center */}
      <Sparkles count={90} scale={RADIUS * 1.4} size={2.2} speed={0.25} color={HOLO_COLOR_BRIGHT} opacity={0.8} />
    </group>
  );
}