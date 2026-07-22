"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Three.js needs a real DOM/WebGL context, so this loads client-side only
const Scene = dynamic(() => import("@/components/shared/Scene"), { ssr: false });

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-abyss">
      <Scene />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-16 text-center"
      >
        <h1 className="font-display text-4xl text-grand-line drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] sm:text-6xl">
          The Grand Line
        </h1>
        <p className="mt-3 font-sans text-sm uppercase tracking-[0.3em] text-east-blue">
          Phase 1 — the world is forming
        </p>
      </motion.div>
    </main>
  );
}
