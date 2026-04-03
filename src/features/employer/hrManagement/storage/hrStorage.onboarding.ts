// src/features/employer/hrManagement/storage/hrStorage.onboarding.ts
//
// Onboarding lifecycle: start → toggle items → auto-complete → probation.
// Fix: creates employee-side employment record when onboarding completes.

import type { OnboardingItem } from "../types/hrManagement.types";
import {
  genItemId,
  pushStatusChange,
  hrGetById,
  hrUpdate,
  DEFAULT_PROBATION_DAYS,
} from "./hrStorage.core";
import { employmentLifecycleStorage } from "../../../../features/employee/employment/storage/employmentLifecycle.storage";

/* ------------------------------------------------ */
/* Helper: Create employee-side employment record   */
/* ------------------------------------------------ */
function createEmployeeSideRecord(recordId: string): void {
  const rec = hrGetById(recordId);
  if (!rec) return;

  // Avoid duplicate — check if record already exists for this HR candidate
  const existing = employmentLifecycleStorage.getAll();
  const alreadyExists = existing.some(
    (e) => e.careerPostId === recordId && e.status !== "exited",
  );
  if (alreadyExists) return;

  const now = Date.now();
  const joiningDate = rec.offerLetter?.joiningDate ?? now;

  employmentLifecycleStorage.createEmployment({
    careerPostId: recordId,
   companyName: rec.jobTitle ? rec.jobTitle : "Company",
    jobTitle: rec.jobTitle || rec.employeeName || "Employee",
    department: rec.department || "",
    location: rec.location || "",
    joinedAt: joiningDate,
    status: "probation",
    verified: true,
    hireMethod: "via_app",
  });
}

/* ------------------------------------------------ */
/* Start Onboarding                                 */
/* ------------------------------------------------ */
export function hrStartOnboarding(id: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "hired") return false;
  return hrUpdate(id, {
    status: "onboarding",
    statusHistory: pushStatusChange(rec, "hired", "onboarding", "employer", "Onboarding started"),
  });
}

/* ------------------------------------------------ */
/* Toggle Onboarding Item                           */
/* ------------------------------------------------ */
export function hrToggleOnboardingItem(
  recordId: string,
  itemId: string,
  completedBy: "employee" | "employer",
): boolean {
  const rec = hrGetById(recordId);
  if (!rec || !rec.onboarding) return false;
  if (rec.status !== "hired" && rec.status !== "onboarding") return false;

  const items = rec.onboarding.items.map((item) => {
    if (item.id !== itemId) return item;
    if (item.completedAt) {
      return { ...item, completedAt: undefined, completedBy: undefined };
    }
    return { ...item, completedAt: Date.now(), completedBy };
  });

  const allDone = items.every((i) => i.completedAt);
  const now = Date.now();

  const onboarding = {
    ...rec.onboarding,
    items,
    completedAt: allDone ? now : undefined,
  };

  if (allDone) {
    /* Onboarding complete → active (probation) */
    const joiningDate = rec.offerLetter?.joiningDate ?? now;
    const probationDays = DEFAULT_PROBATION_DAYS;
    const probationEnd = joiningDate + probationDays * 86400000;

    const success = hrUpdate(recordId, {
      onboarding,
      status: "active",
      employmentPhase: "probation",
      probationDurationDays: probationDays,
      probationEndDate: probationEnd,
      statusHistory: pushStatusChange(rec, "onboarding", "active (probation)", "system", "Onboarding completed — probation started"),
    });

    if (success) {
      createEmployeeSideRecord(recordId);
    }

    return success;
  }

  return hrUpdate(recordId, {
    onboarding,
    status: "onboarding",
  });
}

/* ------------------------------------------------ */
/* Add Onboarding Item                              */
/* ------------------------------------------------ */
export function hrAddOnboardingItem(recordId: string, label: string): boolean {
  const rec = hrGetById(recordId);
  if (!rec || !rec.onboarding) return false;
  if (rec.status !== "hired" && rec.status !== "onboarding") return false;

  const newItem: OnboardingItem = {
    id: genItemId(),
    label: label.trim(),
    isDefault: false,
  };

  const onboarding = {
    ...rec.onboarding,
    items: [...rec.onboarding.items, newItem],
    completedAt: undefined,
  };

  return hrUpdate(recordId, { onboarding, status: "onboarding" });
}

/* ------------------------------------------------ */
/* Remove Onboarding Item                           */
/* ------------------------------------------------ */
export function hrRemoveOnboardingItem(recordId: string, itemId: string): boolean {
  const rec = hrGetById(recordId);
  if (!rec || !rec.onboarding) return false;

  const item = rec.onboarding.items.find((i) => i.id === itemId);
  if (!item || item.isDefault) return false;

  const items = rec.onboarding.items.filter((i) => i.id !== itemId);
  const allDone = items.length > 0 && items.every((i) => i.completedAt);

  const onboarding = {
    ...rec.onboarding,
    items,
    completedAt: allDone ? Date.now() : undefined,
  };

  const success = hrUpdate(recordId, { onboarding, status: allDone ? "active" : rec.status });

  if (success && allDone) {
    createEmployeeSideRecord(recordId);
  }

  return success;
}