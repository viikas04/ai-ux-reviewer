# AI Website UX Reviewer

## Overview

A full-stack AI-powered web application that analyzes a website's user experience and generates structured UX feedback.

The app allows users to paste a website URL and receive:

- A UX score (0–100)
- 8–12 categorized UX issues, each with a severity level and cited proof
- Before/after fix recommendations
- Last 5 saved reviews, with history of past audits

---

## Pages

### Home Page

- Paste a URL and get a graded UX audit
- Score rendered as an animated SVG gauge
- Issues filterable by severity (All / High / Medium / Low)
- Before/after comparison cards for top fixes
- Recent audit history with score, domain, and issue count

### Status Page

- Live backend, database, and LLM connection status
- Manual refresh with last-checked timestamp

---

## Tech Stack

**Frontend:**

- React (Vite)
- React Router
- Custom CSS (design-token based styling)

**Backend:**

- Node.js
- Express.js
- MongoDB (Mongoose)
- Google Gemini API (schema-enforced structured JSON output)

**Security:**

- CORS origin restriction
- Per-IP rate limiting (express-rate-limit)
- HTTP header hardening (Helmet)
- Input validation on all public endpoints

---

## How to Run

### Backend

```
cd server
npm install
```

Create `.env` using `.env.example`:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Run:

```
npm run dev
```

### Frontend

```
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

---

## What Is Done

- UX analysis using Gemini with schema-enforced JSON output
- Categorized, severity-filterable issues with cited proof
- Before/after fix suggestions
- Last 5 review history
- Live system status monitoring
- Backend security hardening (CORS, rate limiting, input validation, Helmet)

## What Is Not Done

- Screenshot-based proof
- Authentication system
- Export to PDF
- Real page scraping (the LLM analyzes the URL directly, without fetching live page content)

---

## Author

Vikas C Sidenur

Live app: [ai-ux-reviewer.vercel.app](https://ai-ux-reviewer.vercel.app)
