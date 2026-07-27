/** Job Mitra | gapRetention.shared.test.ts | T3-1 mode guards */

import { afterEach, describe, expect, it } from "vitest";
import { resolveGapJobMode } from "../../server/jobs/gapRetention.shared.ts";

const keys = [
  "DRY_RUN",
  "GAP_DELETE_APPROVED",
  "DRY_RUN_TARGET_ENV",
  "AUTH_USER_SOURCE",
  "DATABASE_URL",
  "NODE_ENV",
  "RENDER_SERVICE_NAME",
  "CF_PAGES",
] as const;

const snapshot: Partial<Record<(typeof keys)[number], string | undefined>> = {};

afterEach(() => {
  for (const k of keys) {
    const prev = snapshot[k];
    if (prev === undefined) delete process.env[k];
    else process.env[k] = prev;
  }
});

function stash() {
  for (const k of keys) snapshot[k] = process.env[k];
}

describe("resolveGapJobMode", () => {
  it("defaults to dry_run true", () => {
    stash();
    process.env.AUTH_USER_SOURCE = "db";
    process.env.DATABASE_URL = "postgres://local/test";
    process.env.DRY_RUN_TARGET_ENV = "dev";
    delete process.env.DRY_RUN;
    delete process.env.GAP_DELETE_APPROVED;
    delete process.env.NODE_ENV;
    delete process.env.RENDER_SERVICE_NAME;
    delete process.env.CF_PAGES;

    const mode = resolveGapJobMode();
    expect(mode.dryRun).toBe(true);
    expect(mode.targetEnv).toBe("dev");
    expect(mode.jobRunId.length).toBeGreaterThan(10);
  });

  it("refuses live delete without GAP_DELETE_APPROVED", () => {
    stash();
    process.env.AUTH_USER_SOURCE = "db";
    process.env.DATABASE_URL = "postgres://local/test";
    process.env.DRY_RUN_TARGET_ENV = "dev";
    process.env.DRY_RUN = "false";
    delete process.env.GAP_DELETE_APPROVED;
    delete process.env.NODE_ENV;
    delete process.env.RENDER_SERVICE_NAME;
    delete process.env.CF_PAGES;

    expect(() => resolveGapJobMode()).toThrow(/GAP_DELETE_APPROVED/);
  });

  it("allows live mode only with approve flag", () => {
    stash();
    process.env.AUTH_USER_SOURCE = "db";
    process.env.DATABASE_URL = "postgres://local/test";
    process.env.DRY_RUN_TARGET_ENV = "staging";
    process.env.DRY_RUN = "false";
    process.env.GAP_DELETE_APPROVED = "1";
    delete process.env.NODE_ENV;
    delete process.env.RENDER_SERVICE_NAME;
    delete process.env.CF_PAGES;

    const mode = resolveGapJobMode();
    expect(mode.dryRun).toBe(false);
    expect(mode.targetEnv).toBe("staging");
  });
});
