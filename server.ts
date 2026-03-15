import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "games.json");
const GAMES_DIR = path.join(process.cwd(), "games");
const SOCIAL_FILE = path.join(process.cwd(), "social.json");
const STATS_FILE = path.join(process.cwd(), "stats.json");

async function loadStats() {
    try {
        const data = await fs.readFile(STATS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return { litCount: 1234 }; // Default starting number
    }
}

async function saveStats(stats: any) {
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
}

async function ensureGamesDir() {
    try {
        await fs.access(GAMES_DIR);
    } catch {
        await fs.mkdir(GAMES_DIR, { recursive: true });
    }
}

async function loadGames() {
    await ensureGamesDir();
    try {
        const files = await fs.readdir(GAMES_DIR);
        const games = [];
        for (const file of files) {
            if (file.endsWith(".json")) {
                try {
                    const data = await fs.readFile(path.join(GAMES_DIR, file), "utf-8");
                    games.push(JSON.parse(data));
                } catch (e) {
                    console.error(`Error loading game file ${file}:`, e);
                }
            }
        }
        
        // Migration: If games.json exists and games/ is empty, migrate
        if (games.length === 0) {
            try {
                const data = await fs.readFile(DATA_FILE, "utf-8");
                const legacyGames = JSON.parse(data);
                if (Array.isArray(legacyGames) && legacyGames.length > 0) {
                    console.log(`Migrating ${legacyGames.length} games to individual files...`);
                    for (const g of legacyGames) {
                        await saveGameById(g);
                    }
                    return legacyGames;
                }
            } catch (e) {
                // No legacy file or error reading it
            }
        }
        
        return games;
    } catch (error) {
        console.error("Error loading games:", error);
        return [];
    }
}

async function saveGameById(game: any) {
    await ensureGamesDir();
    const filePath = path.join(GAMES_DIR, `${game.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(game, null, 2));
}

async function saveGames(games: any[]) {
    // This is now mostly for migration or bulk updates
    for (const game of games) {
        await saveGameById(game);
    }
}

async function loadSocial() {
    try {
        const data = await fs.readFile(SOCIAL_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return { friendRequests: [], follows: [], messages: [] };
    }
}

async function saveSocial(social: any) {
    await fs.writeFile(SOCIAL_FILE, JSON.stringify(social, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' })); // Increase limit for large game data (images)

  // API Routes
  app.get("/api/games", async (req, res) => {
    console.log("GET /api/games");
    const games = await loadGames();
    res.json(games);
  });

  app.post("/api/games", async (req, res) => {
    console.log("POST /api/games");
    const game = req.body;
    if (!game.id) return res.status(400).json({ error: "Missing game id" });
    await saveGameById(game);
    res.json({ success: true });
  });

  app.delete("/api/games/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await fs.unlink(path.join(GAMES_DIR, `${id}.json`));
    } catch (e) {
        console.error(`Error deleting game ${id}:`, e);
    }
    res.json({ success: true });
  });

  app.put("/api/games/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const filePath = path.join(GAMES_DIR, `${id}.json`);
        const data = await fs.readFile(filePath, "utf-8");
        const game = JSON.parse(data);
        game.status = status;
        await saveGameById(game);
        res.json({ success: true });
    } catch (e) {
        res.status(404).json({ error: "Game not found" });
    }
  });

  app.put("/api/games/:id/recommend", async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = path.join(GAMES_DIR, `${id}.json`);
        const data = await fs.readFile(filePath, "utf-8");
        const game = JSON.parse(data);
        game.isRecommended = !game.isRecommended;
        await saveGameById(game);
        res.json({ success: true });
    } catch (e) {
        res.status(404).json({ error: "Game not found" });
    }
  });

  // Social API Routes
  app.post("/api/friends/request", async (req, res) => {
    const { senderId, receiverId } = req.body;
    const social = await loadSocial();
    social.friendRequests.push({ id: `fr_${Date.now()}`, senderId, receiverId, status: 'pending', createdAt: new Date().toISOString() });
    await saveSocial(social);
    res.json({ success: true });
  });

  app.post("/api/follow", async (req, res) => {
    const { followerId, followingId } = req.body;
    const social = await loadSocial();
    social.follows.push({ followerId, followingId, createdAt: new Date().toISOString() });
    await saveSocial(social);
    res.json({ success: true });
  });

  app.post("/api/messages/send", async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    
    // Simple profanity filter
    const badWords = ['辱罵', '髒話', 'badword'];
    const filteredContent = badWords.reduce((text, word) => text.replace(new RegExp(word, 'gi'), '***'), content);
    
    const social = await loadSocial();
    social.messages.push({ id: `msg_${Date.now()}`, senderId, receiverId, content: filteredContent, createdAt: new Date().toISOString(), isRead: false });
    await saveSocial(social);
    res.json({ success: true, content: filteredContent });
  });

  app.get("/api/messages/:userId", async (req, res) => {
    const { userId } = req.params;
    const social = await loadSocial();
    const messages = social.messages.filter((m: any) => m.receiverId === userId);
    res.json(messages);
  });

  // Creator Revenue API
  app.post("/api/creator/withdraw", async (req, res) => {
    const { userId, amount } = req.body;
    // In a real app, this would interact with a payment gateway
    console.log(`Withdrawal request: User ${userId}, Amount ${amount}`);
    res.json({ success: true, message: "提領申請已送出" });
  });

  app.post("/api/games/:id/reviews", async (req, res) => {
    const { id } = req.params;
    const review = req.body;
    const games = await loadGames();
    const game = games.find((g: any) => g.id === id);
    if (game) {
        if (!game.reviews) game.reviews = [];
        game.reviews.unshift(review);
        // Recalculate average rating
        const totalRating = game.reviews.reduce((acc: any, r: any) => acc + r.rating, 0);
        game.rating = totalRating / game.reviews.length;
        await saveGames(games);
    }
    res.json({ success: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Translation API Routes
  app.get("/api/locales", async (req, res) => {
    const localesDir = path.join(process.cwd(), "src", "locales");
    try {
      const files = await fs.readdir(localesDir);
      const locales = files.filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""));
      res.json(locales);
    } catch (e) {
      res.status(500).json({ error: "Failed to read locales" });
    }
  });

  app.get("/api/locales/:lng", async (req, res) => {
    const { lng } = req.params;
    const filePath = path.join(process.cwd(), "src", "locales", `${lng}.json`);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(404).json({ error: "Locale not found" });
    }
  });

  app.post("/api/locales/:lng", async (req, res) => {
    const { lng } = req.params;
    const translations = req.body;
    const filePath = path.join(process.cwd(), "src", "locales", `${lng}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(translations, null, 2));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to save translations" });
    }
  });

  app.get("/api/stats/lit", async (req, res) => {
    const stats = await loadStats();
    res.json(stats);
  });

  app.get("/api/v1/stars", async (req, res) => {
    console.log("GET /api/v1/stars called");
    const stats = await loadStats();
    console.log("Stats loaded:", stats);
    res.json(stats.stars || []);
  });

  app.post("/api/stats/lit/increment", async (req, res) => {
    const { city, lat, lng, userId } = req.body;
    const stats = await loadStats();
    stats.litCount = (stats.litCount || 0) + 1;
    
    if (!stats.stars) stats.stars = [];
    stats.stars.push({
        id: `star_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        city: city || "未知城市",
        lat: lat || 0,
        lng: lng || 0,
        userId: userId || "anonymous",
        timestamp: new Date().toISOString()
    });

    await saveStats(stats);
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production (if needed, but usually handled by platform/nginx)
    // The platform handles static files via nginx usually, but let's add fallback just in case
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
