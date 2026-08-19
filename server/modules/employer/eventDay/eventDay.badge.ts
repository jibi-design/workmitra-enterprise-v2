/** Public door badge. Isolated copy — do not import from src/features. */

export type PublicPassBadge = "VALID" | "INVALID" | "REVOKED" | "EXPIRED" | "USED";

export type PublicPassValidity = {
  readonly status: string;
  readonly validFrom: string;
  readonly validUntil: string;
  readonly entered?: boolean;
};

export function resolvePublicPassBadge(
  pass: PublicPassValidity | null,
  nowMs = Date.now(),
): PublicPassBadge {
  if (!pass) return "INVALID";
  if (pass.entered) return "USED";
  if (pass.status === "revoked") return "REVOKED";
  if (pass.status === "expired") return "EXPIRED";
  if (pass.status === "draft") return "INVALID";
  const untilMs = Date.parse(pass.validUntil);
  const fromMs = Date.parse(pass.validFrom);
  if (Number.isFinite(untilMs) && nowMs > untilMs) return "EXPIRED";
  if (Number.isFinite(fromMs) && nowMs < fromMs) return "INVALID";
  if (pass.status === "active" && Number.isFinite(fromMs) && Number.isFinite(untilMs)) {
    if (nowMs >= fromMs && nowMs <= untilMs) return "VALID";
  }
  return "INVALID";
}
