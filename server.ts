import express from "express";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Rate Limiting to prevent spam/abuse
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per window
    message: { error: "Too many requests from this IP, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 2. Strict CORS & Payload Limits
  app.use(cors({
    origin: '*', // For native capacitor apps, origin may vary.
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: "50kb" })); // Prevent huge payloads

  // Apply rate limiter to API routes
  app.use("/api/", apiLimiter);

  // API route for generating flashcards using Gemini API
  app.post("/api/generate-flashcards", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is missing in backend environment.");
        return res.status(500).json({ error: "Internal Server Error" }); // Hide internal details
      }

      const { topic, count = 45 } = req.body;
      
      // 3. Strict Input Validation
      if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return res.status(400).json({ error: "Topic or text is required." });
      }
      
      if (topic.length > 3000) {
        return res.status(400).json({ error: "Topic text is too long (Max 3000 chars)." });
      }
      
      // Sanitize count
      const safeCount = Math.min(Math.max(Number(count) || 15, 1), 100);

      const ai = new GoogleGenAI({ apiKey });
            
      const prompt = `You are an expert tutor creating study flashcards.
Create exactly ${safeCount} flashcards for the following topic or text: "${topic.replace(/"/g, '\\"')}".
Each flashcard must have a concise question (front) and a clear, bulleted answer if appropriate (back).
Respond strictly with a JSON array of objects, where each object has "front" (string) and "back" (string).
Do not include markdown code block formatting in your output, just the raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (!response.text) { 
        throw new Error("No response from Gemini API");
      }

      let rawJson = response.text;
      if (rawJson.startsWith("\`\`\`json")) {
        rawJson = rawJson.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
      } else if (rawJson.startsWith("\`\`\`")) {
        rawJson = rawJson.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
      }

      const cards = JSON.parse(rawJson);
      res.json({ cards });

    } catch (error: any) {
      // 4. Secure Error Handling: Do not leak stack traces to the client
      console.error("Server Side Error generating flashcards:", error.message || error);
      res.status(500).json({ error: "An unexpected server error occurred while generating flashcards." });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
