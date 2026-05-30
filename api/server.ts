import express from "express";
import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";

const app = express();
app.use(express.json());

const DB_PATH = path.join(process.cwd(), "db.json");

// Helper to check if Vercel KV is connected
const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// In-memory cache fallback for development when writing to file fails on read-only environments
let localDbCache: any = null;

async function getDb(): Promise<any> {
  if (useKV) {
    try {
      const data = await kv.get("luxine_db_v2");
      if (data) {
        return typeof data === "string" ? JSON.parse(data) : data;
      }
    } catch (err) {
      console.error("Vercel KV Read error:", err);
    }
  }

  // Local filesystem fallback
  if (localDbCache) return localDbCache;
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      localDbCache = JSON.parse(data);
      return localDbCache;
    }
  } catch (err) {
    console.error("Error reading local db.json:", err);
  }
  
  // Default structure
  const defaultDb = {
    settings: { luxineMood: "Radiant", luxineMoodEmoji: "✨" },
    media: [],
    mediaComments: [],
    mediaLikes: [],
    messages: [],
    messageLikes: [],
    events: [],
    moodLogs: [],
    watchlist: []
  };
  localDbCache = defaultDb;
  return defaultDb;
}

async function saveDb(data: any): Promise<void> {
  localDbCache = data;
  if (useKV) {
    try {
      await kv.set("luxine_db_v2", data);
      return;
    } catch (err) {
      console.error("Vercel KV Write error:", err);
    }
  }

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to local db.json:", err);
  }
}

// 60+ Personal, Gorgeous Affirmations for Luxine
const AFFIRMATIONS = [
  "You don't enter rooms, Luxine — you elevate them.",
  "The world became more interesting the moment you arrived in it.",
  "Your softness is not weakness. It is your most powerful currency.",
  "There is a particular kind of magic that belongs only to you.",
  "Luxine: rare, warm, and absolutely unforgettable.",
  "Every shadow you cast only highlights the radiance of your path.",
  "You carry an elegant universe inside yourself, Luxine.",
  "Your curation of moments is pure visual poetry.",
  "In a world of noise, your silent composure is an absolute masterpiece.",
  "The details you notice are the details that bring the world to life.",
  "Luxine, your presence is an exquisite work of digital and tactile art.",
  "Your delicate heart is protected by absolute creative strength.",
  "May your space always reflect the deep peace of your soul.",
  "You turn ordinary moments into breathtaking memories.",
  "Like the finest Italian silk, your grace is smooth yet incredibly resilient.",
  "The aesthetic of your dreams is shaping the beauty of your reality.",
  "You inspire everyone to appreciate the beautiful contrast of light and shadows.",
  "Never dim your fire, Luxine. The world needs your passionate red glow.",
  "Your style is timeless; your mind is a sanctuary of brilliant thoughts.",
  "You walk through life with an effortless gravitas that commands awe.",
  "You are the director of your own elegant narrative, and it is stunning.",
  "Luxine, you are a rare diamond cut with perfect architectural precision.",
  "Your artistic spirit breathes warmth into every blank canvas.",
  "The serenity of your space is a gift to everyone invited into it.",
  "You hold a celestial kind of charm that is impossible to duplicate.",
  "May your birthday season bring you closer to the absolute heights of your potential.",
  "Your intuition is an unerring compass guiding you to beautiful encounters.",
  "Luxine, the tenderness of your care makes the world feel infinitely safer.",
  "Your laughter is a melody that makes even the quietest spaces celebrate.",
  "You represent a perfect union of creative intellect and aesthetic beauty.",
  "Each year adds gorgeous depth to your already breathtaking story.",
  "You deserve absolute tranquility, boundless creativity, and magnificent love.",
  "You are entirely unique—composed of starlight, luxury red accents, and high style.",
  "The world gains elegance from your meticulously designed visual spaces.",
  "Your creative vision is a powerful lens that reveals hidden beauty.",
  "Never forget that the world is more beautiful because you exist, Luxine.",
  "Your quiet confidence is infinitely loud in its brilliant majesty.",
  "You deserve a world handled with the same delicate care you offer others.",
  "Your ideas are seeds that grow into spectacular realities.",
  "Luxine: a beautiful signature of passion, elegance, and soft light.",
  "May your passion for life burn brighter and fiercer with every dawn.",
  "The architectural symmetry of your mind is absolutely captivating.",
  "You are the perfect curator of memories, capturing the weight of the moment.",
  "The deep red glow surrounding your presence is a reflection of your warm loyalty.",
  "You are a rare vision of pure high-fashion glamour and deep intellect.",
  "May every path you walk be covered in celebratory rose petals today.",
  "Your soul is built of dreams, and your hands have the power to mold them.",
  "Luxine, you deserve to shine with uninterrupted, glorious brilliance.",
  "Your gentle nature is a silent rebellion against a harsh world.",
  "You write poetry not with a pen, but with your exquisite design choice.",
  "The world celebrates Iriza Ella Luxine—timeless, rare, and deeply loved.",
  "Every encounter you participate in becomes a milestone in a beautiful epic.",
  "You bring clarity, perspective, and high high-fidelity style to us all.",
  "Your energy is both a calming ocean and a passionate crimson fire.",
  "Your standard of beauty is not of this world—it is of Luxine’s World.",
  "Your warmth is the signature we seek to inspire us every daily cycle.",
  "Today and every day, you are an absolute vision of elite craftsmanship.",
  "The universe stands in perfect alignment for your Golden Celebration.",
  "Your legacy is computed in deep warmth, beautiful stories, and dynamic creations.",
  "Luxine, continue creating. Your design language is our favoritest dialect."
];

