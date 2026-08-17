import { useEffect, useState } from "react";
import { scoreTier, scoreTierLabel } from "../lib/format";

const CX = 100;
const CY = 104;
const ARC_R = 76;
const TICK_R1 = 76;
const TICK_R2 = 85;
const LABEL_R = 98;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// a = 0..180 progress along the gauge (0 = score 0, 180 = score 100)
// theta = 180 + a maps that progress onto standard SVG angle space
// (y-axis down), tracing left -> top -> right.
function pointAt(radius, progressDeg) {
  const theta = toRad(180 + progressDeg);
  return {
    x: CX + radius * Math.cos(theta),
    y: CY + radius * Math.sin(theta),
  };
}

function arcPath(radius, fromDeg, toDeg) {
  const start = pointAt(radius, fromDeg);
  const end = pointAt(radius, toDeg);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const ZONES = [
  { from: 0, to: 90, color: "var(--pen)" }, // score 0-50
  { from: 90, to: 135, color: "var(--warn)" }, // score 50-75
  { from: 135, to: 180, color: "var(--pass)" }, // score 75-100
];

const TICKS = [0, 25, 50, 75, 100];

const TIER_COLOR = {
  good: "var(--pass)",
  medium: "var(--warn)",
  low: "var(--pen)",
};

export default function ScoreGauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const tier = scoreTier(clamped);
  const targetRotation = (clamped / 100) * 180;
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setRotation(0);
    const id = requestAnimationFrame(() => {
      setTimeout(() => setRotation(targetRotation), 60);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped]);

  const needleTip = { x: CX - 58, y: CY };

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 128" role="img" aria-label={`UX score: ${clamped} out of 100, ${scoreTierLabel(clamped)}`}>
        {ZONES.map((zone) => (
          <path
            key={zone.color}
            d={arcPath(ARC_R, zone.from, zone.to)}
            fill="none"
            stroke={zone.color}
            strokeWidth="11"
            strokeLinecap="butt"
            opacity="0.9"
          />
        ))}

        {TICKS.map((value) => {
          const progress = (value / 100) * 180;
          const p1 = pointAt(TICK_R1, progress);
          const p2 = pointAt(TICK_R2, progress);
          const label = pointAt(LABEL_R, progress);
          return (
            <g key={value}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="var(--ink-faint)"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y}
                fontSize="8"
                fontFamily="var(--font-mono)"
                fill="var(--ink-faint)"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {value}
              </text>
            </g>
          );
        })}

        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transition: "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <line
            x1={CX}
            y1={CY}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="var(--ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <circle cx={CX} cy={CY} r="6" fill="var(--ink)" />
      </svg>

      <div className="gauge__readout">
        <span className="gauge__score" style={{ color: TIER_COLOR[tier] }}>
          {clamped}
        </span>
        <span className="gauge__max">/100</span>
        <div className="gauge__tier" style={{ color: TIER_COLOR[tier] }}>
          {scoreTierLabel(clamped)}
        </div>
      </div>
    </div>
  );
}