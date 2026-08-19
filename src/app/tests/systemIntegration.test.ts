/**
 * Full system integration checks — route boundaries, store isolation, privacy.
 * Covers Weekly Shift Planner, Demand Planner legacy paths, Mitra Labs, WorkVault LS keys.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { matchPath } from "react-router-dom";
import { ROUTE_PATHS } from "../router/routePaths";
import { EC, ER } from "../router/routes/routeSegments";
import { useShiftPlannerStore } from "../../features/shiftPlanner/storage/shiftSwap.storage";
import {
  hasExceededMonthlyLimit,
  isShiftLockedForSwap,
} from "../../features/shiftPlanner/helpers/shiftPlanner.helpers";
import { SWAP_MAX_PER_MONTH } from "../../features/shiftPlanner/validation/shiftSwap.schemas";
import { useMitraLabsStore } from "../../features/mitraLabs/storage/mitraLabs.storage";
import {
  buildVerificationUrl,
  MITRA_LABS_VERIFY_PATH,
} from "../../features/mitraLabs/helpers/mitraLabs.helpers";
import {
  CAREER_APPS_KEY,
  CAREER_POSTS_KEY,
} from "../../features/employer/careerJobs/helpers/careerStorageUtils";
import { VAULT_CAREER_HISTORY_KEY } from "../../features/employee/workVault/storage/vaultCareerHistory.storage";
import { VAULT_PLANNER_HISTORY_KEY } from "../../features/employee/workVault/storage/vaultPlannerHistory.storage";

const SHIFT_PLANNER_LS = "wm_shift_planner_swaps_v1";
const MITRA_LABS_LS = "wm_mitra_labs_passes_v1";
const HR_ATTENDANCE_MARKER_KEY = "wm_hr_employer_test_er_attendance_log_v1";
const PAYROLL_MARKER_KEY = "wm_payroll_ledger_marker_v1";

const GUEST_PII = {
  guestName: "Sensitive Guest",
  guestContact: "guest.secret@example.com",
  candidateRef: "cand_pii_should_not_leak",
};

function snapshotExternalMarkers(): Record<string, string | null> {
  return {
    careerPosts: localStorage.getItem(CAREER_POSTS_KEY),
    careerApps: localStorage.getItem(CAREER_APPS_KEY),
    vaultCareer: localStorage.getItem(VAULT_CAREER_HISTORY_KEY),
    vaultPlanner: localStorage.getItem(VAULT_PLANNER_HISTORY_KEY),
    hrAttendance: localStorage.getItem(HR_ATTENDANCE_MARKER_KEY),
    payroll: localStorage.getItem(PAYROLL_MARKER_KEY),
  };
}

function seedExternalMarkers(): void {
  localStorage.setItem(CAREER_POSTS_KEY, JSON.stringify([{ id: "career_seed", status: "active" }]));
  localStorage.setItem(CAREER_APPS_KEY, JSON.stringify([{ id: "app_seed", stage: "applied" }]));
  localStorage.setItem(VAULT_CAREER_HISTORY_KEY, JSON.stringify([{ id: "vault_seed" }]));
  localStorage.setItem(VAULT_PLANNER_HISTORY_KEY, JSON.stringify([{ id: "vault_plan_seed" }]));
  localStorage.setItem(HR_ATTENDANCE_MARKER_KEY, JSON.stringify([{ id: "att_seed" }]));
  localStorage.setItem(PAYROLL_MARKER_KEY, JSON.stringify({ balance: 999 }));
}

describe("system integration — route boundaries & domain isolation", () => {
  it("keeps Weekly Shift Planner paths distinct from Demand Planner legacy paths", () => {
    expect(ROUTE_PATHS.employeeShiftPlanner).toBe("/employee/planner");
    expect(ROUTE_PATHS.employerShiftPlanner).toBe("/employer/planner");
    expect(ROUTE_PATHS.employeePlannerHome).toBe("/employee/planner/home");
    expect(ROUTE_PATHS.employerPlannerHome).toBe("/employer/planner/home");
    expect(ROUTE_PATHS.employerPlannerPlans).toBe("/employer/planner/plans");

    expect(ROUTE_PATHS.employeeShiftPlanner).not.toBe(ROUTE_PATHS.employeePlannerHome);
    expect(ROUTE_PATHS.employerShiftPlanner).not.toBe(ROUTE_PATHS.employerPlannerHome);
    expect(ROUTE_PATHS.employerShiftPlanner).not.toBe(ROUTE_PATHS.employerPlannerPlans);

    expect(EC.shiftPlanner).toBe("planner");
    expect(EC.plannerHome).toBe("planner/home");
    expect(ER.shiftPlanner).toBe("planner");
    expect(ER.plannerHome).toBe("planner/home");
    expect(ER.plannerPlans).toBe("planner/plans");
  });

  it("exact-matches weekly planner without consuming demand planner children", () => {
    expect(
      matchPath({ path: ROUTE_PATHS.employeeShiftPlanner, end: true }, "/employee/planner"),
    ).not.toBeNull();
    expect(
      matchPath({ path: ROUTE_PATHS.employeeShiftPlanner, end: true }, "/employee/planner/home"),
    ).toBeNull();
    expect(
      matchPath({ path: ROUTE_PATHS.employeePlannerHome, end: true }, "/employee/planner/home"),
    ).not.toBeNull();

    expect(
      matchPath({ path: ROUTE_PATHS.employerShiftPlanner, end: true }, "/employer/planner"),
    ).not.toBeNull();
    expect(
      matchPath({ path: ROUTE_PATHS.employerShiftPlanner, end: true }, "/employer/planner/plans"),
    ).toBeNull();
    expect(
      matchPath({ path: ROUTE_PATHS.employerPlannerPlans, end: true }, "/employer/planner/plans"),
    ).not.toBeNull();
    expect(
      matchPath({ path: ROUTE_PATHS.employerPlannerHome, end: true }, "/employer/planner/home"),
    ).not.toBeNull();
  });

  it("registers Mitra Labs employer hub and public verify without colliding planners", () => {
    expect(ROUTE_PATHS.employerLabs).toBe("/employer/labs");
    expect(ROUTE_PATHS.employerLabsInvites).toBe("/employer/labs/invites");
    expect(ROUTE_PATHS.employerLabsQr).toBe("/employer/labs/qr");
    expect(ROUTE_PATHS.employerLabsReport).toBe("/employer/labs/report");
    expect(ROUTE_PATHS.employerLabsReportFolder).toBe("/employer/labs/report/:folderId");
    expect(ROUTE_PATHS.employerLabsAiPhoto).toBe("/employer/labs/ai-photo");
    expect(ROUTE_PATHS.labsPassVerify).toBe("/labs/pass/verify/:token");

    expect(ER.labs).toBe("labs");
    expect(ER.labsInvites).toBe("labs/invites");
    expect(ER.labsQr).toBe("labs/qr");
    expect(ER.labsReport).toBe("labs/report");
    expect(ER.labsReportFolder).toBe("labs/report/:folderId");
    expect(ER.labsAiPhoto).toBe("labs/ai-photo");

    expect(
      matchPath({ path: ROUTE_PATHS.employerLabs, end: true }, "/employer/labs"),
    ).not.toBeNull();
    expect(
      matchPath({ path: ROUTE_PATHS.employerLabs, end: true }, "/employer/planner"),
    ).toBeNull();
    expect(
      matchPath(
        { path: ROUTE_PATHS.labsPassVerify, end: true },
        "/labs/pass/verify/opaque_token_abc",
      ),
    ).not.toBeNull();
    expect(
      matchPath({ path: ROUTE_PATHS.labsPassVerify, end: true }, "/employer/labs"),
    ).toBeNull();
  });

  it("STEP 12: AI Photo Delivery is Day-1 gated off by default", async () => {
    const { showMitraLabsAiPhotoDelivery, LAUNCH_VISIBILITY } = await import(
      "../../shared/launch/launchVisibility"
    );
    expect(showMitraLabsAiPhotoDelivery).toBe(false);
    expect(LAUNCH_VISIBILITY.mitraLabsAiPhoto).toBe(false);
  });

  it("DE-03: career workspaces uses canonical ROUTE_PATHS (not string.replace)", () => {
    expect(ROUTE_PATHS.employeeCareerWorkspaces).toBe("/employee/career/workspaces");
    expect(EC.careerWorkspaces).toBe("career/workspaces");
    expect(
      matchPath(
        { path: ROUTE_PATHS.employeeCareerWorkspaces, end: true },
        "/employee/career/workspaces",
      ),
    ).not.toBeNull();
    expect(
      matchPath(
        { path: ROUTE_PATHS.employeeCareerWorkspaces, end: true },
        "/employee/career/workspace/ws_1",
      ),
    ).toBeNull();
  });
});

describe("system integration — store separation & zero coupling", () => {
  beforeEach(() => {
    localStorage.clear();
    useShiftPlannerStore.setState({ swapRequests: [] });
    useMitraLabsStore.setState({ passes: [], activeFilter: "all" });
    seedExternalMarkers();
  });

  it("Mitra Labs createPass / revokePass never mutate Shift Planner or Career/HR/Vault markers", () => {
    const before = snapshotExternalMarkers();
    const swapBefore = useShiftPlannerStore.getState().swapRequests;

    const pass = useMitraLabsStore.getState().createPass({
      issuerId: "er_integration",
      guestName: GUEST_PII.guestName,
      guestContact: GUEST_PII.guestContact,
      candidateRef: GUEST_PII.candidateRef,
      venue: { name: "Venue A" },
      purpose: "interview",
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(pass.passId).toBeTruthy();
    expect(useMitraLabsStore.getState().passes).toHaveLength(1);
    expect(useShiftPlannerStore.getState().swapRequests).toEqual(swapBefore);
    expect(snapshotExternalMarkers()).toEqual(before);

    useMitraLabsStore.getState().revokePass(pass.passId);
    expect(useMitraLabsStore.getState().passes[0]?.status).toBe("revoked");
    expect(useShiftPlannerStore.getState().swapRequests).toEqual(swapBefore);
    expect(snapshotExternalMarkers()).toEqual(before);

    // Persist keys remain isolated
    expect(localStorage.getItem(MITRA_LABS_LS)).toBeTruthy();
    const shiftRaw = localStorage.getItem(SHIFT_PLANNER_LS);
    if (shiftRaw) {
      const parsed = JSON.parse(shiftRaw) as { state?: { swapRequests?: unknown[] } };
      expect(parsed.state?.swapRequests ?? []).toEqual([]);
    }
  });

  it("Shift Planner swap approve does not mutate Mitra Labs, Career Pro, HR, Payroll, or WorkVault keys", () => {
    const before = snapshotExternalMarkers();
    const mitraBefore = useMitraLabsStore.getState().passes;

    const startAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const record = useShiftPlannerStore.getState().addSwapRequest({
      weekId: "2026-W32",
      shiftInstanceId: "inst_integration_am",
      initiatorId: "worker_a",
      peerId: "worker_b",
      siteId: "site_main",
      roleTag: "floor",
      date: "2026-08-06",
      startAt,
      peerRoleTag: "floor",
    });

    useShiftPlannerStore.getState().updateSwapStatus(record.id, "peer_accepted");
    useShiftPlannerStore.getState().updateSwapStatus(record.id, "manager_approved");

    const approved = useShiftPlannerStore.getState().swapRequests.find((r) => r.id === record.id);
    expect(approved?.status).toBe("manager_approved");
    expect(useMitraLabsStore.getState().passes).toEqual(mitraBefore);
    expect(snapshotExternalMarkers()).toEqual(before);

    // WorkVault has no useWorkVaultStore Zustand slice — boundary is LS key isolation.
    expect(localStorage.getItem(VAULT_CAREER_HISTORY_KEY)).toBe(before.vaultCareer);
    expect(localStorage.getItem(VAULT_PLANNER_HISTORY_KEY)).toBe(before.vaultPlanner);
    expect(localStorage.getItem(HR_ATTENDANCE_MARKER_KEY)).toBe(before.hrAttendance);
    expect(localStorage.getItem(PAYROLL_MARKER_KEY)).toBe(before.payroll);
  });
});

describe("system integration — security & privacy validation", () => {
  beforeEach(() => {
    localStorage.clear();
    useMitraLabsStore.setState({ passes: [], activeFilter: "all" });
    useShiftPlannerStore.setState({ swapRequests: [] });
  });

  it("QR / verify payload is opaque URL only — no guest or candidate PII leakage", () => {
    const pass = useMitraLabsStore.getState().createPass({
      issuerId: "er_privacy",
      guestName: GUEST_PII.guestName,
      guestContact: GUEST_PII.guestContact,
      candidateRef: GUEST_PII.candidateRef,
      venue: { name: "Venue Label Hidden", address: "Address Line Hidden" },
      purpose: "event",
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const payload = buildVerificationUrl(pass.passToken);
    expect(payload).toContain(MITRA_LABS_VERIFY_PATH);
    expect(payload).toContain(encodeURIComponent(pass.passToken));

    const lower = payload.toLowerCase();
    expect(lower).not.toContain(GUEST_PII.guestName.toLowerCase());
    expect(lower).not.toContain("sensitive");
    expect(lower).not.toContain(GUEST_PII.guestContact.toLowerCase());
    expect(lower).not.toContain(GUEST_PII.candidateRef.toLowerCase());
    expect(lower).not.toContain("address line hidden");
    expect(lower).not.toContain("venue label hidden");
  });

  it("enforces Shift Planner 24h lock and max 3 swaps per calendar month", () => {
    expect(isShiftLockedForSwap(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString())).toBe(
      true,
    );
    expect(isShiftLockedForSwap(new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString())).toBe(
      false,
    );

    const month = "2026-08";
    const swaps = [1, 2, 3].map((n) => ({
      id: `s${n}`,
      weekId: "2026-W32",
      shiftInstanceId: `inst_${n}`,
      initiatorId: "ee_limit",
      peerId: "peer_x",
      siteId: "site_main",
      roleTag: "floor",
      date: `${month}-0${n}`,
      startAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      status: "requested" as const,
      createdAt: n,
      updatedAt: n,
    }));

    expect(SWAP_MAX_PER_MONTH).toBe(3);
    expect(hasExceededMonthlyLimit("ee_limit", swaps, `${month}-20`)).toBe(true);
    expect(hasExceededMonthlyLimit("ee_limit", swaps.slice(0, 2), `${month}-20`)).toBe(false);
    expect(
      hasExceededMonthlyLimit(
        "ee_limit",
        [
          ...swaps.slice(0, 2),
          { ...swaps[2]!, status: "rejected" as const },
        ],
        `${month}-20`,
      ),
    ).toBe(false);
  });
});
