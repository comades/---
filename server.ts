import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "games.json");

async function loadGames() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveGames(games: any[]) {
    await fs.writeFile(DATA_FILE, JSON.stringify(games, null, 2));
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
    const games = await loadGames();
    const index = games.findIndex((g: any) => g.id === game.id);
    if (index >= 0) {
        games[index] = game;
    } else {
        games.push(game);
    }
    await saveGames(games);
    res.json({ success: true });
  });

  app.delete("/api/games/:id", async (req, res) => {
    const { id } = req.params;
    let games = await loadGames();
    games = games.filter((g: any) => g.id !== id);
    await saveGames(games);
    res.json({ success: true });
  });

  app.put("/api/games/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const games = await loadGames();
    const game = games.find((g: any) => g.id === id);
    if (game) {
        game.status = status;
        await saveGames(games);
    }
    res.json({ success: true });
  });

  app.put("/api/games/:id/recommend", async (req, res) => {
    const { id } = req.params;
    const games = await loadGames();
    const game = games.find((g: any) => g.id === id);
    if (game) {
        game.isRecommended = !game.isRecommended;
        await saveGames(games);
    }
    res.json({ success: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
