import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Heart, Star, Pin, Send, Check } from "lucide-react";

interface Message {
  id: string;
  authorName: string;
  content: string;
  isSpecial: boolean;
  isPinned: boolean;
  likesCount: number;
  createdAt: string;
}

interface MessagesGuestbookProps {
  isAdmin: boolean;
  visitorId: string;
}

const MESSAGES_KEY = "luxine_messages_v1";

const SEED_MESSAGES: Message[] = [
  {
    id: "msg1",
    authorName: "Eleanor Vance",
    content: "There is a certain gravity to the way you curate the world around you. Walking through your space feels less like observation and more like being enveloped in a carefully orchestrated dream. Keep shining, Luxine.",
    isSpecial: true,
    isPinned: true,
    likesCount: 1200,
    createdAt: "2026-05-29T07:49:00Z"
  },
  {
    id: "msg2",
    authorName: "Julian",
    content: "I left the city just to see the sky you mentioned. It was exactly as dramatic as you promised. Waiting for the next chapter.",
    isSpecial: true,
    isPinned: false,
    likesCount: 842,
    createdAt: "2026-05-29T04:49:00Z"
  },
  {
    id: "msg3",
    authorName: "Marcus L.",
    content: "The aesthetic of your latest post was absolutely devastating. I haven't been able to stop thinking about the composition.",
    isSpecial: false,
    isPinned: false,
    likesCount: 156,
    createdAt: "2026-05-28T09:00:00Z"
  },
  {
    id: "msg4",
    authorName: "Sophia",
    content: "Forever inspired by the shadows you cast. Happy birthday Ella! 🎂",
    isSpecial: false,
    isPinned: false,
    likesCount: 32,
    createdAt: "2026-05-30T00:00:00Z"
  }
];

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const seeded = SEED_MESSAGES;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveMessages(messages: Message[]) {
  try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages)); } catch {}
}

