import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

import fs from "fs/promises";
import fsSync from "fs";

dotenv.config();

const app = express();
const PORT = 3000;
const STATE_FILE = path.join(process.cwd(), "state.json");
const PERSISTENCE_LIMIT_MB = 10;

app.use(express.json({ limit: '50mb' }));

// Helper to get file size
const getFileSize = async (filePath: string) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
};

// API ROUTES
app.get("/api/state", async (req, res) => {
  try {
    if (fsSync.existsSync(STATE_FILE)) {
      const data = await fs.readFile(STATE_FILE, "utf-8");
      const size = await getFileSize(STATE_FILE);
      const state = JSON.parse(data);
      
      res.json({
        state,
        status: {
          last_save: state.parameters?.last_update || new Date().toISOString(),
          record_count: (state.results?.length || 0) + (state.suggestions?.length || 0),
          file_size_bytes: size,
          usage_percent: (size / (PERSISTENCE_LIMIT_MB * 1024 * 1024)) * 100,
          limit_mb: PERSISTENCE_LIMIT_MB
        }
      });
    } else {
      const initialState = {
        results: [],
        suggestions: [],
        parameters: {
          maturity: 0,
          last_update: new Date().toISOString(),
          persistence_limit_mb: PERSISTENCE_LIMIT_MB
        }
      };
      res.json({
        state: initialState,
        status: {
          last_save: "Never",
          record_count: 0,
          file_size_bytes: 0,
          usage_percent: 0,
          limit_mb: PERSISTENCE_LIMIT_MB
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/state", async (req, res) => {
  try {
    const state = req.body;
    state.parameters.last_update = new Date().toISOString();
    
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    const size = await getFileSize(STATE_FILE);
    
    res.json({
      success: true,
      status: {
        last_save: state.parameters.last_update,
        record_count: (state.results?.length || 0) + (state.suggestions?.length || 0),
        file_size_bytes: size,
        usage_percent: (size / (PERSISTENCE_LIMIT_MB * 1024 * 1024)) * 100,
        limit_mb: PERSISTENCE_LIMIT_MB
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MiroFish Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
