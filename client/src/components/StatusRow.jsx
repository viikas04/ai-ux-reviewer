const POSITIVE_VALUES = ["running", "connected", "ok", "healthy", "up"];

export default function StatusRow({ label, sub, value }) {
  const isUp = POSITIVE_VALUES.includes((value || "").toLowerCase());

  return (
    <div className="status-row">
      <span className={`status-row__dot ${isUp ? "is-up" : "is-down"}`} />
      <div style={{ flex: 1 }}>
        <div className="status-row__label">{label}</div>
        {sub && <div className="status-row__sub">{sub}</div>}
      </div>
      <span className={`status-row__value ${isUp ? "is-up" : "is-down"}`}>{value}</span>
    </div>
  );
}