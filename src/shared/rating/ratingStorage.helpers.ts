import type { EmployerWorkerTag, WorkerEmployerTag } from "./ratingTypes";
import { MAX_RATING_COMMENT_LENGTH, MAX_RATING_TAGS } from "./ratingStorage.constants";

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

export function bool(r: Rec, k: string): boolean | undefined {
  const v = r[k];
  return typeof v === "boolean" ? v : undefined;
}

export function strArr(r: Rec, k: string): string[] {
  const v = r[k];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function sanitizeRatingComment(value: string | undefined): string | undefined {
  const cleaned = value?.trim().slice(0, MAX_RATING_COMMENT_LENGTH) ?? "";
  return cleaned || undefined;
}

export function normalizeTags<T extends string>(tags: T[]): T[] {
  return Array.from(
    new Set(tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)),
  ).slice(0, MAX_RATING_TAGS);
}

export type { EmployerWorkerTag, WorkerEmployerTag };
