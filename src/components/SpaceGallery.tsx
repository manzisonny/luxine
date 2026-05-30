import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Star, Heart, MessageCircle, X, Upload, Globe, Check, Camera } from "lucide-react";

interface Media {
  id: string;
  url: string;
  type: "photo" | "video";
  caption: string;
  tags: string[];
  isFavourite: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface SpaceGalleryProps {
  isAdmin: boolean;
  visitorId: string;
  theme?: "light" | "dark";
}

// Local storage key
const MEDIA_KEY = "luxine_media_v1";

// Ella's real photos (already in /public/ella/)
const ELLA_SEED_MEDIA: Media[] = [
  {
    id: "ella_1",
    url: "/ella/IMG_6486.JPG.jpeg",
    type: "photo",
    caption: "Ella ✨",
    tags: ["Ella", "Moments"],
    isFavourite: true,
    likesCount: 0,
    commentsCount: 0,
    createdAt: "2026-05-22T12:09:03Z"
  },
  {
    id: "ella_2",
    url: "/ella/IMG_6929.JPG.jpeg",
    type: "photo",
    caption: "Beautiful day 🌹",
    tags: ["Ella", "Vibes"],
    isFavourite: true,
    likesCount: 0,
    commentsCount: 0,
    createdAt: "2026-05-22T12:21:15Z"
  }
];

function loadMedia(): Media[] {
  try {
    const stored = localStorage.getItem(MEDIA_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return ELLA_SEED_MEDIA;
}

function saveMedia(media: Media[]) {
  try { localStorage.setItem(MEDIA_KEY, JSON.stringify(media)); } catch {}
}

export default function SpaceGallery({ isAdmin, visitorId, theme = "dark" }: SpaceGalleryProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  // Upload States
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadType, setUploadType] = useState<"photo" | "video">("photo");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadIsFav, setUploadIsFav] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "device">("device");
  const [previewSrc, setPreviewSrc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [likesState, setLikesState] = useState<{ [key: string]: boolean }>({});
  const [heartParticles, setHeartParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([]);

  useEffect(() => {
    const stored = loadMedia();
    setMediaList(stored);
    setLoading(false);
  }, []);

  const filteredMedia = mediaList.filter((m) => {
    if (filter === "all") return true;
    if (filter === "photos") return m.type === "photo";
    if (filter === "videos") return m.type === "video";
    if (filter === "favourites") return m.isFavourite;
    if (filter === "2024") return m.createdAt.startsWith("2024");
    if (filter === "2025") return m.createdAt.startsWith("2025") || m.createdAt.startsWith("2026");
    return true;
  });

  const handleOpenMedia = (media: Media) => {
    setSelectedMedia(media);
    const key = `comments_${media.id}`;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      setComments(stored);
    } catch { setComments([]); }
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i, x, y,
      angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    }));
    setHeartParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setHeartParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 800);

    const newLiked = !likesState[id];
    setLikesState((prev) => ({ ...prev, [id]: newLiked }));
    const updated = mediaList.map((m) =>
      m.id === id ? { ...m, likesCount: m.likesCount + (newLiked ? 1 : -1) } : m
    );
    setMediaList(updated);
    saveMedia(updated);
    if (selectedMedia?.id === id) {
      setSelectedMedia((prev) => prev ? { ...prev, likesCount: prev.likesCount + (newLiked ? 1 : -1) } : null);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia || !newComment.trim()) return;
    const comment = {
      id: "c_" + Date.now(),
      mediaId: selectedMedia.id,
      authorName: "A friend",
      content: newComment.trim(),
      createdAt: new Date().toISOString()
    };
    const updated = [...comments, comment];
    setComments(updated);
    localStorage.setItem(`comments_${selectedMedia.id}`, JSON.stringify(updated));
    setNewComment("");
    const updatedMedia = mediaList.map((m) =>
      m.id === selectedMedia.id ? { ...m, commentsCount: m.commentsCount + 1 } : m
    );
    setMediaList(updatedMedia);
    saveMedia(updatedMedia);
    setSelectedMedia((prev) => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video");
    setUploadType(isVideo ? "video" : "photo");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setPreviewSrc(src);
      setUploadUrl(src);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = uploadMode === "url" ? uploadUrl.trim() : previewSrc;
    if (!finalUrl) return;

    setUploadProgress(true);
    const tagsArray = uploadTags ? uploadTags.split(",").map((t) => t.trim()) : [];
    const newMedia: Media = {
      id: "m_" + Date.now(),
      url: finalUrl,
      type: uploadType,
      caption: uploadCaption || "A beautiful moment.",
      tags: tagsArray,
      isFavourite: uploadIsFav,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      const updated = [newMedia, ...mediaList];
      setMediaList(updated);
      saveMedia(updated);
      setShowUpload(false);
      setUploadUrl("");
      setUploadCaption("");
      setUploadTags("");
      setUploadIsFav(false);
      setPreviewSrc("");
      setUploadProgress(false);
    }, 600);
  };

  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-[#1E0D10] border-red-950/10" : "bg-white border-[#FFE4E4]/30";
  const textPrimary = isDark ? "text-[#fcf9f8]" : "text-[#1c1b1b]";
  const textMuted = "text-[#926e6b]";
  const inputClass = `w-full border px-4 py-3 rounded-xl font-sans text-sm outline-none transition-colors ${isDark ? "bg-[#1E0D10] border-red-950/40 text-[#fcf9f8] focus:border-[#e8182c]" : "bg-white border-[#e7bcb9] text-[#1c1b1b] focus:border-[#e8182c]"}`;

  return (
    <div className="space-y-6 pb-24">
      {/* Gallery Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className={`font-serif text-3xl md:text-5xl font-bold italic mb-2 ${isDark ? "text-[#ffb3ae]" : "text-[#bd001d]"}`}>
            Ella's Space
          </h1>
          <p className={`font-accent-italic text-lg italic mb-1 ${isDark ? "text-[#d8c1c4]" : "text-[#6c5a5d]"}`}>
            Her moments. Her way.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="luxine-glow-button px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform font-sans font-bold text-sm cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Add Photo / Video</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {["all", "photos", "videos", "favourites", "2025"].map((category) => {
          const isActive = filter === category;
          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-full font-label-mono text-xs cursor-pointer capitalize transition-all duration-300 shrink-0 ${
                isActive
                  ? "bg-[#e8182c] text-white shadow-[0px_4px_10px_rgba(232,24,44,0.2)] font-semibold"
                  : isDark
                  ? "bg-[#1E0D10] text-[#d8c1c4] hover:bg-red-950/20 border border-red-950/10"
                  : "bg-white text-[#6c5a5d] hover:bg-[#FFE4E4]/30 border border-[#FFE4E4]/30"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#e8182c] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className={`text-center py-16 rounded-[24px] ${isDark ? "bg-[#1E0D10]" : "bg-[#FFF5F5]"}`}>
          <p className={`font-sans text-base ${textMuted}`}>No memories found here yet. Add the first one! ✨</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredMedia.map((media) => (
            <motion.div
              key={media.id}
              onClick={() => handleOpenMedia(media)}
              layoutId={`media_${media.id}`}
              className={`break-inside-avoid relative group rounded-[24px] overflow-hidden cursor-pointer border shadow-sm transform hover:-translate-y-1 transition-all duration-300 ${cardBg}`}
            >
              {media.type === "video" ? (
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md rounded-full p-2">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  <video src={media.url} className="w-full object-cover max-h-[400px]" muted playsInline />
                </div>
              ) : (
                <img src={media.url} className="w-full object-cover max-h-[500px]" alt={media.caption} />
              )}

              {media.isFavourite && (
                <div className="absolute top-4 left-4 z-10 bg-[#e8182c] text-white rounded-full p-1.5 shadow-md">
                  <Star className="w-4 h-4 fill-white" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <p className="font-accent-italic text-lg text-white font-medium italic mb-2 tracking-wide leading-relaxed">
                  "{media.caption}"
                </p>
                <div className="flex items-center gap-4 text-white">
                  <button
                    onClick={(e) => handleLike(media.id, e)}
                    className="flex items-center gap-1 font-label-mono text-xs hover:text-[#ffb3ae] relative shrink-0"
                  >
                    <Heart className={`w-4 h-4 ${likesState[media.id] ? "fill-current text-[#ffb3ae]" : ""}`} />
                    <span>{media.likesCount}</span>
                    {heartParticles.map((hp) => (
                      <Heart
                        key={hp.id}
                        className="text-[#ff4d60] fill-[#ff4d60] absolute select-none pointer-events-none heart-particle"
                        style={{
                          width: "16px", height: "16px",
                          left: `${hp.x}px`, top: `${hp.y}px`,
                          "--x": `${Math.cos(hp.angle) * 80}px`,
                          "--y": `${Math.sin(hp.angle) * 80}px`
                        } as React.CSSProperties}
                      />
                    ))}
                  </button>
                  <div className="flex items-center gap-1 font-label-mono text-xs shrink-0">
                    <MessageCircle className="w-4 h-4" />
                    <span>{media.commentsCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[101] flex flex-col md:flex-row"
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-6 right-6 z-50 text-white hover:text-[#e8182c] bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-center p-4">
              {selectedMedia.type === "video" ? (
                <video src={selectedMedia.url} controls autoPlay muted className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
              ) : (
                <img src={selectedMedia.url} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt={selectedMedia.caption} />
              )}
            </div>

            <div className={`w-full md:w-[400px] border-l p-6 flex flex-col overflow-y-auto min-h-[40vh] md:min-h-full ${isDark ? "bg-[#0f0507] border-red-950/20" : "bg-[#fcf9f8] border-[#FFE4E4]/20"}`}>
              <div className="mb-6 border-b border-[#FFE4E4]/20 pb-4">
                <span className="font-label-mono text-[10px] text-[#e8182c] font-bold">Memory</span>
                <p className={`font-accent-italic text-2xl leading-relaxed italic mt-1 mb-2 ${textPrimary}`}>
                  "{selectedMedia.caption}"
                </p>
                {selectedMedia.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedMedia.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full font-label-mono text-[9px] bg-[#FFE4E4] dark:bg-red-950/40 text-[#bd001d]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between font-label-mono text-xs text-[#926e6b] mt-4">
                  <span>Likes: {selectedMedia.likesCount}</span>
                  <span>{new Date(selectedMedia.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[25vh] md:max-h-none mb-6">
                <h4 className={`font-sans text-sm font-bold ${textPrimary}`}>Comments ({comments.length})</h4>
                {comments.length === 0 ? (
                  <p className="font-accent-italic text-sm text-[#926e6b] italic">Leave the first comment...</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className={`p-3 rounded-xl border ${isDark ? "bg-[#1E0D10] border-red-950/10" : "bg-white border-[#FFE4E4]/20"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-sans text-xs font-bold text-[#e8182c]">{comment.authorName}</span>
                        <span className="font-label-mono text-[9px] text-[#926e6b]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className={`font-sans text-sm ${textPrimary}`}>{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Say something sweet..."
                  className={`flex-1 border px-4 py-2 rounded-full font-sans text-sm outline-none focus:border-[#e8182c] ${isDark ? "bg-[#1E0D10] border-red-950/40 text-[#fcf9f8]" : "bg-white border-[#e7bcb9] text-[#1c1b1b]"}`}
                />
                <button type="submit" className="luxine-glow-button px-5 py-2 rounded-full text-white text-xs font-bold cursor-pointer font-sans uppercase">
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Bottom Sheet */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 shadow-xl backdrop-blur-sm z-[110] flex items-end justify-center"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-t-[32px] p-6 shadow-2xl max-h-[92vh] overflow-y-auto ${isDark ? "bg-[#0f0507]" : "bg-[#fcf9f8]"}`}
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-[#e7bcb9] rounded-full mx-auto mb-5"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`font-serif text-2xl font-bold italic ${textPrimary}`}>
                  Add to Ella's Space
                </h3>
                <button onClick={() => setShowUpload(false)} className="text-[#926e6b] hover:text-[#e8182c] p-1 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setUploadMode("device")}
                  className={`flex-1 py-2.5 rounded-full font-label-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${uploadMode === "device" ? "bg-[#e8182c] text-white" : isDark ? "bg-[#1E0D10] text-[#d8c1c4]" : "bg-[#FFF5F5] text-[#6c5a5d]"}`}
                >
                  <Camera className="w-4 h-4" /> From Device
                </button>
                <button
                  onClick={() => setUploadMode("url")}
                  className={`flex-1 py-2.5 rounded-full font-label-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${uploadMode === "url" ? "bg-[#e8182c] text-white" : isDark ? "bg-[#1E0D10] text-[#d8c1c4]" : "bg-[#FFF5F5] text-[#6c5a5d]"}`}
                >
                  <Globe className="w-4 h-4" /> From URL
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {uploadMode === "device" ? (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                        previewSrc
                          ? "border-[#e8182c]"
                          : isDark ? "border-red-950/30 hover:border-[#e8182c]/50" : "border-[#e7bcb9] hover:border-[#e8182c]/50"
                      }`}
                    >
                      {previewSrc ? (
                        uploadType === "video"
                          ? <video src={previewSrc} className="h-32 rounded-xl object-cover" />
                          : <img src={previewSrc} className="h-32 rounded-xl object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-[#926e6b]" />
                          <p className="font-sans text-sm text-[#926e6b]">Tap to pick a photo or video from your device</p>
                        </>
                      )}
                    </div>
                    {previewSrc && (
                      <button
                        type="button"
                        onClick={() => { setPreviewSrc(""); setUploadUrl(""); }}
                        className="text-xs text-[#926e6b] hover:text-[#e8182c] underline"
                      >
                        Remove & pick another
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Image / Video URL</label>
                    <input
                      type="url"
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Type</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as "photo" | "video")}
                      className={inputClass}
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="e.g. Friends, Birthday"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-mono text-[10px] text-[#926e6b]">Caption</label>
                  <textarea
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Describe this beautiful moment..."
                    rows={3}
                    className={`${inputClass} font-accent-italic text-lg italic`}
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="isFav"
                    checked={uploadIsFav}
                    onChange={(e) => setUploadIsFav(e.target.checked)}
                    className="rounded text-[#e8182c]"
                  />
                  <label htmlFor="isFav" className={`font-sans text-xs font-bold uppercase tracking-wider cursor-pointer ${isDark ? "text-[#d8c1c4]" : "text-[#6c5a5d]"}`}>
                    Mark as Favourite ✦
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploadProgress || (!previewSrc && !uploadUrl)}
                  className="luxine-glow-button w-full py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  {uploadProgress ? "Saving..." : "Save to Her Space ✨"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
