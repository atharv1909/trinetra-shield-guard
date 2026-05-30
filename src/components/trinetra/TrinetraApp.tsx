import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  clearHistory,
  getHistory,
  getOrgs,
  getScan,
  postScan,
  sleep,
  type OrgMap,
  type ScanResult,
} from "@/lib/trinetra";
import { Scanner } from "./Scanner";
import { ResultCard } from "./ResultCard";
import { HistoryTable } from "./HistoryTable";

export function TrinetraApp() {
  const [orgs, setOrgs] = useState<OrgMap>({});
  const [orgsReady, setOrgsReady] = useState(false);
  const [waking, setWaking] = useState(false);
  const [orgsError, setOrgsError] = useState(false);

  const [url, setUrl] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<ScanResult[]>([]);
  const [clearing, setClearing] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  const refreshHistory = useCallback(() => {
    getHistory()
      .then((h) => setHistory(Array.isArray(h) ? h : []))
      .catch(() => {});
  }, []);

  // Wake-up handling + initial load.
  useEffect(() => {
    let cancelled = false;
    const bannerTimer = setTimeout(() => {
      if (!cancelled) setWaking(true);
    }, 3000);
    const startedAt = Date.now();

    (async () => {
      while (!cancelled) {
        try {
          const o = await getOrgs();
          if (cancelled) return;
          setOrgs(o);
          setOrgsReady(true);
          setWaking(false);
          refreshHistory();
          return;
        } catch {
          if (Date.now() - startedAt > 60000) {
            if (!cancelled) {
              setOrgsError(true);
              setWaking(false);
            }
            return;
          }
          await sleep(2000);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(bannerTimer);
    };
  }, [refreshHistory]);

  const runScan = useCallback(async () => {
    if (!url.trim()) return;
    setError(null);
    setResult(null);
    setScanning(true);
    setStage(0);

    const stageTimer = setInterval(() => {
      setStage((s) => Math.min(s + 1, 4));
    }, 1000);

    try {
      let res = await postScan(url.trim(), selectedOrg);
      const id = res.scan_id;
      const start = Date.now();
      while (res.visual_pending && Date.now() - start < 15000) {
        await sleep(3000);
        try {
          res = await getScan(id);
        } catch {
          /* keep polling */
        }
      }
      setResult(res);
      refreshHistory();
    } catch {
      setError("Scan failed — the URL may be unreachable or the backend timed out. Try again.");
    } finally {
      clearInterval(stageTimer);
      setScanning(false);
    }
  }, [url, selectedOrg, refreshHistory]);

  const handleClear = useCallback(async () => {
    setClearing(true);
    try {
      await clearHistory();
      refreshHistory();
    } catch {
      /* ignore */
    } finally {
      setClearing(false);
    }
  }, [refreshHistory]);

  const handleScanAgain = useCallback((scan: ScanResult) => {
    setUrl(scan.url);
    setSelectedOrg(scan.target_org ?? null);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div ref={topRef} className="min-h-screen bg-background">
      <Toaster theme="dark" position="bottom-right" />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Trinetra<span style={{ color: "var(--risk-blue)" }}> AI</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Targeted phishing detection</p>
        </header>

        {/* Wake-up banner */}
        {waking && !orgsReady && !orgsError && (
          <div className="mb-6 rounded-md border border-border bg-card p-4" style={{ animation: "fade-in 0.4s ease-out" }}>
            <p className="text-sm text-foreground">
              Backend is waking up — this takes 20–40 seconds on first load. Please wait.
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full w-1/3 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--risk-blue), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s linear infinite",
                  width: "100%",
                }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {orgsError && (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Backend unavailable. Try refreshing in a minute.
          </div>
        )}

        {/* Initial spinner before orgs load (and before banner shows) */}
        {!orgsReady && !orgsError && !waking && (
          <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            Connecting to detection engine…
          </div>
        )}

        {orgsReady && (
          <div className="space-y-10" style={{ animation: "fade-in 0.4s ease-out" }}>
            <Scanner
              url={url}
              setUrl={setUrl}
              orgs={orgs}
              selectedOrg={selectedOrg}
              setSelectedOrg={setSelectedOrg}
              onScan={runScan}
              scanning={scanning}
              stage={stage}
              error={error}
            />

            {result && <ResultCard result={result} />}

            <HistoryTable
              scans={history}
              onClear={handleClear}
              onScanAgain={handleScanAgain}
              clearing={clearing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