// API Routes

// Access Validation Gate
app.post("/api/access", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Passcode is required." });
  }
  
  const formattedCode = code.trim().toLowerCase();
  if (formattedCode === "luxine" || formattedCode === "1234" || formattedCode === "manzi") {
    const isAdmin = formattedCode === "luxine" || formattedCode === "manzi";
    return res.status(200).json({
      success: true,
      token: "luxine_secret_token_session",
      isAdmin,
      visitorId: "visitor_v1_" + Math.random().toString(36).substring(2, 11)
    });
  }
  
  return res.status(401).json({ success: false, message: "Invalid code. This world doesn't open for everyone." });
});

// GET /api/media
app.get("/api/media", async (req, res) => {
  const db = await getDb();
  res.json({ media: db.media || [] });
});

// POST /api/media
app.post("/api/media", async (req, res) => {
  const { url, type, caption, tags, isFavourite } = req.body;
  
  if (!url || !type) {
    return res.status(400).json({ error: "Missing required fields url or type." });
  }
  
  const db = await getDb();
  const newMedia = {
    id: "m_" + Math.random().toString(36).substring(2, 11),
    url,
    type,
    caption: caption || "",
    tags: tags || [],
    isFavourite: !!isFavourite,
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString()
  };
  
  db.media = db.media || [];
  db.media.unshift(newMedia);
  await saveDb(db);
  res.status(201).json(newMedia);
});

// POST /api/media/:id/like
app.post("/api/media/:id/like", async (req, res) => {
  const { id } = req.params;
  const { visitorId } = req.body;
  
  const db = await getDb();
  db.media = db.media || [];
  db.mediaLikes = db.mediaLikes || [];
  
  const itemIndex = db.media.findIndex((m: any) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Media item not found" });
  }
  
  const likeKey = `${id}_${visitorId}`;
  const likeIndex = db.mediaLikes.indexOf(likeKey);
  
  let liked = false;
  if (likeIndex === -1) {
    db.mediaLikes.push(likeKey);
    db.media[itemIndex].likesCount = (db.media[itemIndex].likesCount || 0) + 1;
    liked = true;
  } else {
    db.mediaLikes.splice(likeIndex, 1);
    db.media[itemIndex].likesCount = Math.max(0, (db.media[itemIndex].likesCount || 0) - 1);
    liked = false;
  }
  
  await saveDb(db);
  res.json({ liked, likesCount: db.media[itemIndex].likesCount });
});

// GET /api/media/:id/comments
app.get("/api/media/:id/comments", async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  db.mediaComments = db.mediaComments || [];
  const comments = db.mediaComments.filter((c: any) => c.mediaId === id);
  res.json({ comments });
});

// POST /api/media/:id/comments
app.post("/api/media/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { authorName, content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }
  
  const db = await getDb();
  db.media = db.media || [];
  db.mediaComments = db.mediaComments || [];
  
  const itemIndex = db.media.findIndex((m: any) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Media item not found." });
  }
  
  const newComment = {
    id: "c_" + Math.random().toString(36).substring(2, 11),
    mediaId: id,
    authorName: authorName || "A friend",
    content: content.slice(0, 300),
    likesCount: 0,
    createdAt: new Date().toISOString()
  };
  
  db.mediaComments.push(newComment);
  db.media[itemIndex].commentsCount = (db.media[itemIndex].commentsCount || 0) + 1;
  await saveDb(db);
  
  res.status(201).json(newComment);
});

