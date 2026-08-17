function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12h16m0 0l-6-6m6 6l-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FixCard({ fix }) {
  return (
    <div className="fix-card">
      <div className="fix-card__title">{fix.issue}</div>
      <div className="fix-card__grid">
        <div className="fix-panel fix-panel--before">
          <span className="fix-panel__label">Before</span>
          <span className="fix-panel__text">{fix.before}</span>
        </div>
        <div className="fix-arrow">
          <ArrowIcon />
        </div>
        <div className="fix-panel fix-panel--after">
          <span className="fix-panel__label">After</span>
          <span className="fix-panel__text">{fix.after}</span>
        </div>
      </div>
    </div>
  );
}