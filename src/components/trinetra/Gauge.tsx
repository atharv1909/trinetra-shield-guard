import { useEffect, useState } from "react";
import { riskColor } from "@/lib/trinetra";

interface GaugeProps {
  score: number; // 0..1
  size?: number;
}

export function Gauge({ score, size = 160 }: GaugeProps) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 60);
    return () => clearTimeout(t);
  }, [score]);

  const color = riskColor(score);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
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
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-extrabold tabular-nums" style={{ color }}>
          {Math.round(score * 100)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">score</span>
      </div>
    </div>
  );
}
