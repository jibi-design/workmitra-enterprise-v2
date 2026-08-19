// App name: Job Mitra
// File name: shiftOpsGroupDisplayName.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\shiftOpsGroupDisplayName.ts

const MAX_NAME = 120;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatShiftDay(startAt: number): string {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatShiftClock(startAt: number): string {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function buildShiftOpsGroupDisplayName(post: {
  companyName?: string;
  jobName?: string;
  startAt?: number;
  shiftTiming?: string;
}): string {
  const company = post.companyName?.trim() ?? "";
  const job = post.jobName?.trim() ?? "";
  const startAt = typeof post.startAt === "number" && post.startAt > 0 ? post.startAt : 0;
  const day = startAt > 0 ? formatShiftDay(startAt) : "";
  const timing = post.shiftTiming?.trim() || (startAt > 0 ? formatShiftClock(startAt) : "");
  const name = [company, job, day, timing].filter(Boolean).join(" · ");
  const trimmed = name.trim() || "Shift Ops group";
  return trimmed.length > MAX_NAME ? `${trimmed.slice(0, MAX_NAME - 1)}…` : trimmed;
}