// GET /api/messages
app.get("/api/messages", async (req, res) => {
  const db = await getDb();
  db.messages = db.messages || [];
  const sorted = [...db.messages].sort((a: any, b: any) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.likesCount || 0) - (a.likesCount || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  res.json({ messages: sorted });
});

// POST /api/messages
app.post("/api/messages", async (req, res) => {
  const { authorName, content, isSpecial } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }
  
  const db = await getDb();
  db.messages = db.messages || [];
  const newMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 11),
    authorName: authorName?.trim() || "Anonymous",
    content: content.trim().slice(0, 500),
    isSpecial: !!isSpecial,
    isPinned: false,
    likesCount: 0,
    createdAt: new Date().toISOString()
  };
  
  db.messages.unshift(newMessage);
  await saveDb(db);
  res.status(201).json(newMessage);
});

// POST /api/messages/:id/like
app.post("/api/messages/:id/like", async (req, res) => {
  const { id } = req.params;
  const { visitorId } = req.body;
  
  const db = await getDb();
  db.messages = db.messages || [];
  db.messageLikes = db.messageLikes || [];
  
  const itemIndex = db.messages.findIndex((m: any) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Message not found" });
  }
  
  const likeKey = `${id}_${visitorId}`;
  const likeIndex = db.messageLikes.indexOf(likeKey);
  
  let liked = false;
  if (likeIndex === -1) {
    db.messageLikes.push(likeKey);
    db.messages[itemIndex].likesCount = (db.messages[itemIndex].likesCount || 0) + 1;
    liked = true;
  } else {
    db.messageLikes.splice(likeIndex, 1);
    db.messages[itemIndex].likesCount = Math.max(0, (db.messages[itemIndex].likesCount || 0) - 1);
    liked = false;
  }
  
  await saveDb(db);
  res.json({ liked, likesCount: db.messages[itemIndex].likesCount });
});

// PATCH /api/messages/:id
app.patch("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { isPinned, isSpecial } = req.body;
  
  const db = await getDb();
  db.messages = db.messages || [];
  const itemIndex = db.messages.findIndex((m: any) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Message not found" });
  }
  
  if (isPinned !== undefined) db.messages[itemIndex].isPinned = !!isPinned;
  if (isSpecial !== undefined) db.messages[itemIndex].isSpecial = !!isSpecial;
  
  await saveDb(db);
  res.json(db.messages[itemIndex]);
});

// DELETE /api/messages/:id
app.delete("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  
  const db = await getDb();
  db.messages = db.messages || [];
  const initialLen = db.messages.length;
  db.messages = db.messages.filter((m: any) => m.id !== id);
  
  if (db.messages.length === initialLen) {
    return res.status(404).json({ error: "Message not found" });
  }
  
  await saveDb(db);
  res.json({ success: true });
});

// GET /api/events
app.get("/api/events", async (req, res) => {
  const db = await getDb();
  res.json({ events: db.events || [] });
});

// POST /api/events
app.post("/api/events", async (req, res) => {
  const { title, description, date, time, type, color } = req.body;
  if (!title || !date || !type) {
    return res.status(400).json({ error: "Title, date, and event type are mandatory." });
  }
  
  const db = await getDb();
  db.events = db.events || [];
  const newEvent = {
    id: "ev_" + Math.random().toString(36).substring(2, 11),
    title,
    description: description || "",
    date,
    time: time || undefined,
    type,
    color: color || "primary",
    completed: false
  };
  
  db.events.push(newEvent);
  await saveDb(db);
  res.status(201).json(newEvent);
});

// PATCH /api/events/:id
app.patch("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, type, color, completed } = req.body;
  
  const db = await getDb();
  db.events = db.events || [];
  const itemIndex = db.events.findIndex((e: any) => e.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }
  
  const target = db.events[itemIndex];
  if (title !== undefined) target.title = title;
  if (description !== undefined) target.description = description;
  if (date !== undefined) target.date = date;
  if (time !== undefined) target.time = time;
  if (type !== undefined) target.type = type;
  if (color !== undefined) target.color = color;
  if (completed !== undefined) target.completed = !!completed;
  
  await saveDb(db);
  res.json(target);
});

// DELETE /api/events/:id
app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  db.events = db.events || [];
  const initialLen = db.events.length;
  db.events = db.events.filter((e: any) => e.id !== id);
  
  if (db.events.length === initialLen) {
    return res.status(404).json({ error: "Event not found" });
  }
  
  await saveDb(db);
  res.json({ success: true });
});

// GET /api/mood
app.get("/api/mood", async (req, res) => {
  const db = await getDb();
  res.json({ settings: db.settings || {}, moodLogs: db.moodLogs || [] });
});

