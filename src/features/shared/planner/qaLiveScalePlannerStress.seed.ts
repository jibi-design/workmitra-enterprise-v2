/**
 * Planner Live Scale Stress seed — 10 employers × 100 staff each (= 1,000).
 * Planner domain ONLY — Demand plans + roster apps + swaps + audit CSV volume.
 * Browser / Playwright headed visual audit.
 */

import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import {
  DEMAND_PLANS_STORAGE_KEY,
  DEMAND_PLANS_CHANGED_EVENT,
  type DemandPlan,
  type DaySlot,
  type PlanRoleGroup,
} from "../../employer/planner/storage/demandPlanner.schema";
import { PLANNER_AUDIT_LOG_KEY } from "../../employer/planner/storage/plannerAuditLog.storage";
import { sanitizeShiftEmployerScopeId, shiftEmployerScopedKey } from "../shift/shiftEmployerScope";
import { WORKER_APPS_PROJECTION_KEY } from "../shift/shiftTenantProjection";

export const PLANNER_SCALE_EMPLOYERS = 10;
export const PLANNER_SCALE_STAFF_PER_EMPLOYER = 100;
export const PLANNER_SCALE_TOTAL_STAFF =
  PLANNER_SCALE_EMPLOYERS * PLANNER_SCALE_STAFF_PER_EMPLOYER;

export const PLANNER_SCALE_EMP_PREFIX = "ML_PLANNER_SCALE_EMP_";
export const PLANNER_SCALE_WRK_PREFIX = "ML_PLANNER_SCALE_WRK_";
export const PLANNER_SCALE_REGISTRY_KEY = "wm_qa_planner_scale_employer_registry_v1";

const CATEGORIES = [
  "Security",
  "Warehouse",
  "Kitchen",
  "Logistics",
  "Cleaning",
  "Events",
  "Retail",
  "Hospitality",
  "Construction",
  "Delivery",
] as const;

export type PlannerLiveScaleStressSeedResult = {
  employers: number;
  staffPerEmployer: number;
  totalStaff: number;
  totalConfirmedApps: number;
  totalSwapRequests: number;
  totalAuditEntries: number;
  sampleEmployerId: string;
  samplePlanId: string;
  sampleWorkerMlId: string;
  sampleUnassignedCount: number;
  weekDates: string[];
  categories: string[];
};

export function plannerScaleEmployerId(index1Based: number): string {
  return `${PLANNER_SCALE_EMP_PREFIX}${index1Based}`;
}

export function plannerScaleWorkerId(globalIndex1Based: number): string {
  return `${PLANNER_SCALE_WRK_PREFIX}${String(globalIndex1Based).padStart(4, "0")}`;
}

export function plannerScalePlanId(employerIndex1Based: number): string {
  return `planner_scale_plan_${employerIndex1Based}`;
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next Monday + 6 days = dense 7-day weekly grid. */
function buildWeekDates(fromMs: number): string[] {
  const start = new Date(fromMs + 2 * 86_400_000);
  while (start.getDay() !== 1) start.setDate(start.getDate() + 1);
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(fmtDate(d));
  }
  return out;
}

