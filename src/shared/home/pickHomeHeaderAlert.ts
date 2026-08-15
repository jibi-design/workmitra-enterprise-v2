/** Pick exactly one home header alert — no stacked notification strips. */

export type HomeHeaderAlertKind = "join" | "pending" | "upcoming" | "inbox";

export function pickHomeHeaderAlert(input: {
  readonly hasJoin: boolean;
  readonly pendingCount: number;
  readonly hasUpcoming: boolean;
  readonly hasInbox: boolean;
}): HomeHeaderAlertKind | null {
  if (input.hasJoin) return "join";
  if (input.pendingCount > 0) return "pending";
  if (input.hasUpcoming) return "upcoming";
  if (input.hasInbox) return "inbox";
  return null;
}
