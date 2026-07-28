"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MOVE_SPEED = 3.2;
const CAMERA_OFFSET = new THREE.Vector3(0, 3.2, 5.5);

function Character() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Soldier.glb");
  const { actions } = useAnimations(animations, group);

  const keys = useRef<Record<string, boolean>>({});
  const currentAction = useRef<string>("Idle");
  const facing = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    actions["Idle"]?.reset().play();
  }, [actions]);

  useFrame((state, delta) => {
    if (!group.current) return;

    let dx = 0;
    let dz = 0;
    if (keys.current["ArrowUp"]) dz -= 1;
    if (keys.current["ArrowDown"]) dz += 1;
    if (keys.current["ArrowLeft"]) dx -= 1;
    if (keys.current["ArrowRight"]) dx += 1;

    const moving = dx !== 0 || dz !== 0;

    if (moving) {
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;
      group.current.position.x += dx * MOVE_SPEED * delta;
      group.current.position.z += dz * MOVE_SPEED * delta;

      const targetFacing = Math.atan2(dx, dz);
      let diff = targetFacing - facing.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest-path angle diff
      facing.current += diff * Math.min(delta * 10, 1);
      group.current.rotation.y = facing.current;
    }

    const wantAction = moving ? "Walk" : "Idle";
    if (wantAction !== currentAction.current) {
      actions[wantAction]?.reset().fadeIn(0.25).play();
      actions[currentAction.current]?.fadeOut(0.25);
      currentAction.current = wantAction;
    }

    // Third-person camera: fixed world-space offset behind/above the
    // character, smoothed rather than snapped so turns don't feel jarring.
    const desiredCamPos = group.current.position.clone().add(CAMERA_OFFSET);
    state.camera.position.lerp(desiredCamPos, Math.min(delta * 4, 1));
    const lookTarget = group.current.position.clone().add(new THREE.Vector3(0, 1, 0));
    state.camera.lookAt(lookTarget);
  });

  return <primitive ref={group} object={scene} scale={1.6} />;
}

function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#16303a" />
    </mesh>
  );
}

/** Placeholder for the Aincrad tower — just enough to test approaching a
 * landmark and having the camera/character read sensibly next to it. */
function Tower() {
  return (
    <mesh position={[6, 4, -6]}>
      <boxGeometry args={[3, 8, 3]} />
      <meshStandardMaterial color="#d4a94f" />
    </mesh>
  );
}

export default function CharacterTest() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-abyss">
      <Canvas camera={{ position: [0, 3.2, 5.5], fov: 50 }} className="!absolute inset-0">
        <color attach="background" args={["#060f13"]} />
        <fog attach="fog" args={["#060f13", 15, 45]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 10, 4]} intensity={1.2} />
        <Ground />
        <Tower />
        <Suspense fallback={null}>
          <Character />
        </Suspense>
      </Canvas>
      <p className="pointer-events-none absolute inset-x-0 top-8 text-center font-sans text-xs uppercase tracking-[0.3em] text-parchment/70">
        arrow keys to move — rough proof of concept
      </p>
    </main>
  );
}

useGLTF.preload("/models/Soldier.glb");
