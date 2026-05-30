import { riskColor, truncate, type ScanResult } from "@/lib/trinetra";
import { Gauge } from "./Gauge";
import { EyeCards } from "./EyeCards";
import { ScoreBars } from "./ScoreBars";
import { BrandAnalysis } from "./BrandAnalysis";
import { RawDetails } from "./RawDetails";
import { FlagBadge } from "./primitives";

export function ResultCard({ result }: { result: ScanResult }) {
  const score = typeof result.final_score === "number" ? result.final_score : 0;
  const color = riskColor(score);
  const flags = result.flags ?? [];
  const cs = result.component_scores ?? {};

  return (
    <div className="space-y-6" style={{ animation: "fade-in-up 0.5s ease-out both" }}>
      {/* Verdict */}
      <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-card p-8 text-center">
        <Gauge score={score} />
        <div className="font-display text-3xl font-extrabold tracking-tight" style={{ color }}>
          {result.risk_level ?? "—"}
        </div>
        <p className="max-w-full break-all text-sm text-muted-foreground">{truncate(result.url, 70)}</p>
      </div>

      {/* Three eyes */}
      <EyeCards result={result} />

      {/* Component score breakdown */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Score Breakdown
        </h3>
        <ScoreBars
          scores={{
            url_score: cs.url_score,
            visual_score: cs.visual_score,
            behavior_score: cs.behavior_score,
            blocklist_score: cs.blocklist_score,
          }}
        />
      </div>

      {/* Detection signals */}
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Detection Signals
        </h3>
        {flags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {flags.map((f, i) => (
              <FlagBadge key={f + i} flag={f} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No detection signals fired.</p>
        )}
      </div>

      {/* Brand analysis */}
      <BrandAnalysis result={result} />

      {/* Raw details */}
      <RawDetails result={result} />
    </div>
  );
}
