# AI Website UX Reviewer

## Overview

This is a full-stack AI-powered web application that analyzes a website’s user experience and generates structured UX feedback.

The app allows users to paste a website URL and receive:

- A UX score (0–100)
- 8–12 categorized UX issues
- Explanation for each issue
- Proof reference (exact text from website)
- Top 3 before/after improvements
- Last 5 saved reviews

---

## Pages

### Home Page

- Simple interface
- Enter URL
- Click "Analyze"
- Displays UX review results

### Status Page

Displays:

- Backend health
- Database connection status
- LLM connection status
- Server uptime
- Memory usage

---

## Basic Input Handling

- Alerts user if URL field is empty
- Displays error message if backend fails
- Handles invalid responses safely

---

## Tech Stack

Frontend:

- React (Vite)
- React Router
- Custom CSS

Backend:

- Node.js
- Express.js
- MongoDB (Mongoose)
- Cheerio (Web scraping)
- Groq LLM (LLaMA 3.1)

---

## How to Run

### Backend

cd server
npm install

Create `.env` using `.env.example`:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key

Run:

npm run dev

---

### Frontend

cd client
npm install
npm run dev

Frontend runs on:

http://localhost:5173

Backend runs on:

http://localhost:5000

---

## What Is Done

- UX analysis using LLM
- Categorized issues
- Proof references
- Before/After suggestions
- Last 5 review history
- System status monitoring

## What Is Not Done

- Screenshot-based proof
- Authentication system
- Export to PDF
- Production deployment configuration

---

## Author

Vikas C Sidenur
