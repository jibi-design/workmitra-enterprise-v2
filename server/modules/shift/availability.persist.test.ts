import { describe, expect, it } from "vitest";
import { parseCommuteRadius } from "../location/commuteRadius.js";
import { parsePincode } from "../location/pincode.js";
import { sanitizeSelectedDates } from "./availability.dates.js";
import { availabilityService } from "./availability.service.js";
import { availabilityMemoryStore } from "./availability.store.js";

describe("availability location persist", () => {
  it("stores basePincode and commuteRadius on upsert", async () => {
    availabilityMemoryStore.reset();
    const saved = await availabilityService.upsert(null, {
      workerMlId: "wm_test_worker",
      selectedDates: sanitizeSelectedDates(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        }).slice(0, 1),
      ),
      basePincode: "670001",
      commuteRadius: 15,
    });
    expect(saved.basePincode).toBe("670001");
    expect(saved.commuteRadius).toBe(15);
    expect(parsePincode(saved.basePincode)).toBe("670001");
    expect(parseCommuteRadius(saved.commuteRadius)).toBe(15);
  });

  it("clears broadcast when no dates remain but keeps location on mine", async () => {
    availabilityMemoryStore.reset();
    await availabilityService.upsert(null, {
      workerMlId: "wm_test_worker",
      selectedDates: [],
      basePincode: "670001",
      commuteRadius: 0,
    });
    const mine = await availabilityService.getMine(null, "wm_test_worker");
    expect(mine.selectedDates).toEqual([]);
    expect(mine.basePincode).toBe("670001");
    expect(mine.commuteRadius).toBe(0);
  });

  it("does not leak pincode on public pool items", async () => {
    availabilityMemoryStore.reset();
    const today = sanitizeSelectedDates([
      (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      })(),
    ]);
    await availabilityService.upsert(null, {
      workerMlId: "wm_test_worker",
      selectedDates: today,
      basePincode: "670001",
      commuteRadius: 10,
      city: "Kannur",
    });
    const pool = await availabilityService.publicPool();
    expect(JSON.stringify(pool)).not.toContain("670001");
    expect(pool.items[0]?.freeDayCount).toBe(today.length);
  });
});
