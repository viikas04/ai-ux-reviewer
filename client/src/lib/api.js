const BASE_URL = "https://ai-ux-reviewer-backend.onrender.com";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function analyzeUrl(url) {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data?.error || "The audit couldn't be completed. Please try again.");
  }

  return data;
}

export async function fetchReviews() {
  const response = await fetch(`${BASE_URL}/reviews`);
  if (!response.ok) {
    throw new Error("Couldn't load recent audits.");
  }
  return response.json();
}

export async function fetchStatus() {
  const response = await fetch(`${BASE_URL}/status`);
  if (!response.ok) {
    throw new Error("Couldn't reach the status endpoint.");
  }
  return response.json();
}