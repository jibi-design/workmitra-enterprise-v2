/** Job Mitra | Phase 3 Calling — shared HTTP helpers */

export function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function asUid(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  }
  return 0;
}

export function normalizeMl(value: string): string {
  return value.trim().toUpperCase();
}

export function isParty(
  session: { initiatorMl: string; receiverMl: string },
  partyMl: string,
): boolean {
  const ml = normalizeMl(partyMl);
  return ml === session.initiatorMl || ml === session.receiverMl;
}

export function agoraAppIdPublic(): string | null {
  const id = process.env.AGORA_APP_ID?.trim() ?? "";
  return id || null;
}
