import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

app.use(express.json());

function cleanLegacyData(db: any) {
  if (!db) return { db, modified: false };
  let modified = false;

  // Clear legacy mock media
  if (db.media && Array.isArray(db.media)) {
    const originalLen = db.media.length;
    db.media = db.media.filter((m: any) => !["m1", "m2", "m3"].includes(m.id));
    if (db.media.length !== originalLen) modified = true;
  }

  // Clear legacy mock comments
  if (db.mediaComments && Array.isArray(db.mediaComments)) {
    const originalLen = db.mediaComments.length;
    db.mediaComments = db.mediaComments.filter(
      (c: any) => !["c1", "c2", "c3"].includes(c.id) && !["m1", "m2", "m3"].includes(c.mediaId)
    );
    if (db.mediaComments.length !== originalLen) modified = true;
  }

  // Clear legacy mock messages
  if (db.messages && Array.isArray(db.messages)) {
    const originalLen = db.messages.length;
    db.messages = db.messages.filter((m: any) => !["msg1", "msg2", "msg3", "msg4", "msg5"].includes(m.id));
    if (db.messages.length !== originalLen) modified = true;
  }

  // Clear legacy mock events
  if (db.events && Array.isArray(db.events)) {
    const originalLen = db.events.length;
    db.events = db.events.filter((e: any) => !["ev1", "ev2", "ev3", "ev4", "ev5"].includes(e.id));
    if (db.events.length !== originalLen) modified = true;
  }

  // Clear watchlist items (deprecated)
  if (db.watchlist && Array.isArray(db.watchlist)) {
    if (db.watchlist.length > 0) {
      db.watchlist = [];
      modified = true;
    }
  }

  return { db, modified };
}

// Helpers to read/write persistent JSON DB
function readDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(data);
      const { db: cleaned, modified } = cleanLegacyData(parsed);
      if (modified) {
        try { fs.writeFileSync(DB_PATH, JSON.stringify(cleaned, null, 2), "utf-8"); } catch {}
      }
      return cleaned;
    }
  } catch (err) {
    console.error("Error reading db.json, falling back to empty database", err);
  }
  return { settings: {}, media: [], mediaComments: [], mediaLikes: [], messages: [], messageLikes: [], events: [], moodLogs: [], watchlist: [], stories: [] };
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to db.json", err);
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
  // We allow "luxine" or "1234" to correspond with the visual guidelines and original mockup
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
app.get("/api/media", (req, res) => {
  const db = readDb();
  res.json({ media: db.media });
});

// POST /api/media (Admin or anyone can post in development sandbox!)
app.post("/api/media", (req, res) => {
  const { url, type, caption, tags, isFavourite } = req.body;
  
  if (!url || !type) {
    return res.status(400).json({ error: "Missing required fields url or type." });
  }
  
  const db = readDb();
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
  
  db.media.unshift(newMedia);
  writeDb(db);
  res.status(201).json(newMedia);
});

// POST /api/media/:id/like
app.post("/api/media/:id/like", (req, res) => {
  const { id } = req.params;
  const { visitorId } = req.body;
  
  const db = readDb();
  const itemIndex = db.media.findIndex((m: any) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Media item not found" });
  }
  
  const likeKey = `${id}_${visitorId}`;
  const likeIndex = db.mediaLikes.indexOf(likeKey);
  
  let liked = false;
  if (likeIndex === -1) {
    db.mediaLikes.push(likeKey);
    db.media[itemIndex].likesCount += 1;
    liked = true;
  } else {
    db.mediaLikes.splice(likeIndex, 1);
    db.media[itemIndex].likesCount = Math.max(0, db.media[itemIndex].likesCount - 1);
    liked = false;
  }
  
  writeDb(db);
  res.json({ liked, likesCount: db.media[itemIndex].likesCount });
});

// GET /api/media/:id/comments
app.get("/api/media/:id/comments", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const comments = db.mediaComments.filter((c: any) => c.mediaId === id);
  res.json({ comments });
});

// POST /api/media/:id/comments
app.post("/api/media/:id/comments", (req, res) => {
  const { id } = req.params;
  const { authorName, content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }
  
  const db = readDb();
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
  db.media[itemIndex].commentsCount += 1;
  writeDb(db);
  
  res.status(201).json(newComment);
});

// GET /api/messages
app.get("/api/messages", (req, res) => {
  const db = readDb();
  // Sorting: Pinned messages always at top, then sort by likes count combined with recency
  const sorted = [...db.messages].sort((a: any, b: any) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.likesCount - a.likesCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  res.json({ messages: sorted });
});

// POST /api/messages
app.post("/api/messages", (req, res) => {
  const { authorName, content, isSpecial } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }
  
  const db = readDb();
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
  writeDb(db);
  res.status(201).json(newMessage);
});

// POST /api/messages/:id/like
app.post("/api/messages/:id/like", (req, res) => {
  const { id } = req.params;
  const { visitorId } = req.body;
  
  const db = readDb();
  const itemIndex = db.messages.findIndex((m: any) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Message not found" });
  }
  
  const likeKey = `${id}_${visitorId}`;
  const likeIndex = db.messageLikes.indexOf(likeKey);
  
  let liked = false;
  if (likeIndex === -1) {
    db.messageLikes.push(likeKey);
    db.messages[itemIndex].likesCount += 1;
    liked = true;
  } else {
    db.messageLikes.splice(likeIndex, 1);
    db.messages[itemIndex].likesCount = Math.max(0, db.messages[itemIndex].likesCount - 1);
    liked = false;
  }
  
  writeDb(db);
  res.json({ liked, likesCount: db.messages[itemIndex].likesCount });
});

