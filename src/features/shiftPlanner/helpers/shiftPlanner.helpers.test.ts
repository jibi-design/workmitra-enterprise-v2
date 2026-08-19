import { describe, expect, it } from "vitest";
import {
  canSwapRoles,
  hasExceededMonthlyLimit,
  isShiftLockedForSwap,
} from "./shiftPlanner.helpers";
import type { ShiftSwapRecord } from "../storage/shiftSwap.storage";
import { CreateSwapRequestSchema } from "../validation/shiftSwap.schemas";

function swap(
  partial: Partial<ShiftSwapRecord> &
    Pick<ShiftSwapRecord, "id" | "initiatorId" | "date" | "status">,
): ShiftSwapRecord {
  return {
    weekId: "2026-W30",
    shiftInstanceId: "inst_1",
    peerId: "peer_1",
    siteId: "site_main",
    roleTag: "floor",
    startAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: 1,
    updatedAt: 1,
    ...partial,
  };
}

describe("shiftPlanner.helpers", () => {
  it("locks swaps when under 24h remain", () => {
    const soon = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const later = new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString();
    expect(isShiftLockedForSwap(soon)).toBe(true);
    expect(isShiftLockedForSwap(later)).toBe(false);
  });

  it("caps monthly swaps at 3 active records", () => {
    const swaps = [
      swap({ id: "1", initiatorId: "ee1", date: "2026-07-02", status: "requested" }),
      swap({ id: "2", initiatorId: "ee1", date: "2026-07-10", status: "peer_accepted" }),
      swap({ id: "3", initiatorId: "ee1", date: "2026-07-15", status: "manager_approved" }),
      swap({ id: "4", initiatorId: "ee1", date: "2026-07-20", status: "rejected" }),
    ];
    expect(hasExceededMonthlyLimit("ee1", swaps, "2026-07-22")).toBe(true);
    expect(hasExceededMonthlyLimit("ee1", swaps.slice(0, 2), "2026-07-22")).toBe(false);
  });

  it("requires same site and compatible roles", () => {
    expect(canSwapRoles("floor", "floor", "site_main", "site_main")).toBe(true);
    expect(canSwapRoles("barista", "barista_senior", "site_main", "site_main")).toBe(true);
    expect(canSwapRoles("floor", "bar", "site_main", "site_main")).toBe(false);
    expect(canSwapRoles("floor", "floor", "site_main", "site_other")).toBe(false);
  });
});

describe("CreateSwapRequestSchema", () => {
  it("rejects startAt under 24h notice", () => {
    const result = CreateSwapRequestSchema.safeParse({
      weekId: "2026-W30",
      shiftInstanceId: "inst_1",
      initiatorId: "a",
      peerId: "b",
      siteId: "site_main",
      roleTag: "floor",
      date: "2026-07-22",
      startAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid payload with 24h+ notice", () => {
    const result = CreateSwapRequestSchema.safeParse({
      weekId: "2026-W30",
      shiftInstanceId: "inst_1",
      initiatorId: "a",
      peerId: "b",
      siteId: "site_main",
      roleTag: "floor",
      date: "2026-07-25",
      startAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    });
    expect(result.success).toBe(true);
  });
});
