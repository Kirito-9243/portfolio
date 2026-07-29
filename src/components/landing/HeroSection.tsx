import { motion } from "framer-motion";

/**
 * HERO SECTION — placeholder.
 *
 * Structural stand-in only. Reuses the title/subtitle that used to sit
 * directly over the old landing globe, just to give the first viewport
 * real content and a "scroll to continue" cue instead of an empty screen.
 * This is explicitly provisional — swap the contents once the real hero
 * concept is decided; nothing below this component depends on it.
 */
export default function HeroSection() {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-abyss px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <h1 className="font-display text-4xl text-grand-line drop-shadow-[0_0_14px_rgba(212,169,79,0.4)] sm:text-6xl">
          Welcome to My Portfolio
        </h1>
        <p className="mt-3 font-sans text-xs uppercase tracking-[0.35em] text-parchment/60 sm:text-sm">
          Kirito &middot; Final-Year CS
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { duration: 1, delay: 1 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-parchment/50"
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}