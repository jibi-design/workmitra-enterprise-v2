import type { EmployerShiftActivityEntry } from "../../shiftJobs/storage/employerShift.storage";
import { isRec, num, str } from "./dashboardHelpers.parsing";

const ACTIVITY_KEY = "wm_employer_shift_activity_log_v1";

export function normalizeActivity(rawList: unknown[]): EmployerShiftActivityEntry[] {
  const out: EmployerShiftActivityEntry[] = [];
  const validKinds = [
    "post_created",
    "post_closed",
    "post_expired",
    "analysis_run",
    "analysis_reset",
    "hidden",
    "unhidden",
    "move_shortlist",
    "move_waiting",
    "candidate_rejected",
    "confirmed",
    "replaced",
  ];
  for (const item of rawList) {
    if (!isRec(item)) continue;
    const id = str(item, "id");
    const postId = str(item, "postId");
    const kind = str(item, "kind");
    const createdAt = num(item, "createdAt");
    const title = str(item, "title");
    if (!id || !postId || !kind || createdAt === undefined || !title || !validKinds.includes(kind))
      continue;
    out.push({
      id,
      postId,
      kind: kind as EmployerShiftActivityEntry["kind"],
      createdAt,
      title,
      body: typeof item["body"] === "string" ? (item["body"] as string) : undefined,
      route: typeof item["route"] === "string" ? (item["route"] as string) : undefined,
    });
  }
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

export { ACTIVITY_KEY };
