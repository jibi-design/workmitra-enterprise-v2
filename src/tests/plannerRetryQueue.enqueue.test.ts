/**
 * Planner T1-3 — cancel/broadcast failures enqueue into wm_retry_queue_v1
 * Vitest — run: npm test -- src/tests/plannerRetryQueue.enqueue.test.ts
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearShiftRetryDeadLetter,
  clearShiftRetryQueue,
  peekShiftRetryQueue,
} from "../shared/shift/shiftRetryQueue";

vi.mock("../features/shared/planner/plannerEmployeeBridge", () => ({
  plannerEmployeeNotifications: {
    planCancelled: vi.fn(() => {
      throw new Error("notify_pending_down");
    }),
    planCancelledConfirmedWorker: vi.fn(),
    crewBroadcast: vi.fn(),
  },
  plannerDiarySyncService: {
    markPlanCancelled: vi.fn(),
  },
}));

vi.mock("../features/shared/planner/ports/plannerLegacyShiftBridge", () => ({
  getEmployerShiftPosts: vi.fn(() => []),
  updateEmployerShiftPost: vi.fn(),
  readEmployeeApplications: vi.fn(() => [
    {
      id: "app_pending",
      postId: "post_1",
      planId: "plan_retry_1",
      status: "applied",
      createdAt: 1,
      profileSnapshot: { uniqueId: "ML-W1", fullName: "Worker" },
      selectedDates: [],
      mustHaveAnswers: {},
      goodToHaveAnswers: {},
      notes: {},
    },
  ]),
  writeEmployeeApplications: vi.fn(),
  markEmployeeWorkspaceCancelled: vi.fn(),
  findWorkspaceIdForPostAndWorker: vi.fn(),
  broadcastToEmployeeWorkspace: vi.fn(() => {
    throw new Error("broadcast_down");
  }),
  readEmployeeWorkspaces: vi.fn(() => [{ id: "ws_1", postId: "post_crew_1", workerMlId: "ML-W1" }]),
}));

vi.mock("../features/employer/planner/storage/demandPlannerStorage", () => ({
  demandPlannerStorage: {
    getById: vi.fn((planId: string) =>
      planId === "plan_retry_1"
        ? {
            id: "plan_retry_1",
            name: "Retry Plan",
            status: "active",
            slots: [],
            legalEntityMlId: "ML-ENT",
            siteManagerId: undefined,
          }
        : null,
    ),
    cancel: vi.fn(),
  },
}));

vi.mock("../features/employer/planner/storage/plannerPublicIndex.storage", () => ({
  plannerPublicIndex: { cancel: vi.fn() },
}));

vi.mock("../features/employer/planner/storage/plannerAuditLog.storage", () => ({
  appendPlannerAudit: vi.fn(),
}));

vi.mock("../features/shared/planner/plannerVault", () => ({
  recordPlannerOffboardInVault: vi.fn(),
}));

vi.mock("../features/employer/planner/storage/planBroadcastGroup.storage", () => ({
  planBroadcastGroupStorage: {
    getByPlanId: vi.fn(() => ({
      planId: "plan_retry_1",
      planName: "Retry Plan",
      memberWorkspaceIds: ["ws_1"],
    })),
    ensureGroup: vi.fn(),
    enrollWorkspace: vi.fn(),
    unenrollWorkspace: vi.fn(),
  },
}));

describe("Planner T1-3 — retry queue enqueue", () => {
  beforeEach(() => {
    clearShiftRetryQueue();
    clearShiftRetryDeadLetter();
    vi.clearAllMocks();
  });

  it("enqueues planner_cancel_notify when pending cancel notification fails", async () => {
    const { cancelActivePlan } =
      await import("../features/employer/planner/services/plannerCancel.service");
    const result = cancelActivePlan("plan_retry_1", "e2e");
    expect(result.ok).toBe(true);

    const queued = peekShiftRetryQueue();
    expect(queued.some((q) => q.op === "planner_cancel_notify")).toBe(true);
    const item = queued.find((q) => q.op === "planner_cancel_notify");
    expect(item?.context.domain).toBe("planner");
    expect(item?.context.step).toBe("plan_cancelled_pending");
    expect(item?.context.planId).toBe("plan_retry_1");
    expect(item?.lastError).toContain("notify_pending_down");
  });

  it("enqueues planner_crew_broadcast when workspace delivery throws", async () => {
    const { broadcastToPlanCrew } =
      await import("../features/employer/planner/services/planBroadcast.service");
    const result = broadcastToPlanCrew("plan_retry_1", "Hello", "Body");
    expect(result.ok).toBe(false);

    const queued = peekShiftRetryQueue();
    expect(queued.some((q) => q.op === "planner_crew_broadcast")).toBe(true);
    const item = queued.find((q) => q.op === "planner_crew_broadcast");
    expect(item?.context.domain).toBe("planner");
    expect(item?.context.step).toBe("delivery_failed");
    expect(item?.context.workspaceId).toBe("ws_1");
    expect(item?.context.postId).toBe("post_crew_1");
    expect(item?.lastError).toContain("broadcast_down");
  });
});
