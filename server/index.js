import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import OpenAI from "openai";
import { scrapeWebsite } from "./services/scraperService.js";
import Review from "./models/Review.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */

let dbStatus = "Disconnected";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    dbStatus = "Connected";
    console.log("MongoDB Connected ✅");
  })
  .catch((error) => {
    dbStatus = "Error";
    console.log("MongoDB Connection Failed ❌", error.message);
  });

/* =========================
   GROQ LLM CONNECTION
========================= */

let llmStatus = "Disconnected";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function checkLLM() {
  try {
    await groq.models.list();
    llmStatus = "Connected";
    console.log("Groq LLM Connected ✅");
  } catch (error) {
    llmStatus = "Error";
    console.log("Groq LLM Connection Failed ❌", error.message);
  }
}

checkLLM();

/* =========================
   HEALTH ENDPOINT
========================= */

app.get("/health", (req, res) => {
  res.json({
    backend: "Running",
    uptime: process.uptime(),
    database: dbStatus,
    llm: llmStatus,
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
});

/* =========================
   ANALYZE ENDPOINT
========================= */

app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Step 1: Scrape website
    const scrapedData = await scrapeWebsite(url);

    const contentForAI = `
Title: ${scrapedData.title}

Headings:
${scrapedData.headings.join("\n")}

Buttons:
${scrapedData.buttons.join("\n")}

Links:
${scrapedData.links?.join("\n") || ""}

Paragraphs:
${scrapedData.paragraphs.join("\n")}
`;

    // Step 2: Call Groq LLM
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a senior UX auditor.

Respond ONLY in valid JSON.

IMPORTANT:
- "category" must be EXACTLY one of:
  "Clarity",
  "Layout",
  "Navigation",
  "Accessibility",
  "Trust"

- "severity" must be EXACTLY one of:
  "Low",
  "Medium",
  "High"

Return JSON in this format:

{
  "ux_score": number,
  "issues": [
    {
      "category": "Clarity",
      "issue": "short title",
      "severity": "Low",
      "why": "why it is a problem",
      "proof": "exact text reference"
    }
  ],
  "top_fixes": [
    {
      "issue": "issue title",
      "before": "current situation",
      "after": "improved version"
    }
  ]
}
          `,
        },
        {
          role: "user",
          content: contentForAI,
        },
      ],
      temperature: 0.3,
    });

    // Step 3: Clean markdown wrapper if exists
    let rawContent = completion.choices[0].message.content;

    rawContent = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedReview;

    try {
      parsedReview = JSON.parse(rawContent);
    } catch (err) {
      return res.status(500).json({
        error: "LLM returned invalid JSON format.",
        rawResponse: rawContent,
      });
    }

    // Step 4: Save to database
    await Review.create({
      url,
      score: parsedReview.ux_score,
      review: parsedReview,
    });

    // Keep only last 5 reviews
    const count = await Review.countDocuments();
    if (count > 5) {
      const oldest = await Review.findOne().sort({ createdAt: 1 });
      await Review.findByIdAndDelete(oldest._id);
    }

    // Step 5: Return structured response
    res.json({
      scrapedData,
      review: parsedReview,
    });

  } catch (error) {
    console.error("ANALYZE ERROR:", error.message);
    res.status(500).json({
      error: "Something went wrong while analyzing.",
    });
  }
});

/* =========================
   GET LAST 5 REVIEWS
========================= */

app.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch reviews",
    });
  }
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});