// POST /api/mood
app.post("/api/mood", async (req, res) => {
  const { emoji, label } = req.body;
  if (!emoji || !label) {
    return res.status(400).json({ error: "Emoji and label are required" });
  }
  
  const db = await getDb();
  db.settings = db.settings || {};
  db.moodLogs = db.moodLogs || [];
  
  db.settings.luxineMood = label;
  db.settings.luxineMoodEmoji = emoji;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const logIndex = db.moodLogs.findIndex((l: any) => l.date === todayStr);
  const newLog = {
    id: logIndex !== -1 ? db.moodLogs[logIndex].id : "mld_" + Math.random().toString(36).substring(2, 11),
    emoji,
    label,
    date: todayStr
  };
  
  if (logIndex !== -1) {
    db.moodLogs[logIndex] = newLog;
  } else {
    db.moodLogs.push(newLog);
  }
  
  await saveDb(db);
  res.json({ success: true, settings: db.settings, moodLogs: db.moodLogs });
});

// GET /api/affirmations
app.get("/api/affirmations", (req, res) => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const diff = new Date().getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const affirmationIndex = dayOfYear % AFFIRMATIONS.length;
  res.json({ affirmation: AFFIRMATIONS[affirmationIndex] });
});

// GET /api/watchlist
app.get("/api/watchlist", async (req, res) => {
  const db = await getDb();
  res.json({ watchlist: db.watchlist || [] });
});

// POST /api/watchlist
app.post("/api/watchlist", async (req, res) => {
  const { title, platform, type, status, rating, notes } = req.body;
  if (!title || !platform || !type) {
    return res.status(400).json({ error: "Title, platform, and platform type are mandatory." });
  }
  
  const db = await getDb();
  db.watchlist = db.watchlist || [];
  const newItem = {
    id: "w_" + Math.random().toString(36).substring(2, 11),
    title,
    platform,
    type,
    status: status || "want_to_watch",
    rating: Number(rating) || 5,
    notes: notes || ""
  };
  
  db.watchlist.push(newItem);
  await saveDb(db);
  res.status(201).json(newItem);
});

// PATCH /api/watchlist/:id
app.patch("/api/watchlist/:id", async (req, res) => {
  const { id } = req.params;
  const { status, rating, notes } = req.body;
  
  const db = await getDb();
  db.watchlist = db.watchlist || [];
  const itemIndex = db.watchlist.findIndex((w: any) => w.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }
  
  const target = db.watchlist[itemIndex];
  if (status !== undefined) target.status = status;
  if (rating !== undefined) target.rating = Number(rating);
  if (notes !== undefined) target.notes = notes;
  
  await saveDb(db);
  res.json(target);
});

// DELETE /api/watchlist/:id
app.delete("/api/watchlist/:id", async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  db.watchlist = db.watchlist || [];
  const initialLen = db.watchlist.length;
  db.watchlist = db.watchlist.filter((w: any) => w.id !== id);
  
  if (db.watchlist.length === initialLen) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }
  
  await saveDb(db);
  res.json({ success: true });
});

// GET /api/stories
app.get("/api/stories", async (req, res) => {
  const db = await getDb();
  res.json({ stories: db.stories || [] });
});

// POST /api/stories
app.post("/api/stories", async (req, res) => {
  const { author, content, category } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Story content is required." });
  }

  const db = await getDb();
  db.stories = db.stories || [];
  const newStory = {
    id: "story_" + Math.random().toString(36).substring(2, 11),
    author: author || "Anonymous Friend",
    content: content,
    category: category || "sweet",
    laughsCount: 1,
    omgsCount: 0,
    snapsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.stories.unshift(newStory);
  await saveDb(db);
  res.status(201).json(newStory);
});

// POST /api/stories/:id/react
app.post("/api/stories/:id/react", async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'laugh' | 'omg' | 'snap'
  if (!type || !["laugh", "omg", "snap"].includes(type)) {
    return res.status(400).json({ error: "Invalid reaction type." });
  }

  const db = await getDb();
  db.stories = db.stories || [];
  const itemIndex = db.stories.findIndex((s: any) => s.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Story not found" });
  }

  const story = db.stories[itemIndex];
  if (type === "laugh") story.laughsCount = (story.laughsCount || 0) + 1;
  else if (type === "omg") story.omgsCount = (story.omgsCount || 0) + 1;
  else if (type === "snap") story.snapsCount = (story.snapsCount || 0) + 1;

  await saveDb(db);
  res.json(story);
});

export default app;
