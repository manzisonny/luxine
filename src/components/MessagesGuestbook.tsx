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

export default function MessagesGuestbook({ isAdmin, visitorId }: MessagesGuestbookProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState("loved"); // loved, recent, special
  const [loading, setLoading] = useState(true);

  // Composer fields
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [composerFocus, setComposerFocus] = useState(false);
  const [commentingProgress, setCommentingProgress] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Local likes memory tracker
  const [likesState, setLikesState] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error loaded messages", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/messages/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId })
      });

      if (res.ok) {
        const data = await res.json();
        setLikesState((prev) => ({ ...prev, [id]: data.liked }));
        // Update local arrays for snappy UI
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, likesCount: data.likesCount } : m))
        );
      }
    } catch (err) {
      console.error("Error liking comment", err);
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setCommentingProgress(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim() || "Anonymous",
          content: content.trim(),
          isSpecial
        })
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => [savedMessage, ...prev]);
        
        // Reset inputs
        setContent("");
        setAuthorName("");
        setIsSpecial(false);
        setComposerFocus(false);

        // Show cute success notification toast
        setSuccessToast(true);
        setTimeout(() => {
          setSuccessToast(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error writing message", err);
    } finally {
      setCommentingProgress(false);
    }
  };

  const handleMessageDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Error deleting message", err);
    }
  };

  const handlePinToggle = async (id: string, currentPinState: boolean) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPinState })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      }
    } catch (err) {
      console.error("Error toggling pin", err);
    }
  };

  const handleSpecialToggle = async (id: string, currentSpecialState: boolean) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSpecial: !currentSpecialState })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      }
    } catch (err) {
      console.error("Error toggling special status", err);
    }
  };

  // Filtering + Routing sorted arrays locally
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (filter === "loved") {
      return b.likesCount - a.likesCount;
    } else if (filter === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (filter === "special") {
      if (a.isSpecial && !b.isSpecial) return -1;
      if (!a.isSpecial && b.isSpecial) return 1;
      return b.likesCount - a.likesCount;
    }
    return 0;
  });

  return (
    <div className="space-y-6 pb-[200px]">
      {/* Messages Header Block */}
      <section className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2 leading-tight">
          Letters to Luxine
        </h1>
        <p className="font-sans text-xs tracking-wider uppercase font-semibold text-[#926e6b] dark:text-[#926e6b]/80">
          Words left for her, visible to all · {messages.length} letters
        </p>

        {/* Sorting Pills */}
        <div className="flex justify-center gap-3 mt-6">
          {[
            { key: "loved", label: "Most Loved" },
            { key: "recent", label: "Recent" },
            { key: "special", label: "Special highlights" }
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

      {/* Letters List display grid */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#e8182c] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : sortedMessages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1E0D10] rounded-2xl">
          <p className="font-accent-italic text-[#926e6b] italic">The postbox is empty. Be the first to draft a memory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {sortedMessages.map((msg) => {
            const isLiked = !!likesState[msg.id];
            return (
              <motion.article
                key={msg.id}
                layoutId={`msg_card_${msg.id}`}
                className={`relative bg-white dark:bg-[#1E0D10] rounded-[24px] p-6 flex flex-col gap-4 overflow-hidden border border-[#FFE4E4]/10 dark:border-red-950/5 ${
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
                  {/* Signature profile details */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFE4E4] dark:bg-red-950/40 text-[#bd001d] dark:text-red-200 uppercase font-sans font-bold flex items-center justify-center relative shadow-sm text-sm">
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

                  {/* Likes counter indicator button */}
                  <div className="flex items-center gap-2">
                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 bg-[#FFF5F5] dark:bg-[#180A0C] p-1.5 rounded-full border border-[#FFE4E4]/20">
                        <button
                          title="Pin letter"
                          onClick={() => handlePinToggle(msg.id, msg.isPinned)}
                          className={`p-1 rounded-full cursor-pointer hover:bg-[#FFE4E4] ${msg.isPinned ? "text-[#D4AF37]" : "text-[#926e6b]"}`}
                        >
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          title="Toggle Special highlight list"
                          onClick={() => handleSpecialToggle(msg.id, msg.isSpecial)}
                          className={`p-1 rounded-full cursor-pointer hover:bg-[#FFE4E4] ${msg.isSpecial ? "text-[#e8182c]" : "text-[#926e6b]"}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          title="Delete letter"
                          onClick={() => handleMessageDelete(msg.id)}
                          className="p-1 rounded-full cursor-pointer hover:bg-red-100 text-[#bd001d] font-bold"
                        >
                          &times;
                        </button>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleLike(msg.id, e)}
                      className="flex items-center gap-1 bg-[#FFF5F5] dark:bg-[#180A0C] border border-[#FFE4E4]/10 dark:border-red-950/5 px-3 py-1.5 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                      <Heart className={`w-3.5 h-3.5 text-[#e8182c] ${isLiked ? "fill-current" : ""}`} />
                      <span className="font-label-mono text-[10px] text-[#6c5a5d] dark:text-[#d8c1c4]">{msg.likesCount}</span>
                    </button>
                  </div>
                </div>

                {/* Letters body */}
                <p className="font-accent-italic text-lg text-[#1c1b1b] dark:text-[#fcf9f8] tracking-wide leading-relaxed pl-2 italic">
                  "{msg.content}"
                </p>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Dynamic composer form panel sliding up */}
      <div className="fixed bottom-[80px] md:bottom-6 left-0 w-full z-45 px-4 md:px-12 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <form
            onSubmit={handleComposeSubmit}
            onFocus={() => setComposerFocus(true)}
            className="w-full bg-[#fcf9f8]/95 dark:bg-[#0f0507]/95 backdrop-blur-md rounded-[28px] p-3 shadow-[0px_10px_40px_rgba(232,24,44,0.12)] border border-[#e8182c]/10 flex flex-col gap-3 transition-all duration-300"
          >
            {/* Extended attributes if panel expands on user focus click */}
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
                  placeholder="Your Name (Optional)"
                  className="bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/45 px-4 py-2.5 rounded-full font-sans text-xs text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                />
                <div className="flex items-center justify-end gap-2 pr-2">
                  <input
                    type="checkbox"
                    id="isSpecialComp"
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="rounded text-[#e8182c] focus:ring-[#e8182c]/20"
                  />
                  <label htmlFor="isSpecialComp" className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] cursor-pointer">
                    Flag Special Highlight ✦
                  </label>
                </div>
              </motion.div>
            )}

            {/* Input Row layout container */}
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

      {/* Success notification alert toasts */}
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
