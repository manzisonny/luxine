import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Image, MessageSquare, Music, Calendar, BookOpen, Quote, ChevronRight } from "lucide-react";

interface HomeDashboardProps {
  onNavigate: (tab: "home" | "space" | "messages" | "vibes" | "plans" | "story") => void;
  isAdmin: boolean;
}

interface Settings {
  birthdayModeActive: boolean;
  luxineMood: string;
  luxineMoodEmoji: string;
}

export default function HomeDashboard({ onNavigate, isAdmin }: HomeDashboardProps) {
  const [greeting, setGreeting] = useState("");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [settings, setSettings] = useState<Settings>({
    birthdayModeActive: false,
    luxineMood: "Glowing",
    luxineMoodEmoji: "✨"
  });
  const [affirmation, setAffirmation] = useState("");
  const [latestMedia, setLatestMedia] = useState<any>(null);
  const [latestMsg, setLatestMsg] = useState<any>(null);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Time-aware greeting logic
  useEffect(() => {
    const hours = new Date().getHours();
    let text = "Good morning";
    if (hours >= 12 && hours < 17) text = "Good afternoon";
    else if (hours >= 17 && hours < 21) text = "Good evening";
    else if (hours >= 21 || hours < 5) text = "Good night";
    setGreeting(text);

    // Formatted Date
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };
    setCurrentDateStr(new Date().toLocaleDateString("en-US", options));

    // Fetch initial parameters
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Mood settings
      const mRes = await fetch("/api/mood");
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.settings) setSettings(mData.settings);
      }

      // 2. Fetch Affirmation
      const aRes = await fetch("/api/affirmations");
      if (aRes.ok) {
        const aData = await aRes.json();
        setAffirmation(aData.affirmation);
      }

      // 3. Fetch latest Media
      const medRes = await fetch("/api/media");
      if (medRes.ok) {
        const medData = await medRes.json();
        if (medData.media && medData.media.length > 0) {
          setLatestMedia(medData.media[0]);
        }
      }

      // 4. Fetch latest top Message
      const msgRes = await fetch("/api/messages");
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (msgData.messages && msgData.messages.length > 0) {
          setLatestMsg(msgData.messages[0]);
        }
      }

      // 5. Fetch next Event
      const evRes = await fetch("/api/events");
      if (evRes.ok) {
        const evData = await evRes.json();
        const futureEvents = evData.events.filter((e: any) => !e.completed);
        if (futureEvents.length > 0) {
          setNextEvent(futureEvents[0]);
        }
      }
    } catch (err) {
      console.error("Error loaded dashboard assets dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const MOOD_OPTIONS = [
    { emoji: "✨", label: "Glowing" },
    { emoji: "🔥", label: "Radiant" },
    { emoji: "🎨", label: "Creative" },
    { emoji: "🌙", label: "Peaceful" },
    { emoji: "🌹", label: "Romantic" },
    { emoji: "⚡", label: "Fierce" },
    { emoji: " Inspired", label: "Inspired" },
    { emoji: "🎬", label: "Cinematic" },
    { emoji: "🎉", label: "Festive" },
    { emoji: "🍷", label: "Sophisticated" }
  ];

  const handleMoodSelect = async (opt: { emoji: string; label: string }) => {
    if (!isAdmin) return; // Only Luxine herself can update her mood
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: opt.emoji, label: opt.label })
      });
      if (res.ok) {
        setSettings({
          ...settings,
          luxineMood: opt.label,
          luxineMoodEmoji: opt.emoji
        });
      }
    } catch (error) {
      console.error("Error updating mood", error);
    }
  };

  const quickLaunchItems = [
    { label: "Her Space", tab: "space" as const, desc: "Moments & Media", icon: Image, color: "text-[#e8182c]" },
    { label: "Guestbook", tab: "messages" as const, desc: "Words from friends", icon: MessageSquare, color: "text-amber-600" },
    { label: "Her Stage", tab: "vibes" as const, desc: "Soundscapes & Watchlists", icon: Music, color: "text-purple-600" },
    { label: "Plans", tab: "plans" as const, desc: "Calendar Encounters", icon: Calendar, color: "text-emerald-600" },
    { label: "Story", tab: "story" as const, desc: "Timeline & Memory Grid", icon: BookOpen, color: "text-blue-500" }
  ];

  // Motion stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* 1. Dynamic Greeting Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FFE4E4]/30 dark:border-red-950/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2">
            {greeting}, Luxine
          </h1>
          <p className="font-sans text-xs tracking-wider uppercase font-medium text-[#926e6b] dark:text-[#926e6b]/80">
            {currentDateStr} · You are currently <span className="font-bold text-[#e8182c]">{settings.luxineMoodEmoji} {settings.luxineMood}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <img
            alt="Luxine's Portrait Avatar"
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border-2 border-[#e8182c]/20 ring-4 ring-[#FFF5F5] dark:ring-red-950/20 shadow-md"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM5UCC78fdOV9OY50nQYWvgp7pn5ohC8KSzHL77yVj31cJEKG1YdG2_vBFYvSYnYVGlO7LU4DV3Oj7REy7BRrXIJ1RUARiNjPSsK0qeuszSOZ5WEb80ngsK2tU-jMQ7xmCMYAYlZwohw4GPRvE-3ef1s3zvcgfFEKWo6815vFjxOamQ8pUt_worgKH3F96VmlzSFUZC9v4VONcdQ4CE5KjC3Z3HTI0_rEPdMClkyiB6GlengZXqLIDD4TD6sJGnot069S6obtaQPd4"
          />
        </div>
      </motion.div>

      {/* 2. Interactive Mood Panel */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E0D10] rounded-2xl p-6 shadow-[0px_10px_30px_rgba(232,24,44,0.03)] border border-[#FFE4E4]/30 dark:border-red-950/10">
        <h3 className="font-sans text-sm font-bold tracking-wider text-[#1c1b1b] dark:text-[#fcf9f8] mb-1">
          {isAdmin ? "Set Your Vibe For Today" : "Luxine's Mood Tracker"}
        </h3>
        <p className="font-sans text-xs text-[#926e6b] mb-4">
          {isAdmin ? "Express your energy levels with Italian flare." : "A window into her current feelings. Pure and raw."}
        </p>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((opt) => {
            const isActive = settings.luxineMood === opt.label;
            return (
              <button
                key={opt.label}
                disabled={!isAdmin}
                onClick={() => handleMoodSelect(opt)}
                className={`px-4 py-2 rounded-full font-label-mono text-xs cursor-pointer transition-all duration-300 transform active:scale-95 ${
                  isActive
                    ? "bg-[#e8182c] text-white shadow-[0px_4px_12px_rgba(232,24,44,0.3)] scale-105"
                    : "bg-[#FFF5F5] dark:bg-[#180A0C] text-[#6c5a5d] dark:text-[#d8c1c4] hover:bg-[#FFE4E4]/50 dark:hover:bg-red-950/20"
                } ${!isAdmin ? "cursor-default" : ""}`}
              >
                {opt.emoji} {opt.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 3. Daily Quotes / Rotating Affirmations */}
      {affirmation && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#FFF5F5] to-white dark:from-[#1E0D10] dark:to-[#180A0C] rounded-2xl p-8 relative overflow-hidden border-l-4 border-[#e8182c] shadow-sm">
          <Quote className="absolute right-6 top-4 w-20 h-20 text-[#e8182c]/10 pointer-events-none" />
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-[#e8182c] shrink-0 mt-1 select-none font-bold text-3xl">format_quote</span>
            <div>
              <p className="font-accent-italic text-xl text-[#1c1b1b] dark:text-[#fcf9f8] leading-relaxed italic mb-2">
                "{affirmation}"
              </p>
              <span className="font-label-mono text-[10px] text-[#926e6b]">Daily whisper for Luxine</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Quick Launch Modules Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-sans text-sm font-bold tracking-wider text-[#1c1b1b] dark:text-[#fcf9f8] uppercase mb-1">
          Aesthetic Hub Controls
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {quickLaunchItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                onClick={() => onNavigate(item.tab)}
                className="bg-white dark:bg-[#1E0D10] p-5 rounded-2xl shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5 hover:border-[#e8182c]/20 hover:shadow-md cursor-pointer transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center justify-center group gap-2"
              >
                <div className={`p-3 rounded-xl bg-[#FFF5F5] dark:bg-[#180A0C] ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8]">{item.label}</h4>
                <p className="font-sans text-[10px] text-[#926e6b] truncate w-full">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 5. Trending / Live activities Strip */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-sans text-sm font-bold tracking-wider text-[#1c1b1b] dark:text-[#fcf9f8] uppercase mb-1">
          Capsule Updates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tile 1: Latest Media */}
          <div
            onClick={() => onNavigate("space")}
            className="bg-white dark:bg-[#1E0D10] rounded-2xl p-5 border border-[#FFE4E4]/30 dark:border-red-950/10 shadow-[0px_4px_15px_rgba(232,24,44,0.02)] hover:shadow-md cursor-pointer flex items-center gap-4 group transition-shadow duration-300"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#FFF5F5] dark:bg-[#180A0C] border border-[#FFE4E4]/15">
              {latestMedia ? (
                <img src={latestMedia.url} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Image className="w-5 h-5 text-[#926e6b]" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-mono text-[9px] text-[#e8182c] font-bold">Latest Space upload</span>
              <p className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8] truncate">
                {latestMedia ? latestMedia.caption : "Explore her items"}
              </p>
              <span className="font-sans text-[11px] text-[#926e6b] flex items-center mt-1">Review items <ChevronRight className="w-3 h-3 block" /></span>
            </div>
          </div>

          {/* Tile 2: Pinned Note snippet */}
          <div
            onClick={() => onNavigate("messages")}
            className="bg-white dark:bg-[#1E0D10] rounded-2xl p-5 border border-[#FFE4E4]/30 dark:border-red-950/10 shadow-[0px_4px_15px_rgba(232,24,44,0.02)] hover:shadow-md cursor-pointer flex items-center gap-4 group transition-shadow duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-[#180A0C] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-mono text-[9px] text-amber-600 font-bold">Top Pinned Thought</span>
              <p className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8] truncate">
                {latestMsg ? `"${latestMsg.content}"` : "Read custom letters"}
              </p>
              <span className="font-sans text-[11px] text-[#926e6b] flex items-center mt-1">Visit Guestbook <ChevronRight className="w-3 h-3 block" /></span>
            </div>
          </div>

          {/* Tile 3: Upcoming event */}
          <div
            onClick={() => onNavigate("plans")}
            className="bg-white dark:bg-[#1E0D10] rounded-2xl p-5 border border-[#FFE4E4]/30 dark:border-red-950/10 shadow-[0px_4px_15px_rgba(232,24,44,0.02)] hover:shadow-md cursor-pointer flex items-center gap-4 group transition-shadow duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-[#180A0C] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-mono text-[9px] text-emerald-600 font-bold">Upcoming Encounter</span>
              <p className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8] truncate">
                {nextEvent ? nextEvent.title : "Plans for the month"}
              </p>
              <span className="font-sans text-[11px] text-[#926e6b] flex items-center mt-1">Open calendar <ChevronRight className="w-3 h-3 block" /></span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
