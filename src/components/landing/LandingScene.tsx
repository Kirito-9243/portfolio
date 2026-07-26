"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import HolographicGlobe from "./HolographicGlobe";

export default function LandingScene() {
  return (
    <Canvas camera={{ position: [0, 0.5, 7], fov: 45 }} dpr={[1, 2]} className="!absolute inset-0">
      <color attach="background" args={["#060f13"]} />
      <fog attach="fog" args={["#060f13", 8, 18]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 4]} intensity={0.6} color="#d4a94f" />
      <Suspense fallback={null}>
        <HolographicGlobe />
      </Suspense>
    </Canvas>
  );
}