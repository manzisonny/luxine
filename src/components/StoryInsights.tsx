import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus, Check, Laugh, Flame, Star, BookOpen, Quote, Shield } from "lucide-react";

interface FunnyStory {
  id: string;
  author: string;
  content: string;
  category: "roast" | "gossip" | "secret" | "sweet" | "diva";
  laughsCount: number;
  omgsCount: number;
  snapsCount: number;
  createdAt: string;
}

const STORIES_KEY = "luxine_funny_stories_v1";

const SEED_STORIES: FunnyStory[] = [];

function loadStories(): FunnyStory[] {
  try {
    const stored = localStorage.getItem(STORIES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORIES_KEY, JSON.stringify(SEED_STORIES));
  return SEED_STORIES;
}

function saveStories(stories: FunnyStory[]) {
  try { localStorage.setItem(STORIES_KEY, JSON.stringify(stories)); } catch {}
}

export default function StoryInsights() {
  const [stories, setStories] = useState<FunnyStory[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [category, setCategory] = useState<"roast" | "gossip" | "secret" | "sweet" | "diva">("roast");
  
  const [hoveredGridTile, setHoveredGridTile] = useState<{ day: number; week: number; count: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "write">("feed");
  const [successToast, setSuccessToast] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; char: string; x: number; y: number }>>([]);

  useEffect(() => {
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.stories)) {
          // Merge local stories so they aren't lost
          const local = loadStories();
          const merged = [...data.stories];
          local.forEach((loc) => {
            if (!merged.some((s) => s.id === loc.id)) {
              merged.push(loc);
            }
          });
          setStories(merged);
        } else {
          setStories(loadStories());
        }
      })
      .catch(() => {
        setStories(loadStories());
      });
  }, []);

  const generateGridData = () => {
    const grid: number[][] = [];
    for (let row = 0; row < 7; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < 52; col++) {
        let count = 0;
        const seedValue = (row * 3 + col * 7) % 19;
        if (seedValue === 0) count = 3 + (col % 3);
        else if (seedValue < 5) count = 1;
        else if (seedValue < 9) count = 2;
        rowData.push(count);
      }
      grid.push(rowData);
    }
    return grid;
  };

  const activityGrid = generateGridData();
  const totalCommits = activityGrid.flat().reduce((sum, val) => sum + val, 0);

  const getOpacityClass = (count: number) => {
    if (count === 0) return "bg-red-50/50 dark:bg-[#180A0C]/30 border-red-100 dark:border-red-950/20";
    if (count === 1) return "bg-[#bd001d]/15 border-[#bd001d]/10";
    if (count === 2) return "bg-[#bd001d]/30 border-[#bd001d]/20";
    if (count === 3) return "bg-[#bd001d]/50 border-[#bd001d]/30";
    return "bg-[#bd001d] border-[#bd001d]/45 animate-pulse";
  };

  const triggerFloatingEmoji = (emoji: string) => {
    const id = Date.now() + Math.random();
    const newEmoji = {
      id,
      char: emoji,
      x: Math.random() * 80 + 10,
      y: 90
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2000);
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyContent.trim()) return;

    const payload = {
      author: authorName.trim() || "Anonymous Friend",
      content: storyContent.trim(),
      category
    };

    fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((savedStory) => {
        const updated = [savedStory, ...stories];
        setStories(updated);
        saveStories(updated);
      })
      .catch(() => {
        // Fallback
        const newStory: FunnyStory = {
          id: "story_" + Date.now(),
          author: payload.author,
          content: payload.content,
          category: payload.category,
          laughsCount: 1,
          omgsCount: 0,
          snapsCount: 0,
          createdAt: new Date().toISOString()
        };
        const updated = [newStory, ...stories];
        setStories(updated);
        saveStories(updated);
      })
      .finally(() => {
        setStoryContent("");
        setAuthorName("");
        setCategory("roast");
        setActiveTab("feed");
        
        triggerFloatingEmoji("😂");
        triggerFloatingEmoji("✨");

        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 2500);
      });
  };

  const handleReact = (id: string, type: "laugh" | "omg" | "snap") => {
    // Optimistic update
    const updated = stories.map((s) => {
      if (s.id !== id) return s;
      if (type === "laugh") {
        triggerFloatingEmoji("😂");
        return { ...s, laughsCount: s.laughsCount + 1 };
      }
      if (type === "omg") {
        triggerFloatingEmoji("😱");
        return { ...s, omgsCount: s.omgsCount + 1 };
      }
      triggerFloatingEmoji("💅");
      return { ...s, snapsCount: s.snapsCount + 1 };
    });
    setStories(updated);
    saveStories(updated);

    // Call API in background
    fetch(`/api/stories/${id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type })
    }).catch(() => {});
  };

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case "roast": return { label: "🔥 Friendly Roast", bg: "bg-red-500 text-white border-red-600" };
      case "gossip": return { label: "🤫 Inside Gossip", bg: "bg-amber-600 text-white border-amber-700" };
      case "secret": return { label: "🔑 Secret", bg: "bg-purple-600 text-white border-purple-700" };
      case "diva": return { label: "💅 Diva Vibe", bg: "bg-pink-500 text-white border-pink-600" };
      default: return { label: "❤️ Sweet Memory", bg: "bg-emerald-600 text-white border-emerald-700" };
    }
  };

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto relative">
      
      {/* Floating Emojis Screen Overflow Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((emoji) => (
            <motion.div
              key={emoji.id}
              initial={{ opacity: 1, y: "100vh", x: `${emoji.x}vw`, scale: 0.8 }}
              animate={{ opacity: [1, 1, 0], y: "-10vh", scale: [1, 1.6, 1.2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute text-5xl select-none"
            >
              {emoji.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header with Title and Tab Switchers */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#bd001d]/15 pb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2 leading-tight">
            Ella's Chronicle & Comedy Board 🎭
          </h1>
          <p className="font-accent-italic text-lg text-gray-900 dark:text-[#d8c1c4] italic">
            An interactive space for funny moments, sassy roasts, secrets, and memories!
          </p>
        </div>

        <div className="flex gap-3 shrink-0 justify-center">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm ${activeTab === "feed" ? "bg-[#bd001d] text-white" : "bg-white dark:bg-[#1E0D10] text-[#bd001d] dark:text-[#ffb3ae] border-2 border-[#bd001d]/20"}`}
          >
            Read Stories 😂
          </button>
          <button
            onClick={() => setActiveTab("write")}
            className={`px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-sm ${activeTab === "write" ? "bg-[#bd001d] text-white" : "bg-white dark:bg-[#1E0D10] text-[#bd001d] dark:text-[#ffb3ae] border-2 border-[#bd001d]/20"}`}
          >
            <Plus className="w-4 h-4" /> Spill Vibe 🤫
          </button>
        </div>
      </section>

      {/* Memory Checkpoint Grid */}
      <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[24px] border-2 border-[#bd001d] dark:border-red-950/20 shadow-md">
        <div className="border-b border-[#FFE4E4]/40 dark:border-red-950/20 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="font-label-mono text-[9px] text-[#bd001d] dark:text-[#ffb3ae] font-bold uppercase">Memory Checkpoints Map</span>
            <h3 className="font-serif text-lg font-bold text-black dark:text-white italic mt-0.5">
              Ella's Live Checkpoint Map
            </h3>
          </div>
          <span className="font-label-mono text-[10px] text-gray-900 dark:text-[#ffb3ae] font-bold bg-[#FFF5F5] dark:bg-red-950/30 px-3 py-1 rounded-md">
            Total recorded active blocks: <span className="text-[#bd001d] dark:text-[#ffb3ae] font-black">{totalCommits} days</span>
          </span>
        </div>

        <div className="w-full overflow-x-auto hide-scrollbar pb-2 relative">
          <div className="min-w-[720px] flex flex-col gap-2 p-1">
            {activityGrid.map((row, rowIdx) => (
              <div key={`row_${rowIdx}`} className="flex gap-2 justify-between">
                {row.map((count, colIdx) => (
                  <div
                    key={`col_${colIdx}`}
                    onMouseEnter={() => setHoveredGridTile({ day: rowIdx, week: colIdx, count })}
                    onMouseLeave={() => setHoveredGridTile(null)}
                    className={`h-4.5 flex-1 aspect-square rounded-[4px] border cursor-pointer transition-all duration-300 transform hover:scale-125 hover:rotate-12 ${getOpacityClass(count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <AnimatePresence>
            {hoveredGridTile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute top-[-35px] left-1/2 -translate-x-1/2 bg-[#bd001d] text-white px-3 py-1.5 rounded-lg text-[9px] font-label-mono font-bold uppercase tracking-wider shadow-md pointer-events-none z-10"
              >
                {hoveredGridTile.count === 0
                  ? "Quiet reflection day · 0 checkpoints"
                  : hoveredGridTile.count === 1
                  ? "1 memory captured"
                  : `Checked in ${hoveredGridTile.count} times`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Tab Switcher Body */}
      {activeTab === "write" ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E0D10] p-6 md:p-8 rounded-[24px] border-2 border-[#bd001d] dark:border-red-950/20 shadow-md"
        >
          <h3 className="font-serif text-xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-6 flex items-center gap-2">
            🎭 Spoil a Secret or Roast Ella
          </h3>

          <form onSubmit={handleAddStory} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Your Signature Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Gossip Queen"
                  className="w-full px-4 py-3 rounded-xl font-sans text-sm focus:ring-1 focus:ring-[#bd001d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Story Vibe Tag
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl font-sans text-sm"
                >
                  <option value="roast">🔥 Friendly Roast</option>
                  <option value="diva">💅 Diva Moment</option>
                  <option value="gossip">🤫 Inside Gossip</option>
                  <option value="secret">🔑 Birthday Secret</option>
                  <option value="sweet">❤️ Sweet Memory</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-black dark:text-white mb-1.5">
                The Story / Gesture Details
              </label>
              <textarea
                required
                rows={4}
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Share the hilarious gesture, inside joke, or gossip story..."
                className="w-full px-4 py-3 rounded-xl font-sans text-sm resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!storyContent.trim()}
                className="bg-gradient-to-r from-[#bd001d] to-[#e8182c] hover:from-[#d60a22] hover:to-[#ff283d] text-white px-6 py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:scale-100"
              >
                Post Story 😂
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Reaction soundboard trigger buttons */}
          <div className="bg-white dark:bg-[#1E0D10] border-2 border-[#bd001d] dark:border-red-950/20 p-5 rounded-[24px] flex flex-wrap items-center justify-center gap-3 shadow-md">
            <span className="font-label-mono text-[10px] text-[#bd001d] dark:text-[#ffb3ae] font-bold uppercase mr-2 shrink-0">Click to spawn screen vibes:</span>
            {[
              { char: "😂", label: "Diva Laugh" },
              { char: "💅", label: "Snap Snaps" },
              { char: "😱", label: "OMG!" },
              { char: "🔥", label: "Spicy" },
              { char: "🎉", label: "Hooray" }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => triggerFloatingEmoji(btn.char)}
                className="bg-[#FFF5F5] dark:bg-red-950/20 border border-[#bd001d]/20 px-4 py-2 rounded-full text-xs font-bold hover:scale-110 active:scale-90 transition-transform cursor-pointer shadow-sm text-black dark:text-white"
              >
                {btn.char} {btn.label}
              </button>
            ))}
          </div>

          {/* Stories List */}
          <div className="grid grid-cols-1 gap-6">
            {stories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E0D10] rounded-[24px] border-2 border-[#bd001d] dark:border-red-950/10 shadow-md">
                <p className="font-accent-italic text-gray-900 dark:text-[#d8c1c4] italic text-lg mb-1">No comedy stories spilled yet...</p>
                <button onClick={() => setActiveTab("write")} className="text-[#bd001d] font-bold text-xs underline mt-2">Be the first to spill! 🔥</button>
              </div>
            ) : (
              stories.map((story) => {
                const meta = getCategoryMeta(story.category);
                return (
                  <motion.div
                    key={story.id}
                    layoutId={`story_${story.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#1E0D10] rounded-[24px] p-6 md:p-8 border-2 border-[#bd001d] dark:border-red-950/20 shadow-md space-y-5"
                  >
                    {/* Header line */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#bd001d]/10 dark:border-red-950/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#bd001d] to-[#e8182c] text-white font-bold font-sans text-sm flex items-center justify-center uppercase shadow-md">
                          {story.author[0]}
                        </div>
                        <div>
                          <h4 className="font-sans text-sm font-black text-black dark:text-white">{story.author}</h4>
                          <span className="font-label-mono text-[9px] text-gray-900 dark:text-[#d8c1c4]">{new Date(story.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full font-label-mono text-[9px] font-bold border shadow-sm ${meta.bg}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Story content - Extremely highly readable black/white */}
                    <p className="font-sans text-base md:text-lg text-black dark:text-[#fcf9f8] leading-relaxed font-bold italic">
                      "{story.content}"
                    </p>

                    {/* Reactions details panel */}
                    <div className="flex flex-wrap items-center gap-3 pt-3">
                      <button
                        onClick={() => handleReact(story.id, "laugh")}
                        className="bg-[#FFF5F5] dark:bg-red-950/20 border border-[#bd001d]/30 hover:bg-red-100 dark:hover:bg-red-950/40 px-4 py-2 rounded-full flex items-center gap-2 font-sans text-xs font-bold text-[#bd001d] dark:text-[#ffb3ae] hover:scale-105 transition-all cursor-pointer shadow-sm"
                      >
                        <Laugh className="w-4 h-4" />
                        <span>Laughs ({story.laughsCount})</span>
                      </button>

                      <button
                        onClick={() => handleReact(story.id, "snap")}
                        className="bg-pink-50 dark:bg-pink-950/20 border border-pink-200 hover:bg-pink-100 dark:hover:bg-pink-950/40 px-4 py-2 rounded-full flex items-center gap-2 font-sans text-xs font-bold text-pink-600 hover:scale-105 transition-all cursor-pointer shadow-sm"
                      >
                        <span>💅 Diva Snaps ({story.snapsCount})</span>
                      </button>

                      <button
                        onClick={() => handleReact(story.id, "omg")}
                        className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/40 px-4 py-2 rounded-full flex items-center gap-2 font-sans text-xs font-bold text-amber-700 hover:scale-105 transition-all cursor-pointer shadow-sm"
                      >
                        <span>😱 OMG! ({story.omgsCount})</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-[#bd001d] text-white px-6 py-3.5 rounded-full flex items-center gap-2 z-[130] shadow-lg font-sans text-xs font-bold uppercase tracking-wider"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>Story posted to comedy sandbox! ✦</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
