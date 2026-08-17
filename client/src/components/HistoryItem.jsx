import { getDomain, scoreTier, formatDate } from "../lib/format";

const CHIP_COLORS = {
  good: { background: "var(--pass-soft)", color: "var(--pass)" },
  medium: { background: "var(--warn-soft)", color: "var(--warn)" },
  low: { background: "var(--pen-soft)", color: "var(--pen-strong)" },
};

export default function HistoryItem({ review }) {
  const tier = scoreTier(review.score);
  const issueCount = review.review?.issues?.length;
  const date = formatDate(review.createdAt);

  return (
    <div className="history-row">
      <div className="history-row__score" style={CHIP_COLORS[tier]}>
        {review.score}
      </div>
      <div className="history-row__main">
        <div className="history-row__domain">{getDomain(review.url)}</div>
        <div className="history-row__meta">
          {typeof issueCount === "number" ? `${issueCount} issue${issueCount === 1 ? "" : "s"} found` : review.url}
        </div>
      </div>
      {date && <div className="history-row__date">{date}</div>}
    </div>
  );
}