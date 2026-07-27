import type { AnswerState } from "./dashboardHelpers.types";

type Rec = Record<string, unknown>;

export function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

export function str(r: Rec, k: string): string | undefined {
  const v = r[k];
  return typeof v === "string" ? v : undefined;
}

export function num(r: Rec, k: string): number | undefined {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function clampAnswer(x: unknown): AnswerState | null {
  if (x === "meets" || x === "not_sure" || x === "dont_meet") return x;
  return null;
}

export function readAnswerMap(x: unknown): Record<string, AnswerState> {
  if (!isRec(x)) return {};
  const out: Record<string, AnswerState> = {};
  for (const [k, v] of Object.entries(x)) {
    const sv = clampAnswer(v);
    if (sv) out[k] = sv;
  }
  return out;
}

export function readNotesMap(x: unknown): Record<string, string> {
  if (!isRec(x)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(x)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

export function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
