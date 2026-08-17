import { useCallback, useEffect, useState } from "react";
import { fetchStatus } from "../lib/api";
import { formatDate } from "../lib/format";
import StatusRow from "../components/StatusRow";

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a1.5 1.5 0 001.3 2.3h17.8a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Status() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStatus();
      setStatus(data);
      setLastChecked(new Date());
    } catch {
      setError("Couldn't reach the backend. It may be waking up from idle — try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <section className="hero" style={{ maskImage: "none", WebkitMaskImage: "none" }}>
        <div className="hero__inner" style={{ paddingBottom: 40 }}>
          <span className="hero__eyebrow">Diagnostics</span>
          <h1>System status</h1>
          <p>Live health of the review pipeline — API, database, and the LLM connection.</p>
        </div>
      </section>

      <main className="main">
        <div className="shell">
          <section className="section">
            {loading && !status && <div className="empty-filter">Checking system status…</div>}

            {error && (
              <div className="error-banner" role="alert">
                <WarnIcon />
                <div>
                  <div className="error-banner__title">Status check failed</div>
                  <div className="error-banner__body">{error}</div>
                </div>
              </div>
            )}

            {status && (
              <div className="status-panel" aria-live="polite">
                <StatusRow label="Backend" sub="Express API" value={status.backend} />
                <StatusRow label="Database" sub="MongoDB" value={status.database} />
                <StatusRow label="LLM engine" sub="Groq · LLaMA 3.1" value={status.llm} />
              </div>
            )}

            <div className="status-footer">
              <span>{lastChecked ? `Last checked: ${formatDate(lastChecked)}` : "Not checked yet"}</span>
              <button type="button" className="btn btn-ghost" onClick={load} disabled={loading}>
                {loading ? "Checking…" : "Refresh"}
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span>AI Website UX Reviewer</span>
          <a href="https://github.com/viikas04/ai-ux-reviewer" target="_blank" rel="noreferrer">
            View source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}