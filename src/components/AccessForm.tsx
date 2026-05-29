import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";

interface AccessFormProps {
  onGrantAccess: (isAdmin: boolean) => void;
}

export default function AccessForm({ onGrantAccess }: AccessFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Persist locally
        localStorage.setItem("luxine_granted", "true");
        localStorage.setItem("luxine_admin", data.isAdmin ? "true" : "false");
        localStorage.setItem("luxine_visitor_id", data.visitorId);
        
        // Let the splash or flash show first
        setTimeout(() => {
          onGrantAccess(data.isAdmin);
        }, 1200);
      } else {
        triggerError();
      }
    } catch (err) {
      triggerError();
    } finally {
      setLoading(false);
    }
  };

  const triggerError = () => {
    setError(true);
    setCode("");
    // Clear error class after animation completes
    setTimeout(() => {
      setError(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-md px-4 mt-8">
      <motion.div
        className={`w-full bg-[#FFF5F5] dark:bg-[#1E0D10] rounded-[24px] p-8 md:p-12 shadow-[0px_10px_30px_rgba(232,24,44,0.1)] flex flex-col items-center text-center border border-[#FFE4E4]/30 dark:border-red-950/30 ${
          error ? "shake-animation" : ""
        }`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Shimmer title header */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-[#bd001d] to-[#e8182c] dark:from-[#ffb3ae] dark:to-[#ff4d60] mb-3 flex items-center justify-center gap-1">
          <Sparkles className="w-5 h-5 text-[#bd001d] animate-pulse shrink-0" />
          LUXINE'S WORLD
          <Sparkles className="w-5 h-5 text-[#bd001d] animate-pulse shrink-0" />
        </h1>

        <p className="font-sans text-sm text-[#6c5a5d]/90 dark:text-[#d8c1c4]/90 tracking-wide mb-8">
          You've been invited into Luxine's World
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <input
            type="password"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading || success}
            placeholder="· · · · · · · ·"
            className="w-3/4 text-center font-mono text-xl tracking-[0.5em] text-[#1c1b1b] dark:text-[#fcf9f8] bg-transparent border-0 border-b border-[#e7bcb9] dark:border-red-950/40 py-2 mb-8 focus:ring-0 focus:border-b-2 focus:border-[#e8182c] outline-none transition-all placeholder:text-[#926e6b]/40 placeholder:text-sm"
          />

          <button
            type="submit"
            disabled={loading || success || !code}
            className="luxine-glow-button w-full py-4 px-6 rounded-full flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[#ffffff] font-sans font-bold text-sm tracking-wider"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : success ? (
              <span className="font-sans uppercase">Welcome In ✦</span>
            ) : (
              <>
                <span>Enter Her World</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Decorative caption footer */}
      <motion.p
        className="mt-6 text-center font-accent-italic text-lg text-[#926e6b] dark:text-[#926e6b]/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        This world belongs to Luxine. Handle with care.
      </motion.p>
    </div>
  );
}
