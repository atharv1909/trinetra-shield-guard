import { formatTime, pct, riskColor, truncate, type ScanResult } from "@/lib/trinetra";
import { Sparkline } from "./Sparkline";
import { RiskPill } from "./primitives";

interface HistoryTableProps {
  scans: ScanResult[];
  onClear: () => void;
  onScanAgain: (scan: ScanResult) => void;
  clearing: boolean;
}

export function HistoryTable({ scans, onClear, onScanAgain, clearing }: HistoryTableProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">History</h2>
        {scans.length > 0 && (
          <button
            onClick={onClear}
            disabled={clearing}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-40"
          >
            {clearing ? "Clearing…" : "Clear History"}
          </button>
        )}
      </div>

      {scans.length >= 2 && (
        <div className="rounded-md border border-border bg-card p-4">
          <Sparkline scans={scans} />
        </div>
      )}

      {scans.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No scans yet. Enter a URL above to start.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Org</th>
                <th className="px-4 py-3 text-right font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {scans.map((s, i) => {
                const score = typeof s.final_score === "number" ? s.final_score : 0;
                const color = riskColor(score);
                return (
                  <tr key={s.scan_id + i} className="border-b border-border/60 last:border-0 hover:bg-secondary/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatTime(s.timestamp)}</td>
                    <td className="px-4 py-3 text-xs">{truncate(s.url, 40)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.target_org ?? "auto"}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums" style={{ color }}>
                      {pct(score)}
                    </td>
                    <td className="px-4 py-3">
                      <RiskPill level={s.risk_level} color={color} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onScanAgain(s)}
                        className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
                      >
                        Scan Again
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
