import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const getApiKey = (userType: string | undefined) => {
    console.log(`[Auth] Getting API key for userType: ${userType}`);
    if (userType === 'user1') {
      const key = process.env.API_KEY_USER1;
      console.log(`[Auth] User1 key found: ${!!key}`);
      return key;
    }
    if (userType === 'user2') {
      const key = process.env.API_KEY_USER2;
      console.log(`[Auth] User2 key found: ${!!key}`);
      return key;
    }
    console.log(`[Auth] No valid userType provided`);
    return null;
  };

  // API routes
  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    console.log(`[Auth] Login attempt received`);
    
    const pass1 = process.env.APP_PASSWORD_USER1;
    const pass2 = process.env.APP_PASSWORD_USER2;

    if (!pass1 || !pass2) {
      console.error("[Auth] APP_PASSWORD_USER1 or APP_PASSWORD_USER2 environment variable is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    if (password === pass1) {
      console.log(`[Auth] Login successful for user1`);
      res.json({ success: true, userType: 'user1' });
    } else if (password === pass2) {
      console.log(`[Auth] Login successful for user2`);
      res.json({ success: true, userType: 'user2' });
    } else {
      console.log(`[Auth] Login failed: Incorrect password`);
      res.status(401).json({ success: false, message: "Incorrect password" });
    }
  });

  // Proxy endpoints for Gemini API
  app.post("/api/proxy/generateContent", async (req, res) => {
    const userType = req.headers['x-user-type'] as string;
    console.log(`[Proxy] generateContent request for userType: ${userType}`);
    const apiKey = getApiKey(userType);
    if (!apiKey) {
      console.error(`[Proxy] Unauthorized: No API key for userType ${userType}`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      console.log(`[Proxy] Calling generateContent with model: ${req.body.model}`);
      const response = await ai.models.generateContent(req.body);
      console.log(`[Proxy] generateContent success. Candidates: ${response.candidates?.length || 0}`);
      res.json(response);
    } catch (error: any) {
      console.error(`[Proxy] generateContent error:`, error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.post("/api/proxy/generateImages", async (req, res) => {
    const userType = req.headers['x-user-type'] as string;
    console.log(`[Proxy] generateImages request for userType: ${userType}`);
    const apiKey = getApiKey(userType);
    if (!apiKey) {
      console.error(`[Proxy] Unauthorized: No API key for userType ${userType}`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      console.log(`[Proxy] Calling generateImages with model: ${req.body.model}`);
      const response = await ai.models.generateImages(req.body);
      console.log(`[Proxy] generateImages success. Images: ${response.generatedImages?.length || 0}`);
      res.json(response);
    } catch (error: any) {
      console.error(`[Proxy] generateImages error:`, error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.post("/api/proxy/generateVideos", async (req, res) => {
    const userType = req.headers['x-user-type'] as string;
    const apiKey = getApiKey(userType);
    if (!apiKey) return res.status(401).json({ error: "Unauthorized" });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const operation = await ai.models.generateVideos(req.body);
      res.json(operation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/proxy/getVideosOperation", async (req, res) => {
    const userType = req.headers['x-user-type'] as string;
    const apiKey = getApiKey(userType);
    if (!apiKey) return res.status(401).json({ error: "Unauthorized" });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const operation = await ai.operations.getVideosOperation(req.body);
      res.json(operation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/proxy/fetchVideo", async (req, res) => {
    const userType = req.query.userType as string;
    const videoUri = req.query.uri as string;
    const apiKey = getApiKey(userType);
    if (!apiKey) return res.status(401).json({ error: "Unauthorized" });

    try {
      const response = await fetch(`${videoUri}&key=${apiKey}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.setHeader('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
