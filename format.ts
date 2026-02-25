export function pct(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const v = n * 100;
  return `${v.toFixed(0)}%`;
}

export function statusFromPctOff(p: number | null | undefined) {
  if (p === null || p === undefined || Number.isNaN(p)) return { label: "—", tone: "warn" as const };
  const a = Math.abs(p);
  if (a <= 0.10) return { label: "ON TARGET", tone: "good" as const };
  if (a <= 0.20) return { label: "SLIGHTLY OFF", tone: "warn" as const };
  return { label: ">20% OFF", tone: "bad" as const };
}

export function safeNum(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
