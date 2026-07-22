"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";

/**
 * Placeholder "island" — a stand-in for the real Grand Line map (Phase 2).
 * Low-poly + toon-shaded on purpose: this is the visual language every
 * future island/sea in the real map will speak.
 */
function Island() {
  const groupRef = useRef<THREE.Group>(null);
  const rockRef = useRef<THREE.Mesh>(null);

  // One-time cinematic reveal — this is GSAP's job (orchestrated transitions),
  // as opposed to the continuous ambient spin below, which is native R3F's job.
  useEffect(() => {
    if (!groupRef.current) return;
    gsap.fromTo(
      groupRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, 0.6)" }
    );
  }, []);

  // Ambient continuous rotation — per-frame, native to R3F
  useFrame((_, delta) => {
    if (rockRef.current) {
      rockRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={rockRef} position={[0, 0.45, 0]}>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshToonMaterial color="#fbbf24" />
      </mesh>

      {/* the sea — standing in for the ocean plane the real map will sit on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#05070f" metalness={0.3} roughness={0.5} />
      </mesh>
      <gridHelper args={[8, 24, "#00d4ff", "#0d1220"]} position={[0, -0.59, 0]} />
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [3, 2.2, 4], fov: 45 }} className="!absolute inset-0">
      <color attach="background" args={["#05070f"]} />
      <fog attach="fog" args={["#05070f", 6, 14]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      <pointLight position={[-3, 1, -2]} intensity={8} color="#00d4ff" />
      <pointLight position={[2, 1, -3]} intensity={6} color="#a855f7" />

      <Suspense fallback={null}>
        <Island />
        {/* Faint drift, foreshadowing the real Calm Belt / LLM layer built in Phase 3 */}
        <Sparkles count={80} scale={7} size={1.5} speed={0.25} color="#00d4ff" opacity={0.5} />
      </Suspense>
    </Canvas>
  );
}
