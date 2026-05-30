import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Image, MessageSquare, Phone, Calendar, BookOpen, Quote, ChevronRight, Star, X } from "lucide-react";

interface HomeDashboardProps {
  onNavigate: (tab: "home" | "space" | "messages" | "plans" | "story" | "contact") => void;
  isAdmin: boolean;
  theme?: "light" | "dark";
}

interface Settings {
  birthdayModeActive: boolean;
  luxineMood: string;
  luxineMoodEmoji: string;
}

export default function HomeDashboard({ onNavigate, isAdmin, theme = "dark" }: HomeDashboardProps) {
  const [greeting, setGreeting] = useState("");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [settings, setSettings] = useState<Settings>({
    birthdayModeActive: false,
    luxineMood: "Glowing",
    luxineMoodEmoji: "✨"
  });
  const [profilePic, setProfilePic] = useState<string>("");
  const [latestMedia, setLatestMedia] = useState<any>(null);
  const [latestMsg, setLatestMsg] = useState<any>(null);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoomAvatar, setZoomAvatar] = useState(false);

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

  const fetchData = () => {
    try {
      // 1. Mood from localStorage
      const storedMood = localStorage.getItem("luxine_mood_v1");
      if (storedMood) { const m = JSON.parse(storedMood); setSettings(m); }

      // 2. Profile picture from localStorage (preserved, never modified/removed by model)
      const storedPic = localStorage.getItem("luxine_profile_picture_v1");
      if (storedPic) setProfilePic(storedPic);

      // 3. Latest media from localStorage
      const storedMedia = localStorage.getItem("luxine_media_v1");
      if (storedMedia) {
        const mediaArr = JSON.parse(storedMedia);
        if (mediaArr.length > 0) setLatestMedia(mediaArr[0]);
      }

      // 4. Latest message
      const storedMsgs = localStorage.getItem("luxine_messages_v1");
      if (storedMsgs) {
        const msgs = JSON.parse(storedMsgs);
        if (msgs.length > 0) setLatestMsg(msgs[0]);
      }

      // 5. Next event
      const storedEvs = localStorage.getItem("luxine_events_v1");
      if (storedEvs) {
        const evs = JSON.parse(storedEvs).filter((e: any) => !e.completed);
        if (evs.length > 0) setNextEvent(evs[0]);
      }
    } catch (err) {
      console.error("Dashboard load error", err);
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

  const handleMoodSelect = (opt: { emoji: string; label: string }) => {
    const newSettings = { ...settings, luxineMood: opt.label, luxineMoodEmoji: opt.emoji };
    setSettings(newSettings);
    localStorage.setItem("luxine_mood_v1", JSON.stringify(newSettings));
  };

  const quickLaunchItems = [
    { label: "Her Space", tab: "space" as const, desc: "Moments & Media", icon: Image, color: "text-[#e8182c]" },
    { label: "Guestbook", tab: "messages" as const, desc: "Words from friends", icon: MessageSquare, color: "text-amber-600" },
    { label: "Plans", tab: "plans" as const, desc: "Calendar Encounters", icon: Calendar, color: "text-emerald-600" },
    { label: "Story", tab: "story" as const, desc: "Timeline & Memory Grid", icon: BookOpen, color: "text-blue-500" },
    { label: "Contact", tab: "contact" as const, desc: "Connect with Ella", icon: Phone, color: "text-purple-600" }
  ];

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

  // Safe fallback source for latest media graphic thumbnail
  const fallbackMediaUrl = profilePic || "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=300&auto=format&fit=crop&q=80";

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
            {greeting} ✦ Welcome to Ella's World
          </h1>
          <p className="font-sans text-xs tracking-wider uppercase font-medium text-[#926e6b] dark:text-[#926e6b]/80">
            {currentDateStr} · Ella is feeling <span className="font-bold text-[#e8182c]">{settings.luxineMoodEmoji} {settings.luxineMood}</span>
          </p>
        </div>
        
        {/* Profile avatar - click to zoom (no change camera overlays or files upload) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setZoomAvatar(true)}
            className="relative block rounded-full focus:outline-none cursor-pointer"
            title="Click to view full photo"
          >
            {profilePic ? (
              <img
                alt="Ella's Portrait"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#e8182c]/40 ring-4 ring-[#FFF5F5] dark:ring-red-950/20 shadow-md hover:scale-105 transition-transform"
                src={profilePic}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#bd001d] to-[#e8182c] text-white font-serif font-bold text-2xl flex items-center justify-center border-2 border-white ring-4 ring-[#FFF5F5] dark:ring-red-950/20 shadow-md hover:scale-105 transition-transform">
                E
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* 2. Interactive Mood Panel */}
      <motion.div variants={itemVariants} className={`rounded-2xl p-6 shadow-[0px_10px_30px_rgba(232,24,44,0.03)] border ${theme === 'dark' ? 'bg-[#1E0D10] border-red-950/10' : 'bg-white border-[#FFE4E4]/30'}`}>
        <h3 className="font-sans text-sm font-bold tracking-wider text-[#1c1b1b] dark:text-[#fcf9f8] mb-1">
          {isAdmin ? "Set Your Vibe For Today" : "Ella's Mood Tracker"}
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

      {/* 3. Heavenly Birthday Blessing / Growth in Christ - EXTREMELY high-contrast in Light Mode */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E0D10] rounded-2xl p-6 md:p-8 relative overflow-hidden border-2 border-[#bd001d] dark:border-red-950/50 shadow-md">
        <Sparkles className="absolute right-6 top-4 w-20 h-20 text-[#e8182c]/10 pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-full text-[#bd001d] dark:text-[#ffb3ae] shrink-0">
            <Star className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div className="space-y-2 w-full">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#bd001d] dark:text-[#ffb3ae]">
              Heavenly Birthday Blessing
            </h4>
            <p className="font-serif text-lg md:text-xl text-black dark:text-white leading-relaxed italic font-bold">
              "But grow in the grace and knowledge of our Lord and Savior Jesus Christ. To Him be glory both now and forever! Amen."
            </p>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-[#FFE4E4]/40 dark:border-red-950/20">
              <span className="font-label-mono text-[10px] font-bold text-[#bd001d] dark:text-[#ffb3ae] bg-[#FFF5F5] dark:bg-red-950/40 px-2.5 py-1 rounded-md shrink-0 w-fit">
                2 Peter 3:18 · Growth in Christ
              </span>
              <p className="font-sans text-xs text-gray-900 dark:text-[#d8c1c4] italic leading-relaxed">
                May your birthday be filled with spiritual growth, deep blessings, and radiant joy! ✦
              </p>
            </div>
          </div>
        </div>
      </motion.div>

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
              <img
                src={latestMedia ? latestMedia.url : fallbackMediaUrl}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Latest Space visual"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-mono text-[9px] text-[#e8182c] font-bold">Latest Space upload</span>
              <p className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8] truncate">
                {latestMedia ? latestMedia.caption : "Memories Sandbox"}
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

      {/* Zoom Avatar Lightbox Modal */}
      <AnimatePresence>
        {zoomAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setZoomAvatar(false)}
              className="absolute top-6 right-6 z-[130] text-white hover:text-[#e8182c] bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative max-w-full max-h-[80vh] flex flex-col items-center">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-white/10 shadow-2xl" 
                  alt="Ella's Portrait" 
                />
              ) : (
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#bd001d] to-[#e8182c] text-white font-serif font-bold text-7xl flex items-center justify-center border-4 border-white shadow-2xl">
                  E
                </div>
              )}
              <h2 className="font-serif italic text-2xl text-white mt-4 tracking-wide text-center">
                Iriza Ella Luxine ✦
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
