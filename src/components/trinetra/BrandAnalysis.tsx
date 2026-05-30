import { pct, type ScanResult } from "@/lib/trinetra";
import { BrandRadar } from "./BrandRadar";
import { BoolPill, KVRow } from "./primitives";

export function BrandAnalysis({ result }: { result: ScanResult }) {
  const ba = result.eye1_result?.brand_analysis;
  const org = ba?.best_match_org;
  if (!org) return null;

  const details = (ba?.details?.[org] ?? {}) as Record<string, unknown>;
  const jaro = typeof details.jaro_winkler === "number" ? (details.jaro_winkler as number) : 0;
  const levenshtein = details.levenshtein;
  const orgName = result.target_org ?? org;

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Brand similarity detected
      </h3>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <BrandRadar value={jaro} />
          <div>
            <div className="font-display text-lg font-bold">{orgName}</div>
            <div className="text-xs text-muted-foreground">best match · score {pct(ba?.best_match_score)}</div>
          </div>
        </div>
        <div className="flex-1 space-y-0.5 sm:border-l sm:border-border sm:pl-5">
          <KVRow label="levenshtein">
            <span className="tabular-nums">{levenshtein ?? "—"}</span>
          </KVRow>
          <KVRow label="jaro_winkler">
            <span className="tabular-nums">{pct(jaro, 1)}</span>
          </KVRow>
          <KVRow label="typosquat_match">
            <BoolPill value={details.typosquat_match as boolean} trueTone="red" falseTone="green" />
          </KVRow>
          <KVRow label="homoglyph_detected">
            <BoolPill value={details.homoglyph_detected as boolean} trueTone="red" falseTone="green" />
          </KVRow>
          <KVRow label="brand_in_subdomain">
            <BoolPill value={details.brand_in_subdomain as boolean} trueTone="amber" falseTone="neutral" />
          </KVRow>
          <KVRow label="brand_in_domain">
            <BoolPill value={details.brand_in_domain as boolean} trueTone="amber" falseTone="neutral" />
          </KVRow>
          <KVRow label="brand_in_path">
            <BoolPill value={details.brand_in_path as boolean} trueTone="amber" falseTone="neutral" />
          </KVRow>
        </div>
      </div>
    </div>
  );
}
