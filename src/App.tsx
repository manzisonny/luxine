import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun, Unlock, Compass, Image, MessageSquare, Music, Calendar, BookOpen, Clock, Cake, Phone } from "lucide-react";

// Sub-components Imports
import BirthdayEntrance from "./components/BirthdayEntrance";
import HomeDashboard from "./components/HomeDashboard";
import SpaceGallery from "./components/SpaceGallery";
import MessagesGuestbook from "./components/MessagesGuestbook";
import PlansCalendar from "./components/PlansCalendar";
import ContactDetails from "./components/ContactDetails";
import StoryInsights from "./components/StoryInsights";

export default function App() {
  const [visitorId, setVisitorId] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Navigation
  const [activeTab, setActiveTab] = useState<"home" | "space" | "messages" | "plans" | "story" | "contact">("home");

  // Birthday features state
  const [countdownStr, setCountdownStr] = useState("");
  const [birthdayCelebrated, setBirthdayCelebrated] = useState(false);
  const [birthdaySplashSeen, setBirthdaySplashSeen] = useState(false);
  const [showEntrance, setShowEntrance] = useState(false);

  useEffect(() => {
    // 1. Theme initializing
    const localTheme = localStorage.getItem("luxine_theme") as "light" | "dark";
    const chosenTheme = localTheme || "dark";
    applyTheme(chosenTheme);
    setTheme(chosenTheme);

    // 2. Visitor ID
    const vId = localStorage.getItem("luxine_visitor_id") || "v_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("luxine_visitor_id", vId);
    setVisitorId(vId);

    // 3. Birthday splash check
    const splashSeen = sessionStorage.getItem("bday_splash_completed") === "true";
    setBirthdaySplashSeen(splashSeen);

    // 4. Real-time Countdown timer
    const birthdayTarget = new Date("2026-05-30T00:00:00").getTime();

    const interval = setInterval(() => {
      const difference = birthdayTarget - Date.now();
      if (difference <= 0) {
        setBirthdayCelebrated(true);
        setCountdownStr("Birthday Mode Active ✨");
        if (!splashSeen) {
          setShowEntrance(true);
        }
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdownStr(`${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const applyTheme = (t: "light" | "dark") => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("luxine_theme", nextTheme);
    applyTheme(nextTheme);
  };

  const handleCloseBirthdaySplash = () => {
    sessionStorage.setItem("bday_splash_completed", "true");
    setBirthdaySplashSeen(true);
    setShowEntrance(false);
  };

  const tabsConfig = [
    { key: "home" as const, label: "Home", icon: Compass },
    { key: "space" as const, label: "Her Space", icon: Image },
    { key: "messages" as const, label: "Guestbook", icon: MessageSquare },
    { key: "plans" as const, label: "Plans", icon: Calendar },
    { key: "story" as const, label: "Story", icon: BookOpen },
    { key: "contact" as const, label: "Contact", icon: Phone }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between ${theme === "dark" ? "bg-[#0f0406] text-[#fcf9f8]" : "bg-[#fcf9f8] text-[#1c1b1b]"}`}>
      {/* Birthday entrance cover splash on May 30th */}
      <AnimatePresence>
        {showEntrance && !birthdaySplashSeen && (
          <BirthdayEntrance onComplete={handleCloseBirthdaySplash} />
        )}
      </AnimatePresence>

      {/* Main App */}
      <div className="flex-1 flex flex-col">
        {/* Ticking Countdown banner */}
        <div className="bg-[#bd001d] dark:bg-[#930014] text-white py-2.5 px-4 text-center text-xs tracking-[0.1em] font-label-mono font-bold flex items-center justify-center gap-2 relative z-50">
          {birthdayCelebrated ? (
            <>
              <Cake className="w-4 h-4 animate-bounce" />
              <span>Happy Golden Birthday, Luxine! Exploring Her Celebration Sandbox</span>
              <Cake className="w-4 h-4 animate-bounce" />
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Midnight Release Countdown : {countdownStr} ✦ May 30th Sandbox Entrance Open</span>
            </>
          )}
        </div>

        {/* Header */}
        <header className={`backdrop-blur-md border-b py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-40 ${theme === "dark" ? "bg-[#0f0507]/80 border-red-950/15" : "bg-white/80 border-[#FFE4E4]/20"}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("home")}>
            <span className={`font-serif italic font-bold text-xl md:text-2xl tracking-[0.1em] uppercase ${theme === "dark" ? "text-[#ffb3ae]" : "text-[#bd001d]"}`}>
              LUXINE
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Open World badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${theme === "dark" ? "bg-[#1E0D10] border-[#FFE4E4]/15" : "bg-[#FFF5F5] border-[#FFE4E4]/40"}`}>
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-label-mono text-[9px] text-emerald-600 font-bold">Open World · Welcome!</span>
            </div>

            {/* Theme toggler */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full cursor-pointer transition-all border hover:scale-110 ${theme === "dark" ? "bg-[#1E0D10] text-[#ffb3ae] border-[#FFE4E4]/15 hover:bg-[#261115]" : "bg-white text-[#6c5a5d] border-[#FFE4E4]/40 hover:bg-[#FFF5F5]"}`}
              title="Toggle Light / Dark"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Modular tab display */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-12 pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {activeTab === "home" && (
                <HomeDashboard onNavigate={(tab) => setActiveTab(tab)} isAdmin={true} theme={theme} />
              )}
              {activeTab === "space" && (
                <SpaceGallery isAdmin={true} visitorId={visitorId} theme={theme} />
              )}
              {activeTab === "messages" && (
                <MessagesGuestbook isAdmin={true} visitorId={visitorId} />
              )}
              {activeTab === "plans" && <PlansCalendar isAdmin={true} />}
              {activeTab === "story" && <StoryInsights />}
              {activeTab === "contact" && <ContactDetails theme={theme} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Navigation floating rail */}
        <nav className="fixed bottom-0 md:bottom-6 left-0 w-full z-45 px-4 md:px-12 pointer-events-none pb-4">
          <div className={`max-w-2xl mx-auto pointer-events-auto backdrop-blur-md rounded-full p-2 shadow-[0px_10px_40px_rgba(232,24,44,0.08)] border flex justify-between ${theme === "dark" ? "bg-[#0f0507]/95 border-red-950/15" : "bg-[#fcf9f8]/95 border-[#FFE4E4]/20"}`}>
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-full cursor-pointer transition-all ${
                    active
                      ? "bg-[#e8182c] text-white shadow-[0px_4px_12px_rgba(232,24,44,0.2)] font-bold scale-105"
                      : theme === "dark"
                      ? "text-[#d8c1c4] hover:bg-[#FFE4E4]/10"
                      : "text-[#6c5a5d] hover:bg-[#FFE4E4]/40"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-sans text-[9px] mt-1 lg:block hidden">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
