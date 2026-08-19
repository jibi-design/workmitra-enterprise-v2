import { describe, expect, it } from "vitest";
import { countWorkersCoveringJobSite } from "./availability.match.js";
import type { AvailabilityBroadcastRecord } from "./availability.types.js";

function row(
  patch: Partial<AvailabilityBroadcastRecord> & Pick<AvailabilityBroadcastRecord, "workerUserId">,
): AvailabilityBroadcastRecord {
  return {
    workerMlId: patch.workerUserId,
    selectedDates: patch.selectedDates ?? [],
    basePincode: patch.basePincode ?? null,
    commuteRadiusKm: patch.commuteRadiusKm ?? 10,
    expiresAt: Date.now(),
    updatedAt: Date.now(),
    ...patch,
  };
}

describe("countWorkersCoveringJobSite", () => {
  const today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  it("returns 0 when employer pincode is missing (fail-closed)", () => {
    expect(
      countWorkersCoveringJobSite({
        jobPincode: "",
        broadcasts: [
          row({
            workerUserId: "w1",
            basePincode: "670001",
            commuteRadiusKm: 15,
            selectedDates: [today],
          }),
        ],
      }),
    ).toBe(0);
  });

  it("excludes workers with no base pincode", () => {
    expect(
      countWorkersCoveringJobSite({
        jobPincode: "670001",
        broadcasts: [
          row({
            workerUserId: "w1",
            basePincode: null,
            commuteRadiusKm: 15,
            selectedDates: [today],
          }),
        ],
      }),
    ).toBe(0);
  });

  it("matches the same pincode at 0 km radius", () => {
    expect(
      countWorkersCoveringJobSite({
        jobPincode: "670001",
        broadcasts: [
          row({
            workerUserId: "w1",
            basePincode: "670001",
            commuteRadiusKm: 0,
            selectedDates: [today],
          }),
        ],
      }),
    ).toBe(1);
  });
});
