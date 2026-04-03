// src/features/employee/profile/services/profileShareService.ts
//
// Quick Share Profile — builds invitation text + share/copy.
// Share = invitation card, NOT report card.
// Never share: rating, level, phone, address, earnings.

import { employeeProfileStorage } from "../storage/employeeProfile.storage";

/* ------------------------------------------------ */
/* Completed shifts count (read-only)               */
/* ------------------------------------------------ */
const WS_KEY = "wm_employee_shift_workspaces_v1";

type Rec = Record<string, unknown>;

function countCompletedShifts(): number {
  try {
    const raw = localStorage.getItem(WS_KEY);
    if (!raw) return 0;
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return 0;
    return arr.filter(
      (w): w is Rec => typeof w === "object" && w !== null && (w as Rec)["status"] === "completed",
    ).length;
  } catch { return 0; }
}

/* ------------------------------------------------ */
/* Build share text                                 */
/* ------------------------------------------------ */
export function buildShareText(): string {
  const profile = employeeProfileStorage.get();
  const name = profile.fullName.trim() || "WorkMitra User";
  const wmId = profile.uniqueId || "";
  const shifts = countCompletedShifts();

  const lines: string[] = [
    "\uD83D\uDD35 WorkMitra Profile",
    "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501",
    `\uD83D\uDC64 ${name}`,
  ];

  if (wmId) lines.push(`\uD83C\uDD94 ${wmId}`);
  if (shifts > 0) lines.push(`\u2705 ${shifts} shift${shifts !== 1 ? "s" : ""} completed`);
  lines.push("", "Verify me on WorkMitra \u2014 search my WM ID.");

  return lines.join("\n");
}

/* ------------------------------------------------ */
/* Share / Copy                                     */
/* ------------------------------------------------ */
export type ShareResult = "shared" | "copied" | "error";

export async function shareProfile(): Promise<ShareResult> {
  const text = buildShareText();

  /* Web Share API — native mobile share sheet */
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      /* User cancelled or unsupported — fall through to clipboard */
    }
  }

  /* Clipboard fallback */
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "error";
  }
}