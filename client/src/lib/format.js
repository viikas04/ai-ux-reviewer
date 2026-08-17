/**
 * Adds a protocol if the person typed a bare domain, so
 * "stripe.com" and "https://stripe.com" both work.
 */
export function normalizeUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Loose check that the input looks like a domain or URL before
 * it's sent to the backend. Not a full validator — just enough
 * to catch empty input and obvious typos early.
 */
export function isLikelyUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const pattern = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#].*)?$/i;
  return pattern.test(trimmed);
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function scoreTier(score) {
  if (score >= 75) return "good";
  if (score >= 50) return "medium";
  return "low";
}

export function scoreTierLabel(score) {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Needs work";
  return "Weak";
}

export function severityTier(severity) {
  const value = (severity || "").toLowerCase();
  if (value === "high") return "high";
  if (value === "medium") return "medium";
  return "low";
}

export function formatDate(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}