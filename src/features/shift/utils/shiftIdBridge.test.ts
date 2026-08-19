import { afterEach, describe, expect, it } from "vitest";
import {
  expandShiftPostIdAliases,
  shiftPostIdBridge,
  shiftPostIdsMatch,
} from "./shiftIdBridge";

const SERVER = "5d55b0af-af74-4d69-9ee2-d695459fd592";
const LOCAL = "post_lab_local_1";

afterEach(() => {
  localStorage.removeItem("wm_shift_post_id_bridge_v1");
});

describe("shiftPostIdsMatch", () => {
  it("matches exact ids", () => {
    expect(shiftPostIdsMatch(SERVER, SERVER)).toBe(true);
  });

  it("matches local and server ids after bridge upsert", () => {
    shiftPostIdBridge.upsert(LOCAL, SERVER);
    expect(shiftPostIdsMatch(LOCAL, SERVER)).toBe(true);
    expect(shiftPostIdsMatch(SERVER, LOCAL)).toBe(true);
    expect(expandShiftPostIdAliases(LOCAL)).toEqual(expect.arrayContaining([LOCAL, SERVER]));
  });

  it("does not match unrelated ids", () => {
    expect(shiftPostIdsMatch(LOCAL, SERVER)).toBe(false);
  });
});
