// Job Mitra | employeeAvailability.service.ts | Section 6.11 / 8.11
// Hybrid A2 S8 — native slot days when no dual-write ShiftPost exists.

import {
  getEmployerShiftPostsPublic as getEmployerShiftPosts,
  isAlreadyApplied,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { getShiftDayConflict } from "../helpers/plannerDayConflict.helpers";
import type {
  BuildEmployeeAvailabilityInput,
  EmployeeAvailability,
  EmployeeAvailabilityDay,
  EmployeeAvailabilityDayStatus,
  EmployeeAvailabilitySummary,
} from "../types/employeeAvailability.types";

const APPS_KEY = "wm_employee_shift_applications_v1";

function readAppForTarget(targetId: string): { id: string; status: string } | null {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const rec = item as Record<string, unknown>;
      if (rec.postId === targetId) {
        return {
          id: String(rec.id ?? ""),
          status: String(rec.status ?? "applied"),
        };
      }
    }
  } catch {
    /* safe */
  }
  return null;
}

function summarize(days: EmployeeAvailabilityDay[]): EmployeeAvailabilitySummary {
  return {
    totalDayCount: days.length,
    openDayCount: days.filter((d) => d.status === "open").length,
    selectableDayCount: days.filter((d) => d.selectable).length,
    conflictDayCount: days.filter((d) => d.status === "conflict").length,
    appliedDayCount: days.filter((d) => ["applied", "shortlisted", "waiting"].includes(d.status))
      .length,
    confirmedDayCount: days.filter((d) => d.status === "confirmed").length,
    fullDayCount: days.filter((d) => d.status === "full").length,
  };
}

function buildDayFromPost(args: {
  dateKey: string;
  postId: string;
  slotId?: string;
  indexStatus: "active" | "cancelled";
  workerMlId: string;
  now: number;
}): EmployeeAvailabilityDay {
  const { dateKey, postId, slotId, indexStatus, workerMlId, now } = args;

  if (indexStatus === "cancelled") {
    return {
      dateKey,
      postId,
      slotId,
      applyTargetId: postId,
      payPerDay: 0,
      status: "cancelled",
      selectable: false,
      badges: [],
    };
  }

  const dayStart = new Date(`${dateKey}T00:00:00`).getTime();
  if (dayStart < new Date(now).setHours(0, 0, 0, 0)) {
    return {
      dateKey,
      postId,
      slotId,
      applyTargetId: postId,
      payPerDay: 0,
      status: "past",
      selectable: false,
    };
  }

  const post = getEmployerShiftPosts().find((p) => p.id === postId);
  if (!post || post.status === "cancelled") {
    return {
      dateKey,
      postId,
      slotId,
      applyTargetId: postId,
      payPerDay: 0,
      status: "cancelled",
      selectable: false,
    };
  }

  const payPerDay = post.payPerDay ?? 0;
  const vacancies = post.vacancies ?? 0;
  const confirmed = post.confirmedIds.length;
  const vacanciesRemaining = Math.max(0, vacancies - confirmed);
  const full = vacancies > 0 && confirmed >= vacancies;

  const app = readAppForTarget(postId);
  const conflict = getShiftDayConflict(dateKey, workerMlId, postId);

  let status: EmployeeAvailabilityDayStatus = "open";
  if (conflict) status = "conflict";
  else if (app?.status === "confirmed" || post.confirmedIds.includes(app?.id ?? ""))
    status = "confirmed";
  else if (app?.status === "shortlisted") status = "shortlisted";
  else if (app?.status === "waiting") status = "waiting";
  else if (app || isAlreadyApplied(postId)) status = "applied";
  else if (full) status = "full";

  const selectable = status === "open" && !conflict;

  return {
    dateKey,
    postId,
    slotId,
    applyTargetId: postId,
    payPerDay,
    status,
    selectable,
    vacanciesTotal: vacancies,
    vacanciesRemaining,
    conflict: conflict ?? undefined,
    applicationId: app?.id,
    applicationStatus: app?.status,
    badges:
      status === "full"
        ? ["full"]
        : status === "applied"
          ? ["applied"]
          : status === "confirmed"
            ? ["confirmed"]
            : status === "conflict"
              ? ["conflict"]
              : [],
  };
}

