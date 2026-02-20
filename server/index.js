import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Groq from "groq-sdk";

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
   Groq Setup
============================ */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

console.log("Groq LLM Connected ✅");

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

Return JSON in this exact format:

{
  "score": number (0-100),
  "issues": [
    {
      "category": "Clarity | Layout | Navigation | Accessibility | Trust",
      "issue": "Short title",
      "severity": "Low | Medium | High",
      "why": "Short explanation",
      "proof": "Exact text or element reference"
    }
  ],
  "top_fixes": [
    {
      "issue": "Issue title",
      "before": "Current state",
      "after": "Improved version"
    }
  ]
}

Provide 8-12 issues grouped across categories.
Be specific and realistic.
`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are a strict UX auditor. Return ONLY valid JSON. No explanations outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;

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
    res.status(500).json({ error: "Something went wrong" });
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