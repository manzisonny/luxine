import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";

interface BirthdayEntranceProps {
  onComplete: () => void;
}

export default function BirthdayEntrance({ onComplete }: BirthdayEntranceProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: number; duration: number; size: number; isPetal: boolean; color: string }>>([]);

  useEffect(() => {
    // Generate celebratory confetti and rose petal fall parameters
    const generated = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 3,
      size: Math.random() * 0.6 + 0.5,
      isPetal: i % 2 === 0,
      color: Math.random() > 0.5 ? "#e8182c" : "#ffb3ae"
    }));
    setParticles(generated);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* Falling particle simulator */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.left,
              top: "-20px",
              width: p.isPetal ? `${15 * p.size}px` : `${10 * p.size}px`,
              height: p.isPetal ? `${15 * p.size}px` : `${20 * p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.isPetal ? "50% 0 50% 50%" : "2px",
              opacity: p.isPetal ? 0.8 : 0.6,
              transform: `scale(${p.size})`,
              animation: `fallAndDrift ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fallAndDrift {
          0% {
            top: -20px;
            transform: translateY(0) rotate(0deg) translateX(0);
            opacity: 1;
          }
          100% {
            top: 105vh;
            transform: translateY(105vh) rotate(360deg) translateX(50px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Main text cards */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-xl mx-auto space-y-6">
        <motion.p
          className="font-sans text-xs text-[#926e6b] tracking-[0.2em] uppercase font-semibold"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Today the world celebrates
        </motion.p>

        <motion.h1
          className="font-serif text-6xl md:text-8xl font-bold italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#bd001d] to-[#ffb3ae] dark:from-[#ffb3ae] dark:to-[#ff4d60] leading-tight filter drop-shadow-[0_10px_15px_rgba(232,24,44,0.15)] shimmer-text"
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          LUXINE
        </motion.h1>

        <motion.h2
          className="font-accent-italic text-2xl md:text-3xl text-[#6c5a5d] dark:text-[#d8c1c4] italic"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          Happy Birthday, Iriza Ella Luxine
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="pt-6"
        >
          <button
            onClick={onComplete}
            className="luxine-glow-button px-8 py-4 rounded-full flex items-center gap-2 group cursor-pointer text-[#ffffff] font-sans font-bold text-base hover:scale-105 transition-transform"
          >
            Explore
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </main>
    </motion.div>
  );
}
