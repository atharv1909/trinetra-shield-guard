// Trinetra AI — API client, types, and display helpers.

const BASE_URL = "https://trinetra-ai-hhl2.onrender.com";

export interface Org {
  display_name: string;
  official_domain: string;
}
export type OrgMap = Record<string, Org>;

export interface ScanResult {
  scan_id: string;
  url: string;
  target_org: string | null;
  final_score: number;
  risk_level: string;
  flags: string[];
  url_score?: number;
  behavior_score?: number;
  visual_score?: number;
  visual_pending?: boolean;
  timestamp?: string;
  component_scores?: {
    url_score?: number;
    behavior_score?: number;
    visual_score?: number;
    blocklist_score?: number;
  };
  eye1_result?: {
    url_score?: number;
    flags?: string[];
    features?: Record<string, unknown>;
    brand_analysis?: {
      best_match_org?: string | null;
      best_match_score?: number;
      details?: Record<string, Record<string, unknown>>;
    };
  };
  eye3_result?: {
    behavior_score?: number;
    fetch_success?: boolean;
    flags?: string[];
    features?: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// Fetch wrapper with a 60s timeout.
// ---------------------------------------------------------------------------
async function request<T>(path: string, opts: RequestInit = {}, timeoutMs = 60000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...opts,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const getOrgs = () => request<OrgMap>("/orgs");
export const postScan = (url: string, target_org: string | null) =>
  request<ScanResult>("/scan", { method: "POST", body: JSON.stringify({ url, target_org }) });
export const getScan = (id: string) => request<ScanResult>(`/scan/${id}`);
export const getHistory = () => request<ScanResult[]>("/history");
export const clearHistory = () => request<{ status: string }>("/history", { method: "DELETE" });

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Risk color system (input is a 0..1 score).
// ---------------------------------------------------------------------------
export function riskColor(score01: number): string {
  const s = score01 * 100;
  if (s < 30) return "var(--risk-green)";
  if (s < 50) return "var(--risk-blue)";
  if (s < 65) return "var(--risk-amber)";
  return "var(--risk-red)";
}

export type Tone = "green" | "blue" | "amber" | "red" | "neutral";

export function toneColor(tone: Tone): string {
  switch (tone) {
    case "green":
      return "var(--risk-green)";
    case "blue":
      return "var(--risk-blue)";
    case "amber":
      return "var(--risk-amber)";
    case "red":
      return "var(--risk-red)";
    default:
      return "var(--muted-foreground)";
  }
}

// ---------------------------------------------------------------------------
// Flag classification & formatting.
// ---------------------------------------------------------------------------
const RED_FLAGS = new Set([
  "FORM_POSTS_EXTERNALLY",
  "CREDENTIAL_HARVESTING_PATTERN",
  "VISUAL_CLONE_DETECTED",
  "HOMOGLYPH_ATTACK",
  "TYPOSQUAT_DETECTED",
  "IP_ADDRESS_IN_URL",
]);
const AMBER_FLAGS = new Set([
  "HIGH_VISUAL_SIMILARITY",
  "BRAND_KEYWORD_IN_DOMAIN",
  "BRAND_IN_SUBDOMAIN",
  "SSL_INVALID",
]);

export function flagTone(flag: string): Tone {
  if (RED_FLAGS.has(flag)) return "red";
  if (AMBER_FLAGS.has(flag) || flag.startsWith("BRAND_SIMILARITY_")) return "amber";
  return "blue";
}

const ACRONYMS = new Set(["TLD", "SSL", "IP", "ML", "URL", "HTTPS", "DNS", "ID"]);

export function prettyFlag(flag: string): string {
  return flag
    .split("_")
    .map((w) => {
      if (ACRONYMS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

// ---------------------------------------------------------------------------
// Misc display helpers.
// ---------------------------------------------------------------------------
export function pct(score01: number | null | undefined, decimals = 0): string {
  if (score01 === null || score01 === undefined || Number.isNaN(score01)) return "—";
  return `${(score01 * 100).toFixed(decimals)}%`;
}

export function truncate(str: string, max: number): string {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export function formatTime(ts?: string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