function clearPlannerScaleKeys(): void {
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (
      key.includes("PLANNER_SCALE") ||
      key.includes("planner_scale") ||
      key.startsWith(PLANNER_SCALE_REGISTRY_KEY) ||
      key === DEMAND_PLANS_STORAGE_KEY ||
      key === "wm_planner_public_index_v1" ||
      key === PLANNER_AUDIT_LOG_KEY ||
      key === "wm_shift_planner_swaps_v1" ||
      key === "wm_employee_plan_engagement_v1" ||
      key === "wm_employee_planner_workspaces_v1" ||
      key === "wm_employer_demand_plan_draft_v1" ||
      (key.includes("ML_PLANNER_SCALE") && key.includes("shift_applications"))
    ) {
      doomed.push(key);
    }
  }
  for (const key of doomed) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export function assumePlannerScaleEmployer(employerId: string, companyName: string): void {
  const cur = employerSettingsStorage.get();
  employerSettingsStorage.save({
    ...cur,
    companyName,
    uniqueId: employerId,
    companyUniqueId: employerId,
    employerOrgId: employerId,
    fullName: cur.fullName || "Planner Scale Employer",
    email: cur.email || `planner.scale.${employerId.toLowerCase()}@mitralabs.test`,
    phone: cur.phone || "9876500101",
    industryType: cur.industryType || "Professional Services",
    companySize: cur.companySize || "51–200",
    locationCity: cur.locationCity || "City A",
    locationState: cur.locationState || "Region",
    companyDescription: cur.companyDescription || "Planner scale stress tenant",
    registrationNo: cur.registrationNo || "",
    notificationsEnabled: true,
    hrManagementEnabled: false,
    language: "en",
    hapticFeedback: true,
    globalMute: false,
    quietHoursEnabled: false,
    quietFrom: "22:00",
    quietTo: "07:00",
    transferStatus: "none",
    businessAdminIds: cur.businessAdminIds ?? [],
    previousHandles: cur.previousHandles ?? [],
    contactVerified: true,
    verificationLevel: 1,
  });
  window.dispatchEvent(new Event("wm:shift-employer-scope-changed"));
  window.dispatchEvent(new Event(DEMAND_PLANS_CHANGED_EVENT));
}

export function assumePlannerScaleEmployerByIndex(index1Based: number): void {
  const id = plannerScaleEmployerId(index1Based);
  assumePlannerScaleEmployer(id, `Planner Scale Co #${index1Based}`);
}

/**
 * Seed 10 employers × 100 staff (1,000 total) for Planner live visual stress.
 */
