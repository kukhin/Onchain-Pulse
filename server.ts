import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: "vitalik.base", score: 100 },
    { rank: 2, name: "jesse.base", score: 85 },
    { rank: 3, name: "brian.base", score: 72 },
    { rank: 4, name: "degen.base", score: 45 },
    { rank: 5, name: "vibe.base", score: 30 },
  ];

  // API Routes
  app.get("/api/leaderboard", (req, res) => {
    res.json(leaderboard);
  });

  app.post("/api/pulse", (req, res) => {
    const { address } = req.body;
    console.log(`Pulse received from ${address}`);
    res.json({ success: true, message: "Pulse recorded!" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
