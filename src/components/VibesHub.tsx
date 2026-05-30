import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, SkipForward, SkipBack, Music, Film, Star, Plus, Check, Trash2, X } from "lucide-react";

interface WatchListItem {
  id: string;
  title: string;
  platform: string;
  type: "movie" | "show" | "documentary";
  status: "want_to_watch" | "watching" | "watched";
  rating: number; // 1 to 5
  notes?: string;
}

const SOUNDSCAPES = [
  { id: 1, title: "Midnight Milan Symphony", artist: "Hôtel Costes Curations", duration: "3:42" },
  { id: 2, title: "Luminous Shimmer Drops", artist: "Studio 54 Ambient Collection", duration: "4:05" },
  { id: 3, title: "Crimson Silk Reflections", artist: "Luxine Acoustic Sessions", duration: "2:58" },
  { id: 4, title: "Shadows of Venice", artist: "Venezia Nocturne Quartet", duration: "5:12" }
];

const WATCHLIST_KEY = "luxine_watchlist_v1";

const SEED_WATCHLIST: WatchListItem[] = [
  { id: "w1", title: "The Crown", platform: "Netflix", type: "show", status: "watched", rating: 5, notes: "Season 5" },
  { id: "w2", title: "Succession", platform: "HBO Max", type: "show", status: "watching", rating: 4, notes: "Finale Prep" },
  { id: "w3", title: "Dune: Part Two", platform: "Theater", type: "movie", status: "want_to_watch", rating: 5, notes: "Cinema Release" }
];

function loadWatchlist(): WatchListItem[] {
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(SEED_WATCHLIST));
  return SEED_WATCHLIST;
}

function saveWatchlist(list: WatchListItem[]) {
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list)); } catch {}
}

