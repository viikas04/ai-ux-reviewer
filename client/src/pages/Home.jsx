import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeUrl, fetchReviews } from "../lib/api";
import { normalizeUrl, isLikelyUrl, severityTier } from "../lib/format";
import ScoreGauge from "../components/ScoreGauge";
import IssueCard from "../components/IssueCard";
import FixCard from "../components/FixCard";
import HistoryItem from "../components/HistoryItem";

const EXAMPLES = ["stripe.com", "linear.app", "airbnb.com"];
const FILTERS = [
  { key: "all", label: "All" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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

export default function Home() {
  const [url, setUrl] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const resultsRef = useRef(null);

  const loadReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const data = await fetchReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviewsError("Recent audits didn't load. The backend may be waking up.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const runAnalysis = async (rawUrl) => {
    if (!isLikelyUrl(rawUrl)) {
      setFieldError("Enter a valid URL, like stripe.com or https://stripe.com");
      return;
    }

    setFieldError("");
    setError("");
    setLoading(true);
    setResult(null);
    setSeverityFilter("all");

    try {
      const data = await analyzeUrl(normalizeUrl(rawUrl));
      setResult(data);
      loadReviews();
      requestAnimationFrame(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultsRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runAnalysis(url);
  };

  const handleExampleClick = (domain) => {
    setUrl(domain);
    setFieldError("");
    runAnalysis(domain);
  };

  const issues = useMemo(() => result?.review?.issues ?? [], [result]);
  const fixes = useMemo(() => result?.review?.top_fixes ?? [], [result]);

  const severityCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    issues.forEach((issue) => {
      counts[severityTier(issue.severity)] += 1;
    });
    return counts;
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (severityFilter === "all") return issues;
    return issues.filter((issue) => severityTier(issue.severity) === severityFilter);
  }, [issues, severityFilter]);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__inner">
          <span className="hero__eyebrow">UX audit tool</span>
          <h1>Paste a link, get a graded UX audit.</h1>
          <p>
            The reviewer scrapes the page, scores it out of 100, and flags issues by category
            with the exact text or element behind each one — plus concrete before/after fixes.
          </p>

          <form className="analyze-form" onSubmit={handleSubmit} noValidate>
            <div className="analyze-form__row">
              <div className="url-input-wrap">
                <SearchIcon />
                <input
                  type="text"
                  className={`url-input${fieldError ? " has-error" : ""}`}
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  aria-label="Website URL to analyze"
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? "url-field-error" : undefined}
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <span className="btn__spinner" aria-hidden="true" />}
                {loading ? "Analyzing" : "Analyze"}
              </button>
            </div>

            {fieldError && (
              <p className="field-msg" id="url-field-error" role="alert">
                <WarnIcon />
                {fieldError}
              </p>
            )}

            <div className="examples">
              <span className="examples__label">Try:</span>
              {EXAMPLES.map((domain) => (
                <button
                  type="button"
                  key={domain}
                  className="chip"
                  onClick={() => handleExampleClick(domain)}
                  disabled={loading}
                >
                  {domain}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      <main className="main">
        <div className="shell">
          {loading && (
            <div className="section" style={{ paddingBottom: 0 }}>
              <div className="loading-panel" role="status" aria-live="polite">
                <p>
                  Scanning <strong>{normalizeUrl(url)}</strong> — this can take up to 30 seconds
                </p>
                <div className="loading-panel__bar">
                  <div className="loading-panel__bar-fill" />
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="section" style={{ paddingBottom: 0 }}>
              <div className="error-banner" role="alert">
                <WarnIcon />
                <div>
                  <div className="error-banner__title">The audit didn't complete</div>
                  <div className="error-banner__body">{error}</div>
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div ref={resultsRef}>
              <section className="section" aria-label="UX score">
                <div className="gauge-panel">
                  <ScoreGauge score={result.score} />
                  <div className="gauge-panel__stats">
                    <div className="stat-row">
                      <span className="stat-row__dot" style={{ background: "var(--pen)" }} />
                      <span className="stat-row__label">High severity</span>
                      <span className="stat-row__value">{severityCounts.high}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-row__dot" style={{ background: "var(--warn)" }} />
                      <span className="stat-row__label">Medium severity</span>
                      <span className="stat-row__value">{severityCounts.medium}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-row__dot" style={{ background: "var(--steel)" }} />
                      <span className="stat-row__label">Low severity</span>
                      <span className="stat-row__value">{severityCounts.low}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section" aria-label="Issues found">
                <div className="section__head">
                  <div>
                    <h2 className="section__title">Issues</h2>
                    <p className="section__sub">Each one cites the exact text or element it's based on.</p>
                  </div>
                  <div className="filters" role="group" aria-label="Filter by severity">
                    {FILTERS.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        className={`filter-btn${severityFilter === f.key ? " is-active" : ""}`}
                        onClick={() => setSeverityFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredIssues.length > 0 ? (
                  <div className="issue-list">
                    {filteredIssues.map((issue, index) => (
                      <IssueCard key={index} issue={issue} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-filter">No {severityFilter !== "all" ? severityFilter : ""} issues in this audit.</div>
                )}
              </section>

              {fixes.length > 0 && (
                <section className="section" aria-label="Top fixes">
                  <div className="section__head">
                    <div>
                      <h2 className="section__title">Top fixes</h2>
                      <p className="section__sub">The highest-leverage changes, before and after.</p>
                    </div>
                  </div>
                  <div className="fix-list">
                    {fixes.map((fix, index) => (
                      <FixCard key={index} fix={fix} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <section className="section" aria-label="Recent audits">
            <div className="section__head">
              <div>
                <h2 className="section__title">Recent audits</h2>
                <p className="section__sub">The last 5 sites run through the reviewer.</p>
              </div>
            </div>

            {reviewsLoading && <div className="empty-filter">Loading recent audits…</div>}

            {!reviewsLoading && reviewsError && (
              <div className="error-banner" role="alert">
                <WarnIcon />
                <div>
                  <div className="error-banner__title">{reviewsError}</div>
                  <button type="button" className="btn btn-ghost" style={{ marginTop: 10 }} onClick={loadReviews}>
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <div className="empty-state">
                <div className="empty-state__title">No audits yet</div>
                <div className="empty-state__sub">Run your first one above — it'll show up here.</div>
              </div>
            )}

            {!reviewsLoading && !reviewsError && reviews.length > 0 && (
              <div className="history-list">
                {reviews.map((review) => (
                  <HistoryItem key={review._id || review.url + review.createdAt} review={review} />
                ))}
              </div>
            )}
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