export function applyPlannerLiveScaleStressSeed(
  employerCount = PLANNER_SCALE_EMPLOYERS,
  staffPerEmployer = PLANNER_SCALE_STAFF_PER_EMPLOYER,
): PlannerLiveScaleStressSeedResult {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("applyPlannerLiveScaleStressSeed requires browser localStorage");
  }

  const safeEmployers = Math.max(1, Math.min(employerCount, 10));
  const safeStaff = Math.max(1, Math.min(staffPerEmployer, 100));
  const now = Date.now();
  const weekDates = buildWeekDates(now);

  clearPlannerScaleKeys();

  const plans: DemandPlan[] = [];
  const publicIndex: Record<string, unknown>[] = [];
  const auditEntries: Record<string, unknown>[] = [];
  const swapRequests: Record<string, unknown>[] = [];
  const workerProjection: Record<string, unknown>[] = [];
  const registry: Array<{ id: string; companyName: string; planId: string }> = [];

  let totalConfirmedApps = 0;
  let sampleUnassignedCount = 0;
  const sampleEmployerId = plannerScaleEmployerId(1);
  const samplePlanId = plannerScalePlanId(1);
  const sampleWorkerMlId = plannerScaleWorkerId(1);

  for (let emp = 1; emp <= safeEmployers; emp += 1) {
    const employerId = plannerScaleEmployerId(emp);
    const scopeId = sanitizeShiftEmployerScopeId(employerId);
    const companyName = `Planner Scale Co #${emp}`;
    const category = CATEGORIES[(emp - 1) % CATEGORIES.length] ?? "Security";
    const planId = plannerScalePlanId(emp);
    const planName = `Scale ${category} Week Plan #${emp}`;

    const slots: DaySlot[] = weekDates.map((date, idx) => ({
      date,
      workers: 12 + (idx % 3),
      payPerDay: 850 + emp * 10 + idx * 5,
      category,
      slotId: `sl_${planId}_${date}`,
    }));

    const workerIds: string[] = [];
    const apps: Record<string, unknown>[] = [];

    for (let w = 1; w <= safeStaff; w += 1) {
      const globalWorker = (emp - 1) * safeStaff + w;
      const workerMlId = plannerScaleWorkerId(globalWorker);
      const workerName = `Planner Scale Staff ${globalWorker}`;
      workerIds.push(workerMlId);

      const firstSlot = slots[0]!;
      const appId = `pscale_app_${emp}_${w}`;
      const app = {
        id: appId,
        postId: firstSlot.slotId,
        createdAt: now - emp * 1000 - w,
        status: "confirmed",
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
        planId,
        planApplyBatchId: `pscale_batch_${emp}_${w}`,
        selectedDates: weekDates.slice(0, 3),
        profileSnapshot: {
          uniqueId: workerMlId,
          fullName: workerName,
          city: `City ${(w % 5) + 1}`,
          skills: [category.toLowerCase(), "operations"],
          experience: "experienced",
        },
        employerScopeId: scopeId,
      };
      apps.push(app);
      totalConfirmedApps += 1;

      // Cap worker projection — quota-safe (sample tenant + a few peers)
      if (emp === 1 && w <= 40) {
        workerProjection.push(app);
      }

      // Swap volume: ~1 requested / peer_accepted per 10 staff on emp 1–3
      if (emp <= 3 && w % 10 === 0 && w < safeStaff) {
        const peer = plannerScaleWorkerId(globalWorker + 1);
        const startAt = new Date(`${weekDates[2]}T09:00:00`).toISOString();
        swapRequests.push({
          id: `pswap_${emp}_${w}`,
          weekId: `week_${weekDates[0]}`,
          shiftInstanceId: `inst_${planId}_${weekDates[2]}_${w}`,
          initiatorId: workerMlId,
          peerId: peer,
          siteId: `site_scale_${emp}`,
          roleTag: category,
          date: weekDates[2],
          startAt,
          status: emp === 1 && w % 20 === 0 ? "peer_accepted" : "requested",
          createdAt: now - w * 1000,
          updatedAt: now - w * 500,
          peerRoleTag: category,
        });
      }
    }

    // Role groups: ~70 assigned across 2 crews; remainder stay Unassigned on board
    const assignedCut = Math.floor(safeStaff * 0.7);
    const crewA = workerIds.slice(0, Math.floor(assignedCut / 2));
    const crewB = workerIds.slice(Math.floor(assignedCut / 2), assignedCut);
    const roleGroups: PlanRoleGroup[] = [
      { id: `rg_${planId}_a`, label: `${category} A`, color: "#0891b2", workerMlIds: crewA },
      { id: `rg_${planId}_b`, label: `${category} B`, color: "#0d9488", workerMlIds: crewB },
    ];
    if (emp === 1) sampleUnassignedCount = safeStaff - assignedCut;

    const plan: DemandPlan = {
      id: planId,
      name: planName,
      companyName,
      locationName: `City ${(emp % 5) + 1} Site`,
      category,
      experience: "experienced",
      startDate: weekDates[0]!,
      endDate: weekDates[6]!,
      workingDays: [1, 2, 3, 4, 5, 6, 0],
      slots,
      status: "active",
      createdAt: now - emp * 60_000,
      updatedAt: now,
      submittedAt: now - emp * 50_000,
      description: `Planner scale stress weekly schedule for ${companyName}`,
      schemaVersion: 2,
      legalEntityMlId: employerId,
      epochDays: 30,
      milestoneCursor: 0,
      publishStatus: "published",
      waitingBuffer: 4,
      roleGroups,
      siteId: `site_scale_${emp}`,
    };
    plans.push(plan);

    publicIndex.push({
      planId,
      planName,
      companyName,
      locationName: plan.locationName,
      category,
      experience: "experienced",
      dayCount: 7,
      openDayCount: 7,
      payMin: slots[0]!.payPerDay,
      payMax: slots[6]!.payPerDay,
      slotDates: weekDates,
      postIdsByDate: {},
      slotIdsByDate: Object.fromEntries(slots.map((s) => [s.date, s.slotId])),
      payByDate: Object.fromEntries(slots.map((s) => [s.date, s.payPerDay])),
      workersByDate: Object.fromEntries(slots.map((s) => [s.date, s.workers])),
      publishedAt: now - emp * 40_000,
      status: "active",
      schemaVersion: 1,
    });

    // Audit volume for CSV export stress (cap 40/plan — under 200 FIFO)
    for (let a = 0; a < 40; a += 1) {
      auditEntries.push({
        id: `pau_pscale_${emp}_${a}`,
        planId,
        at: now - a * 60_000 - emp,
        actor: a % 7 === 0 ? "system" : "employer",
        actorMlId: employerId,
        action: a % 5 === 0 ? "published" : a % 5 === 1 ? "batch_approved" : "crew_broadcast",
        summary: `Scale audit ${a} · ${planName}`,
        meta: { staffIndex: a, employer: emp },
      });
    }

    const appsKey = shiftEmployerScopedKey("shift_applications_v1", scopeId);
    safeSet(appsKey, JSON.stringify(apps));
    safeSet(`${appsKey}__migrated_v1`, "1");

    registry.push({ id: employerId, companyName, planId });
  }

  // Assume tenant #1 so employer-scoped reads bind immediately
  assumePlannerScaleEmployer(sampleEmployerId, "Planner Scale Co #1");

  safeSet(DEMAND_PLANS_STORAGE_KEY, JSON.stringify(plans));
  safeSet("wm_planner_public_index_v1", JSON.stringify(publicIndex));
  safeSet(PLANNER_AUDIT_LOG_KEY, JSON.stringify(auditEntries));
  safeSet(
    "wm_shift_planner_swaps_v1",
    JSON.stringify({ state: { swapRequests }, version: 0 }),
  );
  safeSet(WORKER_APPS_PROJECTION_KEY, JSON.stringify(workerProjection));
  safeSet("wm_employee_shift_applications_v1", JSON.stringify(workerProjection));

  // Employee planner surfaces for sample worker
  safeSet(
    "wm_employee_planner_workspaces_v1",
    JSON.stringify([
      {
        id: `pscale_ws_day_${samplePlanId}`,
        planId: samplePlanId,
        planName: plans[0]?.name,
        date: weekDates[0],
        workerMlId: sampleWorkerMlId,
        workerName: "Planner Scale Staff 1",
        status: "assigned",
        companyName: "Planner Scale Co #1",
        locationName: "City 1 Site",
      },
    ]),
  );
  safeSet(
    "wm_employee_plan_engagement_v1",
    JSON.stringify([
      {
        planId: samplePlanId,
        savedAt: now - 10_000,
        lastViewedAt: now - 5_000,
        schemaVersion: 1,
      },
    ]),
  );

  safeSet(
    PLANNER_SCALE_REGISTRY_KEY,
    JSON.stringify({
      seeded: true,
      seededAt: now,
      employerCount: safeEmployers,
      staffPerEmployer: safeStaff,
      totalStaff: safeEmployers * safeStaff,
      employers: registry,
      weekDates,
    }),
  );

  window.dispatchEvent(new Event(DEMAND_PLANS_CHANGED_EVENT));
  window.dispatchEvent(new Event("wm:planner-public-index-changed"));
  window.dispatchEvent(new Event("wm:planner-audit-log-changed"));
  window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
  window.dispatchEvent(new Event("wm:employee-plan-engagement-changed"));

  return {
    employers: safeEmployers,
    staffPerEmployer: safeStaff,
    totalStaff: safeEmployers * safeStaff,
    totalConfirmedApps,
    totalSwapRequests: swapRequests.length,
    totalAuditEntries: auditEntries.length,
    sampleEmployerId,
    samplePlanId,
    sampleWorkerMlId,
    sampleUnassignedCount,
    weekDates,
    categories: [...CATEGORIES],
  };
}