export default function MessagesGuestbook({ isAdmin, visitorId }: MessagesGuestbookProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState("loved");
  const [loading, setLoading] = useState(true);

  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [composerFocus, setComposerFocus] = useState(false);
  const [commentingProgress, setCommentingProgress] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [likesState, setLikesState] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loaded = loadMessages();
    setMessages(loaded);
    setLoading(false);
  }, []);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newLiked = !likesState[id];
    setLikesState((prev) => ({ ...prev, [id]: newLiked }));
    const updated = messages.map((m) =>
      m.id === id ? { ...m, likesCount: m.likesCount + (newLiked ? 1 : -1) } : m
    );
    setMessages(updated);
    saveMessages(updated);
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setCommentingProgress(true);

    setTimeout(() => {
      const newMsg: Message = {
        id: "msg_" + Date.now(),
        authorName: authorName.trim() || "Anonymous",
        content: content.trim(),
        isSpecial,
        isPinned: false,
        likesCount: 0,
        createdAt: new Date().toISOString()
      };
      const updated = [newMsg, ...messages];
      setMessages(updated);
      saveMessages(updated);
      setContent("");
      setAuthorName("");
      setIsSpecial(false);
      setComposerFocus(false);
      setCommentingProgress(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    }, 500);
  };

  const handleMessageDelete = (id: string) => {
    if (!isAdmin) return;
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveMessages(updated);
  };

  const handlePinToggle = (id: string, currentPin: boolean) => {
    if (!isAdmin) return;
    const updated = messages.map((m) => m.id === id ? { ...m, isPinned: !currentPin } : m);
    setMessages(updated);
    saveMessages(updated);
  };

  const handleSpecialToggle = (id: string, currentSpecial: boolean) => {
    if (!isAdmin) return;
    const updated = messages.map((m) => m.id === id ? { ...m, isSpecial: !currentSpecial } : m);
    setMessages(updated);
    saveMessages(updated);
  };

  const sortedMessages = [...messages].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (filter === "loved") return b.likesCount - a.likesCount;
    if (filter === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (filter === "special") {
      if (a.isSpecial && !b.isSpecial) return -1;
      if (!a.isSpecial && b.isSpecial) return 1;
      return b.likesCount - a.likesCount;
    }
    return 0;
  });

  return (
    <div className="space-y-6 pb-[200px]">
      {/* Header */}
      <section className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2 leading-tight">
          Letters to Luxine
        </h1>
        <p className="font-sans text-xs tracking-wider uppercase font-semibold text-[#926e6b]">
          Words left for her, visible to all · {messages.length} letters
        </p>

        <div className="flex justify-center gap-3 mt-6">
          {[
            { key: "loved", label: "Most Loved" },
            { key: "recent", label: "Recent" },
            { key: "special", label: "Special" }
          ].map((item) => {
            const isActive = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-5 py-2 rounded-full font-label-mono text-xs cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-[#e8182c] text-white shadow-[0px_4px_10px_rgba(232,24,44,0.15)] scale-105 font-bold"
                    : "bg-white dark:bg-[#1E0D10] text-[#6c5a5d] dark:text-[#d8c1c4] hover:bg-[#FFE4E4]/30 border border-[#FFE4E4]/10 dark:border-red-950/5"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Messages Grid */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#e8182c] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : sortedMessages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1E0D10] rounded-2xl">
          <p className="font-accent-italic text-[#926e6b] italic">Be the first to leave a letter ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {sortedMessages.map((msg) => {
            const isLiked = !!likesState[msg.id];
            return (
              <motion.article
                key={msg.id}
                layoutId={`msg_card_${msg.id}`}
                className={`relative bg-white dark:bg-[#1E0D10] rounded-[24px] p-6 flex flex-col gap-4 overflow-hidden border border-[#FFE4E4]/20 dark:border-red-950/5 ${
                  msg.isPinned
                    ? "shadow-[0px_8px_25px_rgba(212,175,55,0.12)] border-t-[4px] border-t-[#D4AF37]"
                    : msg.isSpecial
                    ? "shadow-[0px_8px_25px_rgba(232,24,44,0.1)] border-l-[4px] border-l-[#e8182c]"
                    : "shadow-[0px_4px_20px_rgba(232,24,44,0.02)]"
                }`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFE4E4] dark:bg-red-950/40 text-[#bd001d] uppercase font-sans font-bold flex items-center justify-center text-sm shadow-sm">
                      {msg.authorName[0]}
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8]">{msg.authorName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#926e6b]">
                        {msg.isPinned && (
                          <span className="flex items-center gap-0.5 text-[#D4AF37] font-bold">
                            <Pin className="w-3 h-3 fill-current" /> Pinned
                          </span>
                        )}
                        {!msg.isPinned && msg.isSpecial && (
                          <span className="flex items-center gap-0.5 text-[#e8182c] font-bold">
                            <Star className="w-3 h-3 fill-current" /> Special
                          </span>
                        )}
                        <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 bg-[#FFF5F5] dark:bg-[#180A0C] p-1.5 rounded-full border border-[#FFE4E4]/20">
                        <button
                          title="Pin"
                          onClick={() => handlePinToggle(msg.id, msg.isPinned)}
                          className={`p-1 rounded-full cursor-pointer hover:bg-[#FFE4E4] ${msg.isPinned ? "text-[#D4AF37]" : "text-[#926e6b]"}`}
                        >
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          title="Special"
                          onClick={() => handleSpecialToggle(msg.id, msg.isSpecial)}
                          className={`p-1 rounded-full cursor-pointer hover:bg-[#FFE4E4] ${msg.isSpecial ? "text-[#e8182c]" : "text-[#926e6b]"}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleMessageDelete(msg.id)}
                          className="p-1 rounded-full cursor-pointer hover:bg-red-100 text-[#bd001d] font-bold"
                        >
                          &times;
                        </button>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleLike(msg.id, e)}
                      className="flex items-center gap-1 bg-[#FFF5F5] dark:bg-[#180A0C] border border-[#FFE4E4]/20 dark:border-red-950/10 px-3 py-1.5 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                      <Heart className={`w-3.5 h-3.5 text-[#e8182c] ${isLiked ? "fill-current" : ""}`} />
                      <span className="font-label-mono text-[10px] text-[#6c5a5d] dark:text-[#d8c1c4]">{msg.likesCount}</span>
                    </button>
                  </div>
                </div>

                <p className="font-accent-italic text-lg text-[#1c1b1b] dark:text-[#fcf9f8] tracking-wide leading-relaxed pl-2 italic">
                  "{msg.content}"
                </p>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Composer */}
      <div className="fixed bottom-[80px] md:bottom-6 left-0 w-full z-45 px-4 md:px-12 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <form
            onSubmit={handleComposeSubmit}
            onFocus={() => setComposerFocus(true)}
            className="w-full bg-[#fcf9f8]/95 dark:bg-[#0f0507]/95 backdrop-blur-md rounded-[28px] p-3 shadow-[0px_10px_40px_rgba(232,24,44,0.12)] border border-[#e8182c]/10 flex flex-col gap-3 transition-all duration-300"
          >
            {composerFocus && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-2 gap-3 px-2 pt-2"
              >
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name (optional)"
                  className="bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/45 px-4 py-2.5 rounded-full font-sans text-xs text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                />
                <div className="flex items-center justify-end gap-2 pr-2">
                  <input
                    type="checkbox"
                    id="isSpecialComp"
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="rounded text-[#e8182c]"
                  />
                  <label htmlFor="isSpecialComp" className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] cursor-pointer">
                    Mark Special ✦
                  </label>
                </div>
              </motion.div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF5F5] dark:bg-[#1E0D10] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-[#e8182c]" />
              </div>
              <input
                type="text"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something beautiful for Luxine..."
                className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 outline-none font-accent-italic text-lg text-[#1c1b1b] dark:text-[#fcf9f8] placeholder:text-[#926e6b]/45 px-2 py-2"
              />
              <button
                type="submit"
                disabled={commentingProgress || !content.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-[#e8182c] to-[#b01221] flex items-center justify-center text-white shrink-0 shadow-[0px_4px_12px_rgba(232,24,44,0.3)] hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {commentingProgress ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[150px] left-1/2 -translate-x-1/2 bg-[#bd001d] text-white px-5 py-3 rounded-full flex items-center gap-2 z-[99] shadow-lg font-sans text-xs font-bold uppercase tracking-wider"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>Your words are inside the capsule ✦</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
