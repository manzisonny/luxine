import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, Plus, Check, Laugh, Flame, ShieldAlert, Heart, Calendar } from "lucide-react";

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

const SEED_STORIES: FunnyStory[] = [
  {
    id: "fs1",
    author: "Sonny",
    content: "The time Ella spent 45 minutes finding the absolute perfect selfie lighting in a grocery store vegetable aisle while the ice cream melted in the cart. Standard diva behavior! 😂",
    category: "diva",
    laughsCount: 42,
    omgsCount: 12,
    snapsCount: 28,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "fs2",
    author: "Marcella",
    content: "Ella texted us 'I'm 5 minutes away, girls!' when she hadn't even got in the shower yet. We waited for 2 hours at the restaurant. But she arrived looking so breathtakingly gorgeous we couldn't even be mad! 💅🔥",
    category: "roast",
    laughsCount: 56,
    omgsCount: 8,
    snapsCount: 61,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

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
    setStories(loadStories());
  }, []);

  // Generate 7 rows x 52 columns pseudo activity commits for the GitHub-style Memory Density Grid
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
    if (count === 0) return "bg-[#FFF5F5] dark:bg-[#180A0C]/40 border-[#FFE4E4]/10";
    if (count === 1) return "bg-[#bd001d]/20 border-[#bd001d]/10";
    if (count === 2) return "bg-[#bd001d]/40 border-[#bd001d]/20";
    if (count === 3) return "bg-[#bd001d]/60 border-[#bd001d]/30";
    return "bg-[#bd001d] border-[#bd001d]/40 animate-pulse";
  };

  const triggerFloatingEmoji = (emoji: string) => {
    const id = Date.now() + Math.random();
    const newEmoji = {
      id,
      char: emoji,
      x: Math.random() * 80 + 10, // percentage
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

    const newStory: FunnyStory = {
      id: "story_" + Date.now(),
      author: authorName.trim() || "Anonymous Joker",
      content: storyContent.trim(),
      category,
      laughsCount: 1,
      omgsCount: 0,
      snapsCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newStory, ...stories];
    setStories(updated);
    saveStories(updated);

    setStoryContent("");
    setAuthorName("");
    setCategory("roast");
    setActiveTab("feed");
    
    // Trigger floating laughs
    triggerFloatingEmoji("😂");
    triggerFloatingEmoji("✨");

    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 2500);
  };

  const handleReact = (id: string, type: "laugh" | "omg" | "snap") => {
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
  };

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case "roast": return { label: "🔥 Roast", bg: "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200" };
      case "gossip": return { label: "🤫 Inside Gossip", bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200" };
      case "secret": return { label: "🔑 Hidden Secret", bg: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-200" };
      case "diva": return { label: "💅 Diva Moment", bg: "bg-pink-50 dark:bg-pink-950/20 text-pink-600 border-pink-200" };
      default: return { label: "❤️ Sweet Memory", bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200" };
    }
  };

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto relative overflow-hidden">
      
      {/* Floating Emojis Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[99] overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((emoji) => (
            <motion.div
              key={emoji.id}
              initial={{ opacity: 1, y: "100vh", x: `${emoji.x}vw`, scale: 0.8 }}
              animate={{ opacity: [1, 1, 0], y: "-10vh", scale: [1, 1.5, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute text-4xl select-none"
            >
              {emoji.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <section className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2">
            Ella's Comedy Sandbox 🎭
          </h1>
          <p className="font-accent-italic text-lg text-[#6c5a5d] dark:text-[#d8c1c4] italic">
            A lively playground of laughs, dramatic roasts, funny gestures, and memories!
          </p>
        </div>

        <div className="flex gap-2 shrink-0 justify-center">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-4 py-2 rounded-full font-label-mono text-xs font-bold transition-all cursor-pointer ${activeTab === "feed" ? "bg-[#e8182c] text-white" : "bg-white dark:bg-[#1E0D10] text-[#926e6b] border border-[#FFE4E4]/30"}`}
          >
            Read Roasts 😂
          </button>
          <button
            onClick={() => setActiveTab("write")}
            className={`px-4 py-2 rounded-full font-label-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${activeTab === "write" ? "bg-[#e8182c] text-white animate-pulse" : "bg-white dark:bg-[#1E0D10] text-[#926e6b] border border-[#FFE4E4]/30"}`}
          >
            <Plus className="w-3.5 h-3.5" /> Spil Tea 🤫
          </button>
        </div>
      </section>

      {/* 1. Memory Checkpoint Grid */}
      <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[28px] shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5">
        <div className="border-b border-[#FFE4E4]/10 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="font-label-mono text-[9px] text-[#e8182c] font-bold uppercase">Footprint Analysis</span>
            <h3 className="font-serif text-base font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic mt-0.5">
              Ella's Live Checkpoint Grid
            </h3>
          </div>
          <span className="font-label-mono text-[9px] text-[#926e6b] font-bold">
            Total active days recorded: <span className="text-[#e8182c] font-black">{totalCommits} days</span>
          </span>
        </div>

        <div className="w-full overflow-x-auto hide-scrollbar pb-3 relative">
          <div className="min-w-[700px] flex flex-col gap-1.5 p-1">
            {activityGrid.map((row, rowIdx) => (
              <div key={`row_${rowIdx}`} className="flex gap-1.5 justify-between">
                {row.map((count, colIdx) => (
                  <div
                    key={`col_${colIdx}`}
                    onMouseEnter={() => setHoveredGridTile({ day: rowIdx, week: colIdx, count })}
                    onMouseLeave={() => setHoveredGridTile(null)}
                    className={`h-4 flex-1 aspect-square rounded-[3px] border cursor-pointer transition-all duration-300 transform hover:scale-125 hover:rotate-12 ${getOpacityClass(count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <AnimatePresence>
            {hoveredGridTile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-[-35px] left-1/2 -translate-x-1/2 bg-[#bd001d] text-white px-3 py-1.5 rounded-lg text-[9px] font-label-mono font-bold uppercase tracking-wider shadow-md pointer-events-none"
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

      {/* Tab Contents */}
      {activeTab === "write" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E0D10] p-6 md:p-8 rounded-[28px] border border-[#FFE4E4]/40 dark:border-red-950/20 shadow-md"
        >
          <h3 className="font-serif text-xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-4 flex items-center gap-2">
            🎭 Spill the Beans or Roast Ella
          </h3>

          <form onSubmit={handleAddStory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] mb-1.5">
                  Your Signature Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Gossip Queen"
                  className="w-full bg-[#fcf9f8] dark:bg-[#150709] border border-[#d88c88] px-4 py-3 rounded-xl font-sans text-sm text-black dark:text-[#fcf9f8] placeholder:text-[#926e6b]/40 outline-none focus:border-[#bd001d] focus:ring-1 focus:ring-[#bd001d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] mb-1.5">
                  Story Vibe Tag
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-[#fcf9f8] dark:bg-[#150709] border border-[#d88c88] px-4 py-3 rounded-xl font-sans text-sm text-black dark:text-[#fcf9f8] outline-none focus:border-[#bd001d]"
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
              <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] mb-1.5">
                The Story / Gesture Details
              </label>
              <textarea
                required
                rows={4}
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Write down the funny gesture, meme, or story about Ella..."
                className="w-full bg-[#fcf9f8] dark:bg-[#150709] border border-[#d88c88] px-4 py-3 rounded-xl font-sans text-sm text-black dark:text-[#fcf9f8] placeholder:text-[#926e6b]/40 outline-none focus:border-[#bd001d] resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!storyContent.trim()}
                className="bg-gradient-to-r from-[#bd001d] to-[#e8182c] hover:from-[#d60a22] hover:to-[#ff283d] text-white px-6 py-3 rounded-xl font-sans text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:scale-100"
              >
                Post Story 😂
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Reaction soundboard trigger buttons */}
          <div className="bg-[#FFF5F5] dark:bg-[#180A0C] border border-[#FFE4E4]/30 dark:border-red-950/20 p-4 rounded-[20px] flex flex-wrap items-center justify-center gap-3">
            <span className="font-label-mono text-[10px] text-[#926e6b] font-bold uppercase mr-2">Click to spawn reactions:</span>
            {[
              { char: "😂", label: "Diva Laugh" },
              { char: "💅", label: "Snap Snap" },
              { char: "😱", label: "OMG!" },
              { char: "🔥", label: "Spicy Vibe" },
              { char: "🎉", label: "Hooray" }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => triggerFloatingEmoji(btn.char)}
                className="bg-white dark:bg-[#1E0D10] border border-[#FFE4E4]/50 dark:border-red-950/20 px-3.5 py-1.5 rounded-full text-xs font-bold hover:scale-110 active:scale-90 transition-transform cursor-pointer shadow-sm text-black dark:text-white"
              >
                {btn.char} {btn.label}
              </button>
            ))}
          </div>

          {/* Stories List */}
          <div className="grid grid-cols-1 gap-6">
            {stories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E0D10] rounded-[24px] border border-[#FFE4E4]/20 dark:border-red-950/5">
                <p className="font-accent-italic text-[#926e6b] italic text-lg mb-1">No comedy stories spilled yet...</p>
                <button onClick={() => setActiveTab("write")} className="text-[#bd001d] font-bold text-xs underline mt-2">Be the first to spill! 🔥</button>
              </div>
            ) : (
              stories.map((story) => {
                const meta = getCategoryMeta(story.category);
                return (
                  <motion.div
                    key={story.id}
                    layoutId={`story_${story.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#1E0D10] rounded-[24px] p-6 border border-[#FFE4E4]/20 dark:border-red-950/5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#bd001d]/10 to-[#e8182c]/10 text-[#bd001d] font-bold font-sans text-xs flex items-center justify-center uppercase">
                          {story.author[0]}
                        </div>
                        <div>
                          <h4 className="font-sans text-sm font-bold text-black dark:text-white">{story.author}</h4>
                          <span className="font-label-mono text-[9px] text-[#926e6b]">{new Date(story.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-label-mono text-[9px] font-bold border ${meta.bg}`}>
                        {meta.label}
                      </span>
                    </div>

                    <p className="font-sans text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                      "{story.content}"
                    </p>

                    {/* Interactive roasts reactions panel */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-red-950/20">
                      <button
                        onClick={() => handleReact(story.id, "laugh")}
                        className="bg-gray-50 dark:bg-red-950/20 border border-gray-150 hover:bg-red-50 dark:border-red-950/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-label-mono text-xs font-bold text-[#e8182c] hover:scale-105 transition-all"
                      >
                        <Laugh className="w-4 h-4" />
                        <span>Laughs ({story.laughsCount})</span>
                      </button>

                      <button
                        onClick={() => handleReact(story.id, "snap")}
                        className="bg-gray-50 dark:bg-red-950/20 border border-gray-150 hover:bg-pink-50 dark:border-red-950/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-label-mono text-xs font-bold text-pink-500 hover:scale-105 transition-all"
                      >
                        <span>💅 Diva Snaps ({story.snapsCount})</span>
                      </button>

                      <button
                        onClick={() => handleReact(story.id, "omg")}
                        className="bg-gray-50 dark:bg-red-950/20 border border-gray-150 hover:bg-amber-50 dark:border-red-950/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-label-mono text-xs font-bold text-amber-600 hover:scale-105 transition-all"
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

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-[#bd001d] text-white px-5 py-3 rounded-full flex items-center gap-2 z-[99] shadow-lg font-sans text-xs font-bold uppercase tracking-wider"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>Story posted to comedy sandbox! ✦</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
