import { riskColor, type ScanResult } from "@/lib/trinetra";

export function Sparkline({ scans }: { scans: ScanResult[] }) {
  // Oldest -> newest, last 20.
  const data = [...scans]
    .reverse()
    .slice(-20)
    .map((s) => ({ value: typeof s.final_score === "number" ? s.final_score : 0 }));

  if (data.length < 2) return null;

  const w = 1000;
  const h = 80;
  const pad = 8;
  const stepX = (w - pad * 2) / (data.length - 1);
  const y = (v: number) => pad + (1 - Math.max(0, Math.min(1, v))) * (h - pad * 2);
  const points = data.map((d, i) => ({ x: pad + i * stepX, y: y(d.value), value: d.value }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-20 w-full"
      role="img"
      aria-label="Recent scan score trend"
    >
      <path d={path} fill="none" stroke="var(--border)" strokeWidth={3} vectorEffect="non-scaling-stroke" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={riskColor(p.value)} />
      ))}
    </svg>
  );
}