// PATCH /api/messages/:id (Admin pins/special status toggle)
app.patch("/api/messages/:id", (req, res) => {
  const { id } = req.params;
  const { isPinned, isSpecial } = req.body;
  
  const db = readDb();
  const itemIndex = db.messages.findIndex((m: any) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Message not found" });
  }
  
  if (isPinned !== undefined) db.messages[itemIndex].isPinned = !!isPinned;
  if (isSpecial !== undefined) db.messages[itemIndex].isSpecial = !!isSpecial;
  
  writeDb(db);
  res.json(db.messages[itemIndex]);
});

// DELETE /api/messages/:id (Admin delete)
app.delete("/api/messages/:id", (req, res) => {
  const { id } = req.params;
  
  const db = readDb();
  const initialLen = db.messages.length;
  db.messages = db.messages.filter((m: any) => m.id !== id);
  
  if (db.messages.length === initialLen) {
    return res.status(404).json({ error: "Message not found" });
  }
  
  writeDb(db);
  res.json({ success: true });
});

// GET /api/events
app.get("/api/events", (req, res) => {
  const db = readDb();
  res.json({ events: db.events });
});

// POST /api/events
app.post("/api/events", (req, res) => {
  const { title, description, date, time, type, color } = req.body;
  if (!title || !date || !type) {
    return res.status(400).json({ error: "Title, date, and event type are mandatory." });
  }
  
  const db = readDb();
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
  writeDb(db);
  res.status(201).json(newEvent);
});

// PATCH /api/events/:id
app.patch("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, type, color, completed } = req.body;
  
  const db = readDb();
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
  
  writeDb(db);
  res.json(target);
});

// DELETE /api/events/:id
app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLen = db.events.length;
  db.events = db.events.filter((e: any) => e.id !== id);
  
  if (db.events.length === initialLen) {
    return res.status(404).json({ error: "Event not found" });
  }
  
  writeDb(db);
  res.json({ success: true });
});

// GET /api/mood
app.get("/api/mood", (req, res) => {
  const db = readDb();
  res.json({ settings: db.settings, moodLogs: db.moodLogs });
});

// POST /api/mood
app.post("/api/mood", (req, res) => {
  const { emoji, label } = req.body;
  if (!emoji || !label) {
    return res.status(400).json({ error: "Emoji and label are required" });
  }
  
  const db = readDb();
  
  // Update Settings
  db.settings.luxineMood = label;
  db.settings.luxineMoodEmoji = emoji;
  
  // Track in logs for today
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
  
  writeDb(db);
  res.json({ success: true, settings: db.settings, moodLogs: db.moodLogs });
});

// GET /api/affirmations
app.get("/api/affirmations", (req, res) => {
  // Return deterministic daily affirmation based on the day of the year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const diff = new Date().getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const affirmationIndex = dayOfYear % AFFIRMATIONS.length;
  res.json({ affirmation: AFFIRMATIONS[affirmationIndex] });
});

// GET /api/watchlist
app.get("/api/watchlist", (req, res) => {
  const db = readDb();
  res.json({ watchlist: db.watchlist });
});

// POST /api/watchlist
app.post("/api/watchlist", (req, res) => {
  const { title, platform, type, status, rating, notes } = req.body;
  if (!title || !platform || !type) {
    return res.status(400).json({ error: "Title, platform, and platform type are mandatory." });
  }
  
  const db = readDb();
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
  writeDb(db);
  res.status(201).json(newItem);
});

// PATCH /api/watchlist/:id
app.patch("/api/watchlist/:id", (req, res) => {
  const { id } = req.params;
  const { status, rating, notes } = req.body;
  
  const db = readDb();
  const itemIndex = db.watchlist.findIndex((w: any) => w.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }
  
  const target = db.watchlist[itemIndex];
  if (status !== undefined) target.status = status;
  if (rating !== undefined) target.rating = Number(rating);
  if (notes !== undefined) target.notes = notes;
  
  writeDb(db);
  res.json(target);
});

// DELETE /api/watchlist/:id
app.delete("/api/watchlist/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLen = db.watchlist.length;
  db.watchlist = db.watchlist.filter((w: any) => w.id !== id);
  
  if (db.watchlist.length === initialLen) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }
  
  writeDb(db);
  res.json({ success: true });
});

// GET /api/stories
app.get("/api/stories", (req, res) => {
  const db = readDb();
  res.json({ stories: db.stories || [] });
});

// POST /api/stories
app.post("/api/stories", (req, res) => {
  const { author, content, category } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Story content is required." });
  }

  const db = readDb();
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
  writeDb(db);
  res.status(201).json(newStory);
});

// POST /api/stories/:id/react
app.post("/api/stories/:id/react", (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'laugh' | 'omg' | 'snap'
  if (!type || !["laugh", "omg", "snap"].includes(type)) {
    return res.status(400).json({ error: "Invalid reaction type." });
  }

  const db = readDb();
  db.stories = db.stories || [];
  const itemIndex = db.stories.findIndex((s: any) => s.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Story not found" });
  }

  const story = db.stories[itemIndex];
  if (type === "laugh") story.laughsCount = (story.laughsCount || 0) + 1;
  else if (type === "omg") story.omgsCount = (story.omgsCount || 0) + 1;
  else if (type === "snap") story.snapsCount = (story.snapsCount || 0) + 1;

  writeDb(db);
  res.json(story);
});

// Server boot function handling dev middleware and static build fallback
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite development server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Vite dev server mounted as Express middleware");
  } else {
    // Dist bundle production serve
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Full-stack server running successfully on http://0.0.0.0:${PORT}`);
  });
}

serveApp().catch((err) => {
  console.error("Critical server failure on boot:", err);
});
