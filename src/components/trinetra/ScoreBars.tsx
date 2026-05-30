import { useEffect, useState } from "react";
import { riskColor } from "@/lib/trinetra";

interface BarRow {
  label: string;
  value: number; // 0..1
}

function Bar({ row, index }: { row: BarRow; index: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(row.value), 80 + index * 100);
    return () => clearTimeout(t);
  }, [row.value, index]);
  const color = riskColor(row.value);

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0 text-xs text-muted-foreground">{row.label}</div>
      <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-secondary">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${w * 100}%`,
            backgroundColor: color,
            transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <div className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums" style={{ color }}>
        {Math.round(row.value * 100)}%
      </div>
    </div>
  );
}

export function ScoreBars({
  scores,
}: {
  scores: { url_score?: number; visual_score?: number; behavior_score?: number; blocklist_score?: number };
}) {
  const rows: BarRow[] = [
    { label: "URL", value: scores.url_score ?? 0 },
    { label: "Visual", value: scores.visual_score ?? 0 },
    { label: "Behavior", value: scores.behavior_score ?? 0 },
    { label: "Blocklist", value: scores.blocklist_score ?? 0 },
  ];

  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <Bar key={r.label} row={r} index={i} />
      ))}
    </div>
  );
}
