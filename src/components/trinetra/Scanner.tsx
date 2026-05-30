import type { OrgMap } from "@/lib/trinetra";

const STAGES = [
  "Analyzing URL patterns...",
  "Checking brand similarity...",
  "Fetching page behavior...",
  "Running ML model...",
  "Finalizing score...",
];

interface ScannerProps {
  url: string;
  setUrl: (v: string) => void;
  orgs: OrgMap;
  selectedOrg: string | null;
  setSelectedOrg: (v: string | null) => void;
  onScan: () => void;
  scanning: boolean;
  stage: number;
  error: string | null;
}

export function Scanner({
  url,
  setUrl,
  orgs,
  selectedOrg,
  setSelectedOrg,
  onScan,
  scanning,
  stage,
  error,
}: ScannerProps) {
  const orgKeys = Object.keys(orgs);

  return (
    <div className="rounded-md border border-border bg-card p-5 sm:p-6">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !scanning && url.trim()) onScan();
        }}
        placeholder="Enter URL to scan e.g. https://sbi-login.xyz"
        className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
      />

      {/* Org pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill active={selectedOrg === null} onClick={() => setSelectedOrg(null)}>
          Auto-detect
        </Pill>
        {orgKeys.map((key) => (
          <Pill key={key} active={selectedOrg === key} onClick={() => setSelectedOrg(key)}>
            {orgs[key].display_name}
          </Pill>
        ))}
      </div>

      <button
        onClick={onScan}
        disabled={scanning || !url.trim()}
        className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-10"
      >
        {scanning ? "Scanning…" : "Scan URL"}
      </button>

      {scanning && (
        <div className="mt-5 space-y-2" style={{ animation: "fade-in 0.3s ease-out" }}>
          {STAGES.map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: i <= stage ? "var(--risk-blue)" : "var(--muted-foreground)", opacity: i <= stage ? 1 : 0.4 }}
            >
              {i < stage ? (
                <span style={{ color: "var(--risk-green)" }}>✓</span>
              ) : i === stage ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <span className="h-3 w-3 rounded-full border border-current" />
              )}
              {s}
            </div>
          ))}
        </div>
      )}

      {error && !scanning && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
      style={{
        borderColor: active ? "var(--risk-blue)" : "var(--border)",
        color: active ? "var(--risk-blue)" : "var(--muted-foreground)",
        backgroundColor: active ? "color-mix(in oklab, var(--risk-blue) 14%, transparent)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}
