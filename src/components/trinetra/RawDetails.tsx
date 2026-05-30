import { useState } from "react";
import { toast } from "sonner";
import { formatTime, toneColor, type ScanResult, type Tone } from "@/lib/trinetra";
import { BoolPill, KVRow } from "./primitives";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-4">
      <h5 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</h5>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Num({ value, tone }: { value: unknown; tone?: Tone }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="tabular-nums" style={tone ? { color: toneColor(tone) } : undefined}>
      {String(value)}
    </span>
  );
}

const has = (o: Record<string, unknown>, k: string) => o[k] !== undefined && o[k] !== null;

export function RawDetails({ result }: { result: ScanResult }) {
  const [open, setOpen] = useState(false);
  const f1 = (result.eye1_result?.features ?? {}) as Record<string, unknown>;
  const ba = result.eye1_result?.brand_analysis;
  const org = ba?.best_match_org ?? null;
  const bd = (org && ba?.details?.[org] ? ba.details[org] : {}) as Record<string, unknown>;
  const f3 = (result.eye3_result?.features ?? {}) as Record<string, unknown>;

  const sslAge = f1.ssl_age_days as number | undefined;
  const sslAgeTone: Tone | undefined =
    typeof sslAge === "number" ? (sslAge < 30 ? "red" : sslAge > 365 ? "green" : "neutral") : undefined;
  const lev = bd.levenshtein as number | undefined;
  const levTone: Tone | undefined = typeof lev === "number" && lev < 3 ? "red" : "neutral";
  const jaro = bd.jaro_winkler as number | undefined;
  const jaroTone: Tone | undefined = typeof jaro === "number" && jaro > 0.7 ? "red" : "neutral";
  const extScripts = f3.num_external_scripts as number | undefined;

  const copyId = () => {
    navigator.clipboard?.writeText(result.scan_id).then(() => toast.success("Scan ID copied"));
  };

  return (
    <div className="rounded-md border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Full Scan Details
        </span>
        <span className="text-muted-foreground transition-transform" style={{ transform: open ? "rotate(180deg)" : "" }}>
          ▾
        </span>
      </button>

      {open && (
        <div className="grid gap-4 border-t border-border p-5 md:grid-cols-2" style={{ animation: "fade-in 0.3s ease-out" }}>
          {/* Eye 1 details */}
          <Section title="Eye 1 · URL Features">
            {has(f1, "url_length") && <KVRow label="url_length"><Num value={f1.url_length} /></KVRow>}
            {has(f1, "num_dots") && <KVRow label="num_dots"><Num value={f1.num_dots} /></KVRow>}
            {has(f1, "num_hyphens") && <KVRow label="num_hyphens"><Num value={f1.num_hyphens} /></KVRow>}
            {has(f1, "entropy") && (
              <KVRow label="entropy">
                <span className="tabular-nums">{(f1.entropy as number).toFixed(4)}</span>
              </KVRow>
            )}
            {has(f1, "has_ip") && (
              <KVRow label="has_ip"><BoolPill value={f1.has_ip as boolean} trueTone="red" falseTone="green" /></KVRow>
            )}
            {has(f1, "is_https") && (
              <KVRow label="is_https"><BoolPill value={f1.is_https as boolean} trueTone="green" falseTone="red" /></KVRow>
            )}
            {has(f1, "suspicious_tld") && (
              <KVRow label="suspicious_tld"><BoolPill value={f1.suspicious_tld as boolean} trueTone="red" falseTone="green" /></KVRow>
            )}
            {has(f1, "ssl_valid") && (
              <KVRow label="ssl_valid"><BoolPill value={f1.ssl_valid as boolean} trueTone="green" falseTone="red" /></KVRow>
            )}
            {has(f1, "ssl_age_days") && <KVRow label="ssl_age_days"><Num value={sslAge} tone={sslAgeTone} /></KVRow>}
            {has(f1, "is_official") && (
              <KVRow label="is_official"><BoolPill value={f1.is_official as boolean} trueTone="green" falseTone="red" /></KVRow>
            )}
            {org && (
              <>
                {has(bd, "levenshtein") && <KVRow label="levenshtein"><Num value={lev} tone={levTone} /></KVRow>}
                {has(bd, "jaro_winkler") && (
                  <KVRow label="jaro_winkler">
                    <span className="tabular-nums" style={jaroTone ? { color: toneColor(jaroTone) } : undefined}>
                      {((jaro as number) * 100).toFixed(1)}%
                    </span>
                  </KVRow>
                )}
                {has(bd, "brand_in_subdomain") && (
                  <KVRow label="brand_in_subdomain"><BoolPill value={bd.brand_in_subdomain as boolean} trueTone="amber" /></KVRow>
                )}
                {has(bd, "brand_in_domain") && (
                  <KVRow label="brand_in_domain"><BoolPill value={bd.brand_in_domain as boolean} trueTone="amber" /></KVRow>
                )}
                {has(bd, "brand_in_path") && (
                  <KVRow label="brand_in_path"><BoolPill value={bd.brand_in_path as boolean} trueTone="amber" /></KVRow>
                )}
                {has(bd, "homoglyph_detected") && (
                  <KVRow label="homoglyph_detected"><BoolPill value={bd.homoglyph_detected as boolean} trueTone="red" falseTone="green" /></KVRow>
                )}
                {has(bd, "typosquat_match") && (
                  <KVRow label="typosquat_match"><BoolPill value={bd.typosquat_match as boolean} trueTone="red" falseTone="green" /></KVRow>
                )}
              </>
            )}
          </Section>

          {/* Eye 3 details */}
          <Section title="Eye 3 · Behavior Features">
            {has(f3, "form_action_external") && (
              <KVRow label="form_action_external"><BoolPill value={f3.form_action_external as boolean} trueTone="red" falseTone="green" /></KVRow>
            )}
            {has(f3, "has_password_field") && (
              <KVRow label="has_password_field"><BoolPill value={f3.has_password_field as boolean} trueTone="amber" /></KVRow>
            )}
            {has(f3, "num_external_scripts") && (
              <KVRow label="num_external_scripts">
                <Num value={extScripts} tone={typeof extScripts === "number" && extScripts > 10 ? "red" : undefined} />
              </KVRow>
            )}
            {has(f3, "favicon_external") && (
              <KVRow label="favicon_external"><BoolPill value={f3.favicon_external as boolean} trueTone="amber" /></KVRow>
            )}
            {has(f3, "has_hidden_iframe") && (
              <KVRow label="has_hidden_iframe"><BoolPill value={f3.has_hidden_iframe as boolean} trueTone="red" falseTone="green" /></KVRow>
            )}
            {has(f3, "num_external_links") && <KVRow label="num_external_links"><Num value={f3.num_external_links} /></KVRow>}
            {has(f3, "redirect_domain_changed") && (
              <KVRow label="redirect_domain_changed"><BoolPill value={f3.redirect_domain_changed as boolean} trueTone="red" falseTone="green" /></KVRow>
            )}
            {has(result.eye3_result ?? {}, "fetch_success") && (
              <KVRow label="fetch_success"><BoolPill value={result.eye3_result?.fetch_success} trueTone="green" falseTone="red" /></KVRow>
            )}
          </Section>

          {/* Scan metadata */}
          <Section title="Scan Metadata">
            <KVRow label="scan_id">
              <button onClick={copyId} className="font-mono text-foreground underline-offset-2 hover:underline" title="Click to copy">
                {result.scan_id}
              </button>
            </KVRow>
            <KVRow label="timestamp">{formatTime(result.timestamp)}</KVRow>
            <KVRow label="target_org">{result.target_org ?? "—"}</KVRow>
            <KVRow label="visual_pending"><BoolPill value={result.visual_pending} trueTone="amber" falseTone="green" /></KVRow>
            <KVRow label="risk_level">{result.risk_level ?? "—"}</KVRow>
          </Section>
        </div>
      )}
    </div>
  );
}
