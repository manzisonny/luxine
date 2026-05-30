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

const ELLA_SEED_MESSAGES: Message[] = [];

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out legacy mock/seeded messages so user gets a clean slate
      return parsed.filter((m: Message) => !["msg1", "msg2", "msg3", "msg4"].includes(m.id));
    }
  } catch {}
  return ELLA_SEED_MESSAGES;
}

function saveMessages(messages: Message[]) {
  try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages)); } catch {}
}

export default function MessagesGuestbook({ isAdmin, visitorId }: MessagesGuestbookProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState("recent");
  const [loading, setLoading] = useState(true);

  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
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
        authorName: authorName.trim() || "Anonymous Friend",
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
    <div className="space-y-8 pb-32 max-w-4xl mx-auto">
      {/* Header */}
      <section className="text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2 leading-tight">
          Letters to Ella
        </h1>
        <p className="font-accent-italic text-lg italic text-[#926e6b] dark:text-[#d8c1c4]">
          Leave a sweet birthday message or warm wishes inside her digital capsule.
        </p>
      </section>

      {/* High Contrast, Beautiful Message Form (Composer) - In-flow for perfect visibility */}
      <div className="bg-white dark:bg-[#1E0D10] border border-[#FFE4E4]/40 dark:border-red-950/20 p-6 md:p-8 rounded-[28px] shadow-[0px_10px_35px_rgba(232,24,44,0.02)]">
        <h3 className="font-serif text-xl font-bold italic mb-4 text-[#bd001d] dark:text-[#ffb3ae] flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Write Your Message
        </h3>
        
        <form onSubmit={handleComposeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-[#fcf9f8] dark:bg-[#150709] border border-[#FFE4E4]/80 dark:border-red-950/50 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] placeholder:text-[#926e6b]/45 focus:border-[#e8182c] dark:focus:border-[#ffb3ae] focus:ring-1 focus:ring-[#e8182c] outline-none transition-all"
              />
            </div>
            
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 text-xs font-bold font-label-mono uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="rounded border-[#FFE4E4]/80 dark:border-red-950/50 text-[#e8182c] focus:ring-[#e8182c] w-4 h-4 cursor-pointer"
                />
                Mark as Special Message ✦
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-label-mono uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] mb-1.5">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What beautiful memory or wish would you like to share?"
              className="w-full bg-[#fcf9f8] dark:bg-[#150709] border border-[#FFE4E4]/80 dark:border-red-950/50 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] placeholder:text-[#926e6b]/45 focus:border-[#e8182c] dark:focus:border-[#ffb3ae] focus:ring-1 focus:ring-[#e8182c] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={commentingProgress || !content.trim()}
              className="bg-gradient-to-b from-[#e8182c] to-[#b01221] hover:from-[#f4263a] hover:to-[#be1727] text-white px-6 py-3 rounded-xl font-sans text-sm font-bold shadow-[0px_4px_12px_rgba(232,24,44,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {commentingProgress ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Message count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-[#FFE4E4]/20 dark:border-red-950/20">
        <p className="font-sans text-xs tracking-wider uppercase font-semibold text-[#926e6b] dark:text-[#926e6b]/80">
          Letters Feed · {messages.length} total
        </p>

        <div className="flex gap-2">
          {[
            { key: "recent", label: "Recent" },
            { key: "loved", label: "Most Loved" },
            { key: "special", label: "Special" }
          ].map((item) => {
            const isActive = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-1.5 rounded-full font-label-mono text-[10px] uppercase font-bold cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-[#e8182c] text-white shadow-[0px_4px_10px_rgba(232,24,44,0.15)]"
                    : "bg-white dark:bg-[#1E0D10] text-[#6c5a5d] dark:text-[#d8c1c4] hover:bg-[#FFE4E4]/30 border border-[#FFE4E4]/10 dark:border-red-950/5"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Grid */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#e8182c] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : sortedMessages.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1E0D10] rounded-[24px] border border-[#FFE4E4]/20 dark:border-red-950/5">
          <p className="font-accent-italic text-[#926e6b] dark:text-[#d8c1c4] italic text-lg mb-2">Be the first to leave a letter ✨</p>
          <p className="font-sans text-xs text-[#926e6b]/60">Your message will appear here in real-time.</p>
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

                <p className="font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] tracking-wide leading-relaxed pl-2">
                  {msg.content}
                </p>
              </motion.article>
            );
          })}
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
            <span>Your message has been posted ✦</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
