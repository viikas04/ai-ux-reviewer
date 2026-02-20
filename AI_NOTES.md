# AI Notes

## What AI Was Used For

AI was used for:

- Generating structured UX reviews
- Categorizing issues (Clarity, Layout, Navigation, Accessibility, Trust)
- Writing explanations for each issue
- Suggesting before/after improvements

The LLM receives structured scraped website content and returns JSON-formatted UX feedback.

---

## LLM Used

- Provider: Groq
- Model: llama-3.1-8b-instant

---

## Why This LLM Was Chosen

- Fast response time
- Good structured JSON generation
- Cost-efficient
- Reliable API support

---

## What Was Verified Manually

- Backend API structure
- MongoDB integration
- Scraping logic
- JSON parsing
- Error handling
- Frontend rendering
- Status monitoring endpoint

AI generated UX insights, but all system logic and integration were implemented and tested manually.