export default function VibesHub() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);

  // Watchlist states
  const [watchlist, setWatchlist] = useState<WatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWatch, setShowAddWatch] = useState(false);

  // Watch form states
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newType, setNewType] = useState<"movie" | "show" | "documentary">("movie");
  const [newStatus, setNewStatus] = useState<"want_to_watch" | "watching" | "watched">("want_to_watch");
  const [newRating, setNewRating] = useState(5);
  const [newNotes, setNewNotes] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Playback simulated state timer intervals when isPlaying is toggled
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => (prev >= 220 ? 0 : prev + 1));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const fetchWatchlist = () => {
    const loaded = loadWatchlist();
    setWatchlist(loaded);
    setLoading(false);
  };

  const currentTrack = SOUNDSCAPES[currentTrackIdx];

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setPlaybackSeconds(0);
    setCurrentTrackIdx((prev) => (prev === SOUNDSCAPES.length - 1 ? 0 : prev + 1));
  };

  const handlePrevTrack = () => {
    setPlaybackSeconds(0);
    setCurrentTrackIdx((prev) => (prev === 0 ? SOUNDSCAPES.length - 1 : prev - 1));
  };

  const handleAddWatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPlatform.trim()) return;
    setSavingProgress(true);
    setTimeout(() => {
      const newItem: WatchListItem = {
        id: "w_" + Date.now(),
        title: newTitle.trim(),
        platform: newPlatform.trim(),
        type: newType,
        status: newStatus,
        rating: newRating,
        notes: newNotes.trim()
      };
      const updated = [...watchlist, newItem];
      setWatchlist(updated);
      saveWatchlist(updated);
      setShowAddWatch(false);
      setNewTitle(""); setNewPlatform(""); setNewNotes(""); setNewRating(5);
      setSavingProgress(false);
    }, 400);
  };

  const handleStatusUpdate = (id: string, newStat: "want_to_watch" | "watching" | "watched") => {
    const updated = watchlist.map((item) => item.id === id ? { ...item, status: newStat } : item);
    setWatchlist(updated);
    saveWatchlist(updated);
  };

  const handleRatingUpdate = (id: string, rating: number) => {
    const updated = watchlist.map((item) => item.id === id ? { ...item, rating } : item);
    setWatchlist(updated);
    saveWatchlist(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = watchlist.filter((item) => item.id !== id);
    setWatchlist(updated);
    saveWatchlist(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Vibes Header Section */}
      <div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2 font-headline-serif">
          Her Stage
        </h1>
        <p className="font-accent-italic text-lg text-[#6c5a5d] dark:text-[#d8c1c4] italic mb-1">
          A collection of high fidelity soundscapes and streaming recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand: Custom Premium Vinyl Music Player (Span 7) */}
        <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[28px] shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5 lg:col-span-7 flex flex-col justify-between">
          <div className="border-b border-[#FFE4E4]/10 pb-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-[#e8182c] shrink-0" />
              <h3 className="font-serif text-lg font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic">
                Midnight Soundstage Player
              </h3>
            </div>
            <span className="font-label-mono text-[9px] text-[#e8182c] font-bold border border-[#e8182c]/20 px-2.5 py-1 rounded-full uppercase">
              Curated Audios
            </span>
          </div>

          <div className="flex flex-col items-center py-6 text-center">
            {/* Spin Vinyl circle disc frame */}
            <div className={`relative w-48 h-48 rounded-full bg-[#1c1b1b] flex items-center justify-center border-4 border-[#e8182c]/20 shadow-xl overflow-hidden mb-6 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "10s", animationTimingFunction: "linear" }}>
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black pointer-events-none" />
              {/* Radial sound line markers */}
              <div className="absolute w-[80%] h-[80%] rounded-full border border-white/5" />
              <div className="absolute w-[60%] h-[60%] rounded-full border border-white/5" />
              <div className="absolute w-[40%] h-[40%] rounded-full border border-white/10" />

              {/* Red Label center core disc */}
              <div className="w-14 h-14 rounded-full bg-[#bd001d] border-4 border-[#1c1b1b] flex items-center justify-center relative z-10 shadow-lg">
                <span className="w-3.5 h-3.5 bg-[#fcf9f8] rounded-full" />
              </div>
            </div>

            {/* Title details */}
            <h4 className="font-serif text-2xl font-bold italic text-[#1c1b1b] dark:text-[#fcf9f8]">
              {currentTrack.title}
            </h4>
            <p className="font-accent-italic text-sm text-[#926e6b] italic mt-1 font-medium">
              By {currentTrack.artist}
            </p>

            {/* Time progress indicators bar */}
            <div className="w-full max-w-sm mt-6 flex items-center gap-3">
              <span className="font-label-mono text-[10px] text-[#926e6b]">{formatTime(playbackSeconds)}</span>
              <div className="flex-1 h-1.5 bg-[#FFF5F5] dark:bg-[#180A0C] border border-[#FFE4E4]/10 rounded-full overflow-hidden relative">
                <div
                  className="absolute left-0 top-0 h-full bg-[#e8182c] transition-all"
                  style={{ width: `${(playbackSeconds / 220) * 100}%` }}
                />
              </div>
              <span className="font-label-mono text-[10px] text-[#926e6b]">{currentTrack.duration}</span>
            </div>

            {/* Playback dynamic control key keys */}
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={handlePrevTrack}
                className="p-3 text-[#6c5a5d] hover:text-[#e8182c] border border-[#FFE4E4]/30 rounded-full hover:bg-[#FFF5F5] dark:hover:bg-[#180A0C] cursor-pointer transition-colors"
                title="Previous track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={handlePlayPause}
                style={{ width: "64px", height: "64px" }}
                className="rounded-full bg-gradient-to-b from-[#e8182c] to-[#b01221] text-white flex items-center justify-center shadow-[0px_6px_20px_rgba(232,24,44,0.35)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title={isPlaying ? "Pause track" : "Play track"}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
              </button>
              <button
                onClick={handleNextTrack}
                className="p-3 text-[#6c5a5d] hover:text-[#e8182c] border border-[#FFE4E4]/30 rounded-full hover:bg-[#FFF5F5] dark:hover:bg-[#180A0C] cursor-pointer transition-colors"
                title="Next track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Hand: Interactive customized Watchlist Recommendations (Span 5) */}
        <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[28px] shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5 lg:col-span-5 flex flex-col justify-between min-h-[450px]">
          <div className="border-b border-[#FFE4E4]/10 pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-[#e8182c] shrink-0" />
              <h3 className="font-serif text-lg font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic">
                Cinema Recommendations
              </h3>
            </div>
            <button
              onClick={() => setShowAddWatch(true)}
              className="p-1 text-[#e8182c] hover:bg-[#FFF5F5] dark:hover:bg-red-950/20 rounded-full border border-[#FFE4E4]/40 hover:scale-105 cursor-pointer transition-all"
              title="Add to Watchlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-[#e8182c] border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Film className="w-8 h-8 text-[#926e6b]/40 mb-3" />
              <p className="font-accent-italic text-sm text-[#926e6b] italic">Recommend list is empty. Recommend a film now!</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
              {watchlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#fcf9f8] dark:bg-[#180a0c] p-4 rounded-2xl border border-[#FFE4E4]/10 dark:border-red-950/5 flex flex-col gap-2 group relative hover:shadow-xs transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8]">
                        {item.title}
                      </h4>
                      <p className="font-sans text-[11px] text-[#926e6b]">
                        On {item.platform} · <span className="capitalize">{item.type}</span>
                      </p>
                    </div>

                    {/* Trash & Status toggle row */}
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusUpdate(item.id, e.target.value as any)}
                        className="bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/35 px-2.5 py-1 text-[10px] rounded-lg font-sans outline-none font-semibold text-[#bd001d] cursor-pointer"
                      >
                        <option value="want_to_watch">Later</option>
                        <option value="watching">Watching</option>
                        <option value="watched">History</option>
                      </select>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-[#926e6b] hover:text-[#bd001d] hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="font-accent-italic text-xs text-[#6c5a5d]/90 dark:text-[#d8c1c4]/90 italic px-1">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Rating Selector keys */}
                  <div className="flex justify-between items-center border-t border-[#FFE4E4]/10 pt-2 mt-1">
                    <span className="font-label-mono text-[9px] text-[#926e6b]">Rank rating</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const score = idx + 1;
                        const active = item.rating >= score;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleRatingUpdate(item.id, score)}
                            className="p-0.5 cursor-pointer hover:scale-110"
                          >
                            <Star className={`w-3.5 h-3.5 ${active ? "fill-yellow-400 text-yellow-400 font-bold" : "text-[#926e6b]/20"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Watchlist recommend drawer modals */}
      <AnimatePresence>
        {showAddWatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 shadow-xl backdrop-blur-sm z-[110] flex items-end justify-center"
            onClick={() => setShowAddWatch(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fcf9f8] dark:bg-[#0f0406] w-full max-w-xl rounded-t-[32px] p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold italic text-[#1c1b1b] dark:text-[#fcf9f8]">
                  Log Cinema Recommendation
                </h3>
                <button
                  onClick={() => setShowAddWatch(false)}
                  className="text-[#926e6b] hover:text-[#e8182c] p-1 rounded-full hover:bg-[#FFE4E4]/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddWatchSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-label-mono text-[10px] text-[#926e6b]">Film Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Succession Finale / The Crown S5..."
                    className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Platform Link / Outlet</label>
                    <input
                      type="text"
                      required
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value)}
                      placeholder="e.g. Netflix, HBO Max, Theater"
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Format Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    >
                      <option value="movie">Movie Film</option>
                      <option value="show">TV Show / Serie</option>
                      <option value="documentary">Documentary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Starting Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    >
                      <option value="want_to_watch">Want to Watch (Later)</option>
                      <option value="watching">Currently Watching</option>
                      <option value="watched">History (Completed)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Initial Rating Rank (1 to 5)</label>
                    <div className="flex gap-2 items-center h-[46px]">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const rate = idx + 1;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewRating(rate)}
                            className="p-1.5 cursor-pointer hover:scale-125"
                          >
                            <Star className={`w-5 h-5 ${newRating >= rate ? "fill-yellow-400 text-yellow-400 font-bold" : "text-[#926e6b]/30"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-mono text-[10px] text-[#926e6b]">Short recommendation notes</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Loved director's abstract shots of skies..."
                    className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProgress || !newTitle}
                  className="luxine-glow-button w-full py-4 rounded-xl text-white font-sans font-bold text-sm uppercase tracking-wider"
                >
                  {savingProgress ? "Writing watchlist logs..." : "Add to Cinema Queue"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
