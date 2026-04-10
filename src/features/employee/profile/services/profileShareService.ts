/** Job Mitra | profileShareService.ts | C:\projects\WorkMitra_Enterprise_v2\src\features\employee\profile\services\profileShareService.ts */

import { employeeProfileStorage } from "../storage/employeeProfile.storage";

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
  } catch {
    return 0;
  }
}

export function buildShareText(): string {
  const profile = employeeProfileStorage.get();
  const name = profile.fullName.trim() || "Job Mitra User";
  const uniqueId = profile.uniqueId || "";
  const shifts = countCompletedShifts();

  const lines: string[] = [
    "🔵 Job Mitra Profile",
    "━━━━━━━━━━━━━━━━",
    `👤 ${name}`,
  ];

  if (uniqueId) lines.push(`🆔 ${uniqueId}`);
  if (shifts > 0) lines.push(`✅ ${shifts} shift${shifts !== 1 ? "s" : ""} completed`);
  lines.push("", "Verify me on Job Mitra — search my JM ID.");

  return lines.join("\n");
}

export type ShareResult = "shared" | "copied" | "error";

export async function shareProfile(): Promise<ShareResult> {
  const text = buildShareText();

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      /* fall through */
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "error";
  }
}