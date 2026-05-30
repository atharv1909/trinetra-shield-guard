import { useEffect, useState } from "react";

function arcColor(v: number): string {
  if (v > 0.7) return "var(--risk-red)";
  if (v >= 0.5) return "var(--risk-amber)";
  return "var(--risk-green)";
}

// Filled arc threat meter for brand impersonation (jaro_winkler 0..1).
export function BrandRadar({ value, size = 80 }: { value: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(value), 60);
    return () => clearTimeout(t);
  }, [value]);

  const color = arcColor(value);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums" style={{ color }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
