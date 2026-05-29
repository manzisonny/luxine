import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun, Lock, Unlock, Compass, Image, MessageSquare, Music, Calendar, BookOpen, Clock, Cake } from "lucide-react";

// Sub-components Imports
import AccessForm from "./components/AccessForm";
import BirthdayEntrance from "./components/BirthdayEntrance";
import HomeDashboard from "./components/HomeDashboard";
import SpaceGallery from "./components/SpaceGallery";
import MessagesGuestbook from "./components/MessagesGuestbook";
import PlansCalendar from "./components/PlansCalendar";
import VibesHub from "./components/VibesHub";
import StoryInsights from "./components/StoryInsights";

export default function App() {
  const [granted, setGranted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"home" | "space" | "messages" | "vibes" | "plans" | "story">("home");

  // Birthday features state
  const [countdownStr, setCountdownStr] = useState("");
  const [birthdayCelebrated, setBirthdayCelebrated] = useState(false);
  const [birthdaySplashSeen, setBirthdaySplashSeen] = useState(false);
  const [flashOnAccess, setFlashOnAccess] = useState(false);

  useEffect(() => {
    // 1. Theme initializing
    const localTheme = localStorage.getItem("luxine_theme") as "light" | "dark";
    const chosenTheme = localTheme || "dark";
    setTheme(chosenTheme);
    if (chosenTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 2. Auth Session Initializing
    const hasGranted = localStorage.getItem("luxine_granted") === "true";
    const adminState = localStorage.getItem("luxine_admin") === "true";
    const vId = localStorage.getItem("luxine_visitor_id") || "v_" + Math.random().toString(36).substring(2, 10);
    
    setGranted(hasGranted);
    setIsAdmin(adminState);
    setVisitorId(vId);

    // 3. One-Shot Birthday splash Seen Session parameter
    const splashSeen = sessionStorage.getItem("bday_splash_completed") === "true";
    setBirthdaySplashSeen(splashSeen);

    // 4. Real-time Countdown timer intervals checking birthdays
    const birthdayTarget = new Date("2026-05-30T00:00:00").getTime();
    
    const interval = setInterval(() => {
      const difference = birthdayTarget - Date.now();
      
      if (difference <= 0) {
        setBirthdayCelebrated(true);
        setCountdownStr("Birthday Mode Active ✨");
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdownStr(`${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGrantAccess = (adminAccess: boolean) => {
    setFlashOnAccess(true);
    setTimeout(() => {
      setGranted(true);
      setIsAdmin(adminAccess);
      setFlashOnAccess(false);
    }, 500);
  };

  const handleSignOut = () => {
    localStorage.removeItem("luxine_granted");
    localStorage.removeItem("luxine_admin");
    setGranted(false);
    setIsAdmin(false);
    setActiveTab("home");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("luxine_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleCloseBirthdaySplash = () => {
    sessionStorage.setItem("bday_splash_completed", "true");
    setBirthdaySplashSeen(true);
  };

  const tabsConfig = [
    { key: "home" as const, label: "Home", icon: Compass },
    { key: "space" as const, label: "Her Space", icon: Image },
    { key: "messages" as const, label: "Guestbook", icon: MessageSquare },
    { key: "vibes" as const, label: "Her Stage", icon: Music },
    { key: "plans" as const, label: "Plans", icon: Calendar },
    { key: "story" as const, label: "Story", icon: BookOpen }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f8] dark:bg-[#0f0406] text-[#1c1b1b] dark:text-[#fcf9f8]">
      {/* 1. White flash entrance screen effect */}
      <AnimatePresence>
        {flashOnAccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-black z-[9999] pointer-events-none"
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* 2. Birthday entrance cover splash on May 30th */}
      <AnimatePresence>
        {birthdayCelebrated && !birthdaySplashSeen && (
          <BirthdayEntrance onComplete={handleCloseBirthdaySplash} />
        )}
      </AnimatePresence>

      {/* 3. Outer structure controller */}
      {!granted ? (
        // Gate Access lock Form View
        <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden">
          {/* Subtle slow rotating background accent blur lights */}
          <div className="absolute w-[400px] h-[400px] bg-[#e8182c]/5 dark:bg-[#e8182c]/10 rounded-full blur-[100px] top-[-100px] left-[-100px] animate-pulse pointer-events-none" />
          <div className="absolute w-[400px] h-[400px] bg-[#bd001d]/5 dark:bg-[#bd001d]/10 rounded-full blur-[100px] bottom-[-100px] right-[-100px] animate-pulse pointer-events-none" />

          {/* Theme Switcher pin float */}
          <div className="absolute top-6 right-6">
            <button
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-[#1E0D10] text-[#6c5a5d] border border-[#FFE4E4]/30 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Toggle Contrast"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          <AccessForm onGrantAccess={handleGrantAccess} />
        </div>
      ) : (
        // Authorized Interactive universe views
        <div className="flex-1 flex flex-col">
          {/* Ticking Countdown banners */}
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

          {/* Core Applet header bar */}
          <header className="bg-white/80 dark:bg-[#0f0507]/80 backdrop-blur-md border-b border-[#FFE4E4]/10 dark:border-red-950/15 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("home")}>
              <span className="font-serif italic font-bold text-xl md:text-2xl text-[#bd001d] dark:text-[#ffb3ae] tracking-[0.1em] uppercase">
                LUXINE
              </span>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-3">
              {/* Access State tags badge */}
              <div className="hidden sm:flex items-center gap-1.5 bg-[#FFF5F5] dark:bg-[#1E0D10] border border-[#FFE4E4]/15 px-3 py-1.5 rounded-full">
                {isAdmin ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-label-mono text-[9px] text-[#bd001d] font-bold">Admin Sandbox Active</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#926e6b]" />
                    <span className="font-label-mono text-[9px] text-[#926e6b]">Friendly Visitor Space</span>
                  </>
                )}
              </div>

              {/* Theme toggler buttons */}
              <button
                onClick={toggleTheme}
                className="p-2 bg-white dark:bg-[#1E0D10] text-[#6c5a5d] hover:bg-[#FFF5F5] border border-[#FFE4E4]/25 rounded-full cursor-pointer transition-colors"
                title="Toggle Contrast"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Exit trigger logout */}
              <button
                onClick={handleSignOut}
                className="p-2 bg-[#FFF5F5] dark:bg-[#1E0D10] hover:bg-neutral-100 text-[#bd001d] border border-[#FFE4E4]/25 rounded-full cursor-pointer transition-colors"
                title="Exit World"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Modular tab display layout structure */}
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
                  <HomeDashboard onNavigate={(tab) => setActiveTab(tab)} isAdmin={isAdmin} />
                )}
                {activeTab === "space" && (
                  <SpaceGallery isAdmin={isAdmin} visitorId={visitorId} />
                )}
                {activeTab === "messages" && (
                  <MessagesGuestbook isAdmin={isAdmin} visitorId={visitorId} />
                )}
                {activeTab === "vibes" && <VibesHub />}
                {activeTab === "plans" && <PlansCalendar isAdmin={isAdmin} />}
                {activeTab === "story" && <StoryInsights />}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Navigation floating rail bars */}
          <nav className="fixed bottom-0 md:bottom-6 left-0 w-full z-45 px-4 md:px-12 pointer-events-none pb-4">
            <div className="max-w-2xl mx-auto pointer-events-auto bg-[#fcf9f8]/95 dark:bg-[#0f0507]/95 backdrop-blur-md rounded-full p-2 shadow-[0px_10px_40px_rgba(232,24,44,0.08)] border border-[#FFE4E4]/10 dark:border-red-950/15 flex justify-between">
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
                        : "text-[#6c5a5d] dark:text-[#d8c1c4] hover:bg-[#FFE4E4]/30"
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
      )}
    </div>
  );
}
