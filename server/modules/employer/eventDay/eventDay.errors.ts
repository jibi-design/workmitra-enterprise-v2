/** Map missing Event Day tables (020 not applied) to a stable fail-closed result. */

export const EVENT_DAY_STORE_NOT_READY = {
  ok: false as const,
  code: "EVENT_DAY_STORE_NOT_READY",
  message: "Event Day cloud store is not applied yet.",
  httpStatus: 503,
};

export function isUndefinedRelationError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("code" in err)) return false;
  return (err as { code?: string }).code === "42P01";
}

export function isUndefinedColumnError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("code" in err)) return false;
  return (err as { code?: string }).code === "42703";
}

export function isUniqueViolationError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("code" in err)) return false;
  return (err as { code?: string }).code === "23505";
}
