import { pct, type ScanResult } from "@/lib/trinetra";
import { Tag, BoolPill, KVRow } from "./primitives";

function num(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return <span className="text-muted-foreground">—</span>;
  return <span className="tabular-nums">{String(v)}</span>;
}

function CardShell({ title, score, children }: { title: string; score: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</h4>
        <span className="font-display text-2xl font-bold tabular-nums">{score}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3">{children}</div>
    </div>
  );
}

export function EyeCards({ result }: { result: ScanResult }) {
  const cs = result.component_scores ?? {};
  const eye1Flags = result.eye1_result?.flags ?? [];
  const eye1f = result.eye1_result?.features ?? {};
  const eye3Flags = result.eye3_result?.flags ?? [];
  const eye3f = result.eye3_result?.features ?? {};
  const visualPending = result.visual_pending === true;
  const visualScore = result.visual_score;
  const visualUnavailable = !visualPending && visualScore === 0.5;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* Eye 1 - URL */}
      <CardShell title="Eye 1 · URL" score={pct(cs.url_score)}>
        <div className="flex flex-wrap gap-1.5">
          {eye1Flags.slice(0, 3).map((f) => (
            <Tag key={f} flag={f} />
          ))}
          {eye1Flags.length === 0 && <span className="text-xs text-muted-foreground">No flags</span>}
        </div>
        <div className="mt-auto space-y-0.5">
          <KVRow label="url_length">{num(eye1f.url_length)}</KVRow>
          <KVRow label="entropy">
            {typeof eye1f.entropy === "number" ? eye1f.entropy.toFixed(2) : "—"}
          </KVRow>
          <KVRow label="ssl_valid">
            <BoolPill value={eye1f.ssl_valid as boolean} trueTone="green" falseTone="red" />
          </KVRow>
          <KVRow label="suspicious_tld">
            <BoolPill value={eye1f.suspicious_tld as boolean} trueTone="red" falseTone="green" />
          </KVRow>
        </div>
      </CardShell>

      {/* Eye 2 - Visual */}
      <CardShell title="Eye 2 · Visual" score={visualPending ? "…" : pct(visualScore)}>
        {visualPending ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            Analyzing screenshot...
          </div>
        ) : visualUnavailable ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Visual analysis unavailable on hosted version. Run locally for full detection.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(result.eye1_result?.flags ?? [])
              .filter((f) => f.includes("VISUAL"))
              .map((f) => (
                <Tag key={f} flag={f} />
              ))}
            <span className="text-xs text-muted-foreground">Screenshot compared to brand reference.</span>
          </div>
        )}
      </CardShell>

      {/* Eye 3 - Behavior */}
      <CardShell title="Eye 3 · Behavior" score={pct(cs.behavior_score)}>
        <div className="flex flex-wrap gap-1.5">
          {eye3Flags.map((f) => (
            <Tag key={f} flag={f} />
          ))}
          {eye3Flags.length === 0 && <span className="text-xs text-muted-foreground">No flags</span>}
        </div>
        <div className="mt-auto space-y-0.5">
          <KVRow label="form_action_external">
            <BoolPill value={eye3f.form_action_external as boolean} trueTone="red" falseTone="green" />
          </KVRow>
          <KVRow label="has_password_field">
            <BoolPill value={eye3f.has_password_field as boolean} trueTone="amber" falseTone="green" />
          </KVRow>
          <KVRow label="num_external_scripts">{num(eye3f.num_external_scripts)}</KVRow>
        </div>
      </CardShell>
    </div>
  );
}
