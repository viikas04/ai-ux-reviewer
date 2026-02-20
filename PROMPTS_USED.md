# Prompts Used

## 1. UX Analysis Prompt

System Prompt:
"You are a UX expert. Analyze the website content and provide a structured UX review."

User Prompt:
Analyze the following website content and provide:

1. UX Score (0–100)
2. 8–12 UX issues grouped by category:
   - Clarity
   - Layout
   - Navigation
   - Accessibility
   - Trust
3. For each issue:
   - Why it is a problem
   - Reference text from the content
4. Top 3 before/after improvement suggestions

Respond in JSON format only.

---

## 2. Prompt Constraint for Structured JSON

Instruction:
Ensure the response:

- Contains 8–12 issues
- Uses only one category per issue
- Returns valid JSON
- Does not include markdown formatting or backticks

---

## 3. Error Handling Prompt Logic

Instruction:
If insufficient content is provided, still generate a structured UX review based on available headings, buttons, and text.
