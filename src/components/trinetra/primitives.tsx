import { flagTone, prettyFlag, toneColor, type Tone } from "@/lib/trinetra";

// Detection-signal badge with stagger animation.
export function FlagBadge({ flag, index = 0 }: { flag: string; index?: number }) {
  const tone = flagTone(flag);
  const color = toneColor(tone);
  return (
    <span
      className="inline-flex items-center rounded-sm border px-2 py-1 text-[11px] font-medium"
      style={{
        color,
        borderColor: color,
        backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
        animation: "fade-in-up 0.4s ease-out both",
        animationDelay: `${index * 50}ms`,
      }}
    >
      {prettyFlag(flag)}
    </span>
  );
}

// Small colored tag used inside eye cards.
export function Tag({ flag }: { flag: string }) {
  const color = toneColor(flagTone(flag));
  return (
    <span
      className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      {prettyFlag(flag)}
    </span>
  );
}

// Boolean rendered as a colored "true"/"false" pill.
export function BoolPill({
  value,
  trueTone = "amber",
  falseTone = "neutral",
}: {
  value: boolean | null | undefined;
  trueTone?: Tone;
  falseTone?: Tone;
}) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  const tone = value ? trueTone : falseTone;
  const color = toneColor(tone);
  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold lowercase"
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
    >
      {String(value)}
    </span>
  );
}

// Risk level pill (matches score color system).
export function RiskPill({ level, color }: { level: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
    >
      {level || "—"}
    </span>
  );
}

// Key/value row for the terminal-style readout.
export function KVRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground">{children}</span>
    </div>
  );
}
