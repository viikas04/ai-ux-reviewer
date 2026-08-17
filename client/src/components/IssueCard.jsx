import { severityTier } from "../lib/format";

const BAR_COLOR = {
  high: "var(--pen)",
  medium: "var(--warn)",
  low: "var(--steel)",
};

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 7H5a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 011 1v1a2 2 0 01-2 2H5M18 7h-4a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 011 1v1a2 2 0 01-2 2h-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function IssueCard({ issue }) {
  const tier = severityTier(issue.severity);

  return (
    <div className="issue-card">
      <div className="issue-card__bar" style={{ background: BAR_COLOR[tier] }} />
      <div className="issue-card__body">
        <div className="issue-card__top">
          {issue.category && <span className="tag">{issue.category}</span>}
          {issue.severity && <span className={`pill pill--${tier}`}>{issue.severity}</span>}
        </div>

        <div className="issue-card__title">{issue.issue}</div>
        {issue.why && <p className="issue-card__why">{issue.why}</p>}

        {issue.proof && (
          <div className="proof">
            <QuoteIcon />
            <span className="proof__text">{issue.proof}</span>
          </div>
        )}
      </div>
    </div>
  );
}