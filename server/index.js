import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ============================
   PORT (Render compatible)
============================ */
const PORT = process.env.PORT || 5000;

/* ============================
   MongoDB Connection
============================ */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Error:", err));

/* ============================
   Gemini Setup
============================ */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log("Gemini LLM Connected ✅");

/* ============================
   Retry wrapper — Gemini's free tier occasionally
   returns a transient 503 "high demand" error.
   Retry with increasing delays before giving up.
============================ */
async function generateWithRetry(request, retries = 3, baseDelayMs = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (err) {
      const isOverloaded = err?.status === 503;
      const isLastAttempt = attempt === retries;
      if (!isOverloaded || isLastAttempt) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)));
    }
  }
}

/* ============================
   Mongoose Schema
============================ */
const reviewSchema = new mongoose.Schema(
  {
    url: String,
    score: Number,
    review: Object,
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

/* ============================
   JSON schema Gemini must follow
============================ */
const auditSchema = {
  type: "object",
  properties: {
    score: { type: "number" },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          issue: { type: "string" },
          severity: { type: "string" },
          why: { type: "string" },
          proof: { type: "string" },
        },
        required: ["category", "issue", "severity", "why", "proof"],
      },
    },
    top_fixes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          before: { type: "string" },
          after: { type: "string" },
        },
        required: ["issue", "before", "after"],
      },
    },
  },
  required: ["score", "issues", "top_fixes"],
};

/* ============================
   STATUS ROUTE
============================ */
app.get("/status", (req, res) => {
  res.json({
    backend: "Running",
    database: "Connected",
    llm: "Connected",
  });
});

/* ============================
   ANALYZE ROUTE
============================ */
app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const prompt = `
You are a professional UX auditor.

Analyze this website URL:
${url}

Provide 8-12 issues grouped across these categories: Clarity, Layout,
Navigation, Accessibility, Trust. Severity must be Low, Medium, or High.
Be specific and realistic. Score the site 0-100.
`;

    const response = await generateWithRetry({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a strict UX auditor. Return only the structured audit — no commentary.",
        responseMimeType: "application/json",
        responseSchema: auditSchema,
      },
    });

    const content = response.text;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return res.status(500).json({
        error: "Invalid JSON returned from LLM",
        raw: content,
      });
    }

    const newReview = await Review.create({
      url,
      score: parsed.score,
      review: {
        issues: parsed.issues,
        top_fixes: parsed.top_fixes,
      },
    });

    res.json(newReview);
  } catch (error) {
    console.error(error);
    const isOverloaded = error?.status === 503;
    res.status(500).json({
      error: isOverloaded
        ? "The AI model is busy right now. Please try again in a few seconds."
        : "Something went wrong",
    });
  }
});

/* ============================
   LAST 5 REVIEWS
============================ */
app.get("/reviews", async (req, res) => {
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(reviews);
});

/* ============================
   START SERVER
============================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});