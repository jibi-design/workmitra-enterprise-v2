// src/features/employer/hrManagement/storage/hrStorage.exit.ts
//
// Exit processing: initiate → clearance → settlement → complete.

import type { ExitTrigger } from "../types/exitProcessing.types";
import {
  genId,
  pushStatusChange,
  hrGetById,
  hrUpdate,
} from "./hrStorage.core";

/* ------------------------------------------------ */
/* Start Exit Processing                            */
/* ------------------------------------------------ */
export function hrStartExitProcessing(id: string, data: {
  trigger: ExitTrigger;
  triggerNote: string;
  noticeDays: number;
  waiveNotice: boolean;
  waivedReason?: string;
  clearanceItems: Array<{ id: string; label: string; isDefault: boolean }>;
}): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active") return false;

  const now = Date.now();
  const fromPhase = rec.employmentPhase === "confirmed" ? "active (confirmed)" : "active (probation)";

  const noticePeriod = {
    totalDays: data.waiveNotice ? 0 : data.noticeDays,
    startDate: now,
    endDate: data.waiveNotice ? now : now + data.noticeDays * 86400000,
    waived: data.waiveNotice,
    waivedReason: data.waivedReason,
  };

  const exitData = {
    trigger: data.trigger,
    triggerNote: data.triggerNote,
    initiatedAt: now,
    noticePeriod,
    clearanceItems: data.clearanceItems,
    experienceLetterSent: false,
  };

  return hrUpdate(id, {
    status: "exit_processing",
    exitData,
    statusHistory: pushStatusChange(rec, fromPhase, "exit_processing", "employer", `Exit initiated: ${data.triggerNote}`),
  });
}

/* ------------------------------------------------ */
/* Toggle Clearance Item                            */
/* ------------------------------------------------ */
export function hrToggleClearanceItem(id: string, itemId: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "exit_processing" || !rec.exitData) return false;

  const items = rec.exitData.clearanceItems.map((item) => {
    if (item.id !== itemId) return item;
    if (item.completedAt) {
      return { ...item, completedAt: undefined, completedBy: undefined };
    }
    return { ...item, completedAt: Date.now(), completedBy: "employer" as const };
  });

  const allDone = items.every((i) => i.completedAt);

  const exitData = {
    ...rec.exitData,
    clearanceItems: items,
    clearanceCompletedAt: allDone ? Date.now() : undefined,
  };

  return hrUpdate(id, { exitData });
}

/* ------------------------------------------------ */
/* Add Clearance Item                               */
/* ------------------------------------------------ */
export function hrAddClearanceItem(id: string, label: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "exit_processing" || !rec.exitData) return false;

  const newItem = {
    id: genId(),
    label: label.trim(),
    isDefault: false,
  };

  const exitData = {
    ...rec.exitData,
    clearanceItems: [...rec.exitData.clearanceItems, newItem],
    clearanceCompletedAt: undefined,
  };

  return hrUpdate(id, { exitData });
}

/* ------------------------------------------------ */
/* Save Settlement Note                             */
/* ------------------------------------------------ */
export function hrSaveSettlementNote(id: string, note: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "exit_processing" || !rec.exitData) return false;

  return hrUpdate(id, {
    exitData: { ...rec.exitData, settlementNote: note.trim() },
  });
}

/* ------------------------------------------------ */
/* Mark Experience Letter Sent                      */
/* ------------------------------------------------ */
export function hrMarkExperienceLetterSent(id: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "exit_processing" || !rec.exitData) return false;

  return hrUpdate(id, {
    exitData: { ...rec.exitData, experienceLetterSent: true },
  });
}

/* ------------------------------------------------ */
/* Complete Exit                                    */
/* ------------------------------------------------ */
export function hrCompleteExit(id: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "exit_processing" || !rec.exitData) return false;

  const allCleared = rec.exitData.clearanceItems.every((i) => i.completedAt);
  if (!allCleared) return false;

  return hrUpdate(id, {
    exitData: { ...rec.exitData, exitCompletedAt: Date.now() },
    statusHistory: pushStatusChange(rec, "exit_processing", "exited", "employer", "Exit process completed"),
  });
}