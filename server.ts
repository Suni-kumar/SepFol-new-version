import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API route for generating flashcards using Gemini API
  app.post("/api/generate-flashcards", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
      }

      const { topic, count = 45 } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic or text is required." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert tutor creating study flashcards.
Create exactly ${count} flashcards for the following topic or text: "${topic}".
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
      if (rawJson.startsWith("```json")) {
        rawJson = rawJson.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (rawJson.startsWith("```")) {
        rawJson = rawJson.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const cards = JSON.parse(rawJson);
      res.json({ cards });
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({ error: error.message || "Failed to generate flashcards" });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
