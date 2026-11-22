import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  generateProfessionalMessage,
  MESSAGE_TYPES,
  type MessageType,
  type Platform,
} from "./server/ai.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "ProWrite AI" });
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { messageType, recipient, keyPoints, platform, variation } =
        req.body ?? {};

      if (
        typeof messageType !== "string" ||
        !MESSAGE_TYPES.includes(messageType as MessageType)
      ) {
        res.status(400).json({
          error: "Please select a valid Message Type.",
        });
        return;
      }

      if (typeof recipient !== "string" || recipient.trim().length < 2) {
        res.status(400).json({
          error: "Please enter who this message is for.",
        });
        return;
      }

      if (typeof keyPoints !== "string" || keyPoints.trim().length < 5) {
        res.status(400).json({
          error: "Please enter 2–3 key points to include in your message.",
        });
        return;
      }

      if (platform !== "Email" && platform !== "LinkedIn") {
        res.status(400).json({
          error: "Platform must be either Email or LinkedIn.",
        });
        return;
      }

      const result = await generateProfessionalMessage({
        messageType: messageType as MessageType,
        recipient: recipient.trim(),
        keyPoints: keyPoints.trim(),
        platform: platform as Platform,
        variation: typeof variation === "number" ? variation : 0,
      });

      res.json(result);
    } catch (error) {
      console.error("Error generating message:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate message right now. Please try again.";
      const statusCode = message.includes("GEMINI_API_KEY") ? 500 : 502;
      res.status(statusCode).json({ error: message });
    }
  });

  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, "dist");

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ProWrite AI server running at http://localhost:${PORT}`);
  });
}

startServer();
