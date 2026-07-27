export function toEpoch(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    return Number.isFinite(d.getTime()) ? d.getTime() : Date.now();
  } catch {
    return Date.now();
  }
}

export function toDateStr(epoch: number): string {
  try {
    const d = new Date(epoch);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export function todayStr(): string {
  return toDateStr(Date.now());
}

export function tomorrowEpoch(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export function normalizeLines(raw: string, opts: { maxItems: number; maxLen: number }): string[] {
  const lines = raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => (x.length > opts.maxLen ? x.slice(0, opts.maxLen) : x));

  const seen = new Set<string>();
  const out: string[] = [];

  for (const x of lines) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;

    seen.add(k);
    out.push(x);

    if (out.length >= opts.maxItems) break;
  }

  return out;
}