function buildDayNative(args: {
  dateKey: string;
  slotId: string;
  payPerDay: number;
  workers: number;
  indexStatus: "active" | "cancelled";
  workerMlId: string;
  now: number;
}): EmployeeAvailabilityDay {
  const { dateKey, slotId, payPerDay, workers, indexStatus, workerMlId, now } = args;

  if (indexStatus === "cancelled") {
    return {
      dateKey,
      slotId,
      applyTargetId: slotId,
      payPerDay: 0,
      status: "cancelled",
      selectable: false,
      badges: [],
    };
  }

  const dayStart = new Date(`${dateKey}T00:00:00`).getTime();
  if (dayStart < new Date(now).setHours(0, 0, 0, 0)) {
    return {
      dateKey,
      slotId,
      applyTargetId: slotId,
      payPerDay: 0,
      status: "past",
      selectable: false,
    };
  }

  const app = readAppForTarget(slotId);
  const conflict = getShiftDayConflict(dateKey, workerMlId, slotId);

  let confirmedCount = 0;
  try {
    const raw = localStorage.getItem(APPS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      confirmedCount = parsed.filter((item) => {
        if (typeof item !== "object" || item === null) return false;
        const rec = item as Record<string, unknown>;
        return rec.postId === slotId && rec.status === "confirmed";
      }).length;
    }
  } catch {
    /* safe */
  }

  const vacanciesRemaining = Math.max(0, workers - confirmedCount);
  const full = workers > 0 && confirmedCount >= workers;

  let status: EmployeeAvailabilityDayStatus = "open";
  if (conflict) status = "conflict";
  else if (app?.status === "confirmed") status = "confirmed";
  else if (app?.status === "shortlisted") status = "shortlisted";
  else if (app?.status === "waiting") status = "waiting";
  else if (app || isAlreadyApplied(slotId)) status = "applied";
  else if (full) status = "full";

  const selectable = status === "open" && !conflict;

  return {
    dateKey,
    slotId,
    applyTargetId: slotId,
    payPerDay,
    status,
    selectable,
    vacanciesTotal: workers,
    vacanciesRemaining,
    conflict: conflict ?? undefined,
    applicationId: app?.id,
    applicationStatus: app?.status,
    badges:
      status === "full"
        ? ["full"]
        : status === "applied"
          ? ["applied"]
          : status === "confirmed"
            ? ["confirmed"]
            : status === "conflict"
              ? ["conflict"]
              : [],
  };
}

export const employeeAvailabilityService = {
  build(input: BuildEmployeeAvailabilityInput): EmployeeAvailability {
    const now = input.now ?? Date.now();
    const slotDates = [...input.indexEntry.slotDates].sort();
    const days = slotDates.map((dateKey) => {
      const postId = input.indexEntry.postIdsByDate[dateKey];
      const slotId =
        input.indexEntry.slotIdsByDate?.[dateKey] ??
        (postId?.startsWith("sl_") ? postId : undefined);
      const pay = input.indexEntry.payByDate?.[dateKey] ?? input.indexEntry.payMin ?? 0;
      const workers = input.indexEntry.workersByDate?.[dateKey] ?? 1;

      if (postId) {
        const post = getEmployerShiftPosts().find((p) => p.id === postId);
        if (post) {
          return buildDayFromPost({
            dateKey,
            postId,
            slotId,
            indexStatus: input.indexEntry.status,
            workerMlId: input.workerMlId,
            now,
          });
        }
        // Indexed postId missing in Shift store → treat as native target id.
        return buildDayNative({
          dateKey,
          slotId: postId,
          payPerDay: pay,
          workers,
          indexStatus: input.indexEntry.status,
          workerMlId: input.workerMlId,
          now,
        });
      }

      if (!slotId) {
        return {
          dateKey,
          payPerDay: 0,
          status: "unavailable" as const,
          selectable: false,
        };
      }

      return buildDayNative({
        dateKey,
        slotId,
        payPerDay: pay,
        workers,
        indexStatus: input.indexEntry.status,
        workerMlId: input.workerMlId,
        now,
      });
    });

    const selectedDateKeys = input.initialSelectedDateKeys ?? [];

    return {
      workerMlId: input.workerMlId,
      planId: input.planId,
      planName: input.indexEntry.planName,
      companyName: input.indexEntry.companyName,
      locationName: input.indexEntry.locationName,
      generatedAt: now,
      schemaVersion: 1,
      dateRange: {
        start: slotDates[0] ?? "",
        end: slotDates[slotDates.length - 1] ?? "",
      },
      days,
      summary: summarize(days),
      selectedDateKeys,
    };
  },

  toggleSelection(availability: EmployeeAvailability, dateKey: string): EmployeeAvailability {
    const day = availability.days.find((d) => d.dateKey === dateKey);
    if (!day?.selectable) return availability;

    const next = new Set(availability.selectedDateKeys);
    if (next.has(dateKey)) next.delete(dateKey);
    else next.add(dateKey);

    const selectedDateKeys = [...next].sort();
    const days = availability.days.map((d) => ({
      ...d,
      badges: [
        ...(d.badges?.filter((b) => b !== "selected") ?? []),
        ...(selectedDateKeys.includes(d.dateKey) ? (["selected"] as const) : []),
      ],
    }));

    return { ...availability, selectedDateKeys, days };
  },

  selectAllOpen(availability: EmployeeAvailability): EmployeeAvailability {
    const selectedDateKeys = availability.days.filter((d) => d.selectable).map((d) => d.dateKey);
    return { ...availability, selectedDateKeys };
  },
};
