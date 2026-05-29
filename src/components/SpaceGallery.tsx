import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Star, Heart, MessageCircle, X, Upload, Plus, Globe, Check } from "lucide-react";

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
}

// Pre-seeded list of stunning, high-fashion luxury image options for immediate mock upload testing
const PRESET_STOCK_IMAGES = [
  { url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop", caption: "Paris couture collections layout overview." },
  { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", caption: "Luminous contrast sketches study." },
  { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop", caption: "High fashion silhouettes study on beige canvas." },
  { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop", caption: "Red accessories in bright white light." }
];

export default function SpaceGallery({ isAdmin, visitorId }: SpaceGalleryProps) {
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

  // Heart Burst Particles state for realistic tactile reactions
  const [likesState, setLikesState] = useState<{ [key: string]: boolean }>({});
  const [heartParticles, setHeartParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([]);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media);
      }
    } catch (err) {
      console.error("Error loading media", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (type: string) => {
    setFilter(type);
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filter === "all") return true;
    if (filter === "photos") return m.type === "photo";
    if (filter === "videos") return m.type === "video";
    if (filter === "favourites") return m.isFavourite;
    if (filter === "2024") return m.createdAt.startsWith("2024");
    if (filter === "2025") return m.createdAt.startsWith("2025") || m.createdAt.startsWith("2026");
    return true;
  });

  const handleOpenMedia = async (media: Media) => {
    setSelectedMedia(media);
    // Fetch comments for this item
    try {
      const res = await fetch(`/api/media/${media.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Error loading comments", err);
    }
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Spawn 15 heart particles around click point
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    }));

    setHeartParticles((prev) => [...prev, ...newParticles]);
    // Cleanup particles
    setTimeout(() => {
      setHeartParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 800);

    try {
      const res = await fetch(`/api/media/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId })
      });

      if (res.ok) {
        const data = await res.json();
        setLikesState((prev) => ({ ...prev, [id]: data.liked }));
        // Update local count
        setMediaList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, likesCount: data.likesCount } : m))
        );
        if (selectedMedia && selectedMedia.id === id) {
          setSelectedMedia((prev) => (prev ? { ...prev, likesCount: data.likesCount } : null));
        }
      }
    } catch (err) {
      console.error("Error liking item", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia || !newComment.trim()) return;

    try {
      const res = await fetch(`/api/media/${selectedMedia.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: isAdmin ? "Luxine" : "A friend",
          content: newComment
        })
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [...prev, savedComment]);
        setNewComment("");
        // Update comment counter locally
        setMediaList((prev) =>
          prev.map((m) => (m.id === selectedMedia.id ? { ...m, commentsCount: m.commentsCount + 1 } : m))
        );
        setSelectedMedia((prev) => (prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null));
      }
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    setUploadProgress(true);

    try {
      const tagsArray = uploadTags
        ? uploadTags.split(",").map((t) => t.trim())
        : [];
      
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploadUrl.trim(),
          type: uploadType,
          caption: uploadCaption,
          tags: tagsArray,
          isFavourite: uploadIsFav
        })
      });

      if (res.ok) {
        const newlyAdded = await res.json();
        setMediaList((prev) => [newlyAdded, ...prev]);
        setShowUpload(false);
        // Reset inputs
        setUploadUrl("");
        setUploadCaption("");
        setUploadTags("");
        setUploadIsFav(false);
      }
    } catch (err) {
      console.error("Error uploading", err);
    } finally {
      setUploadProgress(false);
    }
  };

  const selectStockImage = (url: string, captionStr: string) => {
    setUploadUrl(url);
    setUploadCaption(captionStr);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Gallery Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2">
            Luxine's Space
          </h1>
          <p className="font-accent-italic text-lg text-[#6c5a5d] dark:text-[#d8c1c4] italic mb-1">
            Her moments. Her way.
          </p>
        </div>
        {/* Only Admin (Luxine/Creator) can Upload as per instructions, but we enable it for direct interactive testing */}
        <button
          onClick={() => setShowUpload(true)}
          className="luxine-glow-button px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform text-white font-sans font-bold text-sm cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>
      </div>

      {/* Filter Segment Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {["all", "photos", "videos", "favourites", "2024", "2025"].map((category) => {
          const isActive = filter === category;
          return (
            <button
              key={category}
              onClick={() => handleFilterClick(category)}
              className={`px-4 py-2 rounded-full font-label-mono text-xs cursor-pointer capitalize transition-all duration-300 shrink-0 ${
                isActive
                  ? "bg-[#e8182c] text-white shadow-[0px_4px_10px_rgba(232,24,44,0.2)] font-semibold"
                  : "bg-white dark:bg-[#1E0D10] text-[#6c5a5d] dark:text-[#d8c1c4] hover:bg-[#FFE4E4]/30 dark:hover:bg-red-950/10 border border-[#FFE4E4]/10 dark:border-red-950/5"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Masonry Columns */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#e8182c] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-[#FFF5F5] dark:bg-[#1E0D10] text-center py-16 rounded-[24px]">
          <p className="font-sans text-base text-[#926e6b]">No precious memories found in this bucket yet.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredMedia.map((media) => (
            <motion.div
              key={media.id}
              onClick={() => handleOpenMedia(media)}
              layoutId={`media_${media.id}`}
              className="break-inside-avoid relative group rounded-[24px] overflow-hidden bg-white dark:bg-[#1E0D10] cursor-pointer border border-[#FFE4E4]/15 shadow-sm transform hover:-translate-y-1 transition-all duration-300"
            >
              {/* Media element: Image/Video */}
              {media.type === "video" ? (
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-md rounded-full p-2">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  <img src={media.url} referrerPolicy="no-referrer" className="w-full object-cover max-h-[400px]" alt={media.caption} />
                </div>
              ) : (
                <img src={media.url} referrerPolicy="no-referrer" className="w-full object-cover max-h-[500px]" alt={media.caption} />
              )}

              {/* Favourites flag badge */}
              {media.isFavourite && (
                <div className="absolute top-4 left-4 z-10 bg-[#e8182c] text-white rounded-full p-1.5 shadow-md">
                  <Star className="w-4 h-4 fill-white" />
                </div>
              )}

              {/* Interactive Hover Overlay panel details */}
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

                    {/* Hearts click visual micro-particles projection inside list element */}
                    {heartParticles.map((hp) => (
                      <span
                        key={hp.id}
                        className="material-symbols-outlined text-[#ff4d60] absolute text-xl select-none pointer-events-none heart-particle"
                        style={{
                          left: `${hp.x}px`,
                          top: `${hp.y}px`,
                          // Use trigonometry calculated coords
                          "--x": `${Math.cos(hp.angle) * 80}px`,
                          "--y": `${Math.sin(hp.angle) * 80}px`
                        } as React.CSSProperties}
                      >
                        favorite
                      </span>
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

      {/* Lightbox Modal display */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[101] flex flex-col md:flex-row"
          >
            {/* Close trigger button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-6 right-6 z-50 text-white hover:text-[#e8182c] bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Visual media viewport segment */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
              {selectedMedia.type === "video" ? (
                <video src={selectedMedia.url} controls autoPlay muted className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
              ) : (
                <img src={selectedMedia.url} referrerPolicy="no-referrer" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt={selectedMedia.caption} />
              )}
            </div>

            {/* Detailed right-hand meta & reactions comment side drawer */}
            <div className="w-full md:w-[400px] bg-[#fcf9f8] dark:bg-[#0f0507] border-l border-[#FFE4E4]/10 dark:border-red-950/20 p-6 flex flex-col overflow-y-auto min-h-[40vh] md:min-h-full">
              <div className="mb-6 border-b border-[#FFE4E4]/20 pb-4">
                <span className="font-label-mono text-[10px] text-[#e8182c] font-bold">Aesthetic Memory snippet</span>
                <p className="font-accent-italic text-2xl text-[#1c1b1b] dark:text-[#fcf9f8] leading-relaxed italic mt-1 mb-2">
                  "{selectedMedia.caption}"
                </p>

                {/* Tags array */}
                {selectedMedia.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedMedia.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full font-label-mono text-[9px] bg-[#FFE4E4] dark:bg-red-950/40 text-[#bd001d] dark:text-red-200">
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

              {/* Comments scroll lists */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[25vh] md:max-h-none mb-6">
                <h4 className="font-sans text-sm font-bold text-[#1c1b1b] dark:text-[#fcf9f8]">Conversations ({comments.length})</h4>
                {comments.length === 0 ? (
                  <p className="font-accent-italic text-sm text-[#926e6b] italic">Leave the first beauty remark...</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-white dark:bg-[#1E0D10] p-3 rounded-xl border border-[#FFE4E4]/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-sans text-xs font-bold text-[#e8182c]">{comment.authorName}</span>
                        <span className="font-label-mono text-[9px] text-[#926e6b]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8]">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comments form container */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Insert review..."
                  className="flex-1 bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-2 rounded-full font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none focus:border-[#e8182c]"
                />
                <button type="submit" className="luxine-glow-button px-5 py-2 rounded-full text-white text-xs font-bold cursor-pointer font-sans uppercase">
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Bottom Sheet Drawers overlay */}
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
              className="bg-[#fcf9f8] dark:bg-[#0f0507] w-full max-w-2xl rounded-t-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold italic text-[#1c1b1b] dark:text-[#fcf9f8]">
                  Upload to Her Space
                </h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-[#926e6b] hover:text-[#e8182c] p-1 rounded-full hover:bg-[#FFE4E4]/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seed Stock Image quick pick list */}
              <div className="mb-6 space-y-3">
                <p className="font-sans text-xs text-[#926e6b] font-bold uppercase tracking-wider">
                  Test Sandbox Image presets
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_STOCK_IMAGES.map((img) => (
                    <div
                      key={img.url}
                      onClick={() => selectStockImage(img.url, img.caption)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group border-2 border-transparent hover:border-[#e8182c]"
                    >
                      <img src={img.url} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actual Upload attributes inputs */}
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-label-mono text-[10px] text-[#926e6b]">Asset URL String</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      placeholder="Insert online image/video URL of your choice..."
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Medium type</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as "photo" | "video")}
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    >
                      <option value="photo">Editorial Photo</option>
                      <option value="video">Cinema Video</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Tags (Comma separated)</label>
                    <input
                      type="text"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="e.g. Milan, Art, Studio"
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-mono text-[10px] text-[#926e6b]">Caption Description</label>
                  <textarea
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Describe this moment..."
                    rows={3}
                    className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none font-accent-italic text-lg italic"
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="isFav"
                    checked={uploadIsFav}
                    onChange={(e) => setUploadIsFav(e.target.checked)}
                    className="rounded text-[#e8182c] focus:ring-[#e8182c]/20"
                  />
                  <label htmlFor="isFav" className="font-sans text-xs font-bold uppercase tracking-wider text-[#6c5a5d] dark:text-[#d8c1c4] cursor-pointer">
                    Bookmark as Favourite Highlight ✦
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploadProgress || !uploadUrl}
                  className="luxine-glow-button w-full py-4 rounded-xl text-white font-sans font-bold text-sm uppercase tracking-wider"
                >
                  {uploadProgress ? "Writing Memory Block..." : "Save to Her Space"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
