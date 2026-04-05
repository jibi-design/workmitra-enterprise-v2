// src/shared/utils/__tests__/dataExportService.test.ts
// Phase B — Data Export/Import: validation, import, role check, version gate.

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  validateImportFile,
  importData,
  formatExportDate,
} from "../dataExportService";
import type { ExportPayload } from "../dataExportService";

/* ── Helper: Create a mock File from payload ── */
function makeFile(payload: Record<string, unknown>, name = "backup.json"): File {
  const text = JSON.stringify(payload);
  return new File([text], name, { type: "application/json" });
}

function makeValidPayload(overrides?: Partial<ExportPayload>): ExportPayload {
  return {
    app: "WorkMitra",
    version: "1.0",
    exportedAt: Date.now(),
    role: "employee",
    keyCount: 2,
    data: { key1: "val1", key2: "val2" },
    ...overrides,
  };
}

/* ── Setup ── */
beforeEach(() => {
  localStorage.clear();
  // Set default role as employee
  localStorage.setItem("wm_app_role_v1", "employee");
});

afterEach(() => { vi.restoreAllMocks(); });

/* ═══ Validate Import File ═══ */
describe("validateImportFile", () => {
  it("validates a correct backup file", async () => {
    const file = makeFile(makeValidPayload());
    const result = await validateImportFile(file);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.role).toBe("employee");
      expect(result.keyCount).toBe(2);
    }
  });

  it("rejects non-JSON file extension", async () => {
    const file = new File(["data"], "backup.txt", { type: "text/plain" });
    const result = await validateImportFile(file);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("JSON");
  });

  it("rejects non-WorkMitra file", async () => {
    const file = makeFile({ app: "OtherApp", version: "1.0" });
    const result = await validateImportFile(file);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("not a WorkMitra");
  });

  it("rejects wrong version", async () => {
    const file = makeFile(makeValidPayload({ version: "0.5" as never }));
    const result = await validateImportFile(file);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("older version");
  });

  it("rejects role mismatch (employer backup for employee account)", async () => {
    const file = makeFile(makeValidPayload({ role: "employer" }));
    const result = await validateImportFile(file);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("employer");
  });

  it("accepts matching role", async () => {
    localStorage.setItem("wm_app_role_v1", "employer");
    const file = makeFile(makeValidPayload({ role: "employer" }));
    const result = await validateImportFile(file);

    expect(result.valid).toBe(true);
  });

  it("rejects invalid JSON content", async () => {
    const file = new File(["NOT{JSON"], "backup.json", { type: "application/json" });
    const result = await validateImportFile(file);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("read");
  });

  it("rejects non-object JSON", async () => {
    const file = new File(['"just a string"'], "backup.json", { type: "application/json" });
    const result = await validateImportFile(file);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain("Invalid");
  });
});

/* ═══ Import Data ═══ */
describe("importData", () => {
  it("imports valid backup and restores keys", async () => {
    localStorage.setItem("existing_key", "should_be_cleared");
    const payload = makeValidPayload({ data: { restored_a: "v1", restored_b: "v2" } });
    const file = makeFile(payload);

    const result = await importData(file);

    expect(result.success).toBe(true);
    if (result.success) expect(result.keysRestored).toBe(2);
    expect(localStorage.getItem("restored_a")).toBe("v1");
    expect(localStorage.getItem("restored_b")).toBe("v2");
    // Original key should be cleared (atomic replace)
    expect(localStorage.getItem("existing_key")).toBeNull();
  });

  it("rejects invalid app ID", async () => {
    const file = makeFile({ app: "FakeApp", version: "1.0", data: {} });
    const result = await importData(file);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toContain("Invalid");
  });

  it("rejects wrong version", async () => {
    const file = makeFile({ app: "WorkMitra", version: "0.1", data: {} });
    const result = await importData(file);

    expect(result.success).toBe(false);
  });

  it("rejects backup with null data", async () => {
    const file = makeFile({ app: "WorkMitra", version: "1.0", data: null });
    const result = await importData(file);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toContain("no data");
  });

  it("handles corrupted file gracefully", async () => {
    const file = new File(["BROKEN"], "backup.json", { type: "application/json" });
    const result = await importData(file);

    expect(result.success).toBe(false);
  });

  it("skips non-string values in data", async () => {
    const payload = makeValidPayload({
      data: { good: "value", bad: 123 as never },
    });
    const file = makeFile(payload);
    const result = await importData(file);

    expect(result.success).toBe(true);
    if (result.success) expect(result.keysRestored).toBe(1);
    expect(localStorage.getItem("good")).toBe("value");
  });
});

/* ═══ Format Export Date ═══ */
describe("formatExportDate", () => {
  it("returns readable date string", () => {
    const ts = new Date("2026-04-01T14:30:00Z").getTime();
    const result = formatExportDate(ts);
    expect(result).toContain("2026");
    expect(result).toMatch(/April|Apr/);
  });

  it("handles epoch 0", () => {
    const result = formatExportDate(0);
    expect(result).toBeTruthy();
    expect(result).toContain("1970");
  });
});