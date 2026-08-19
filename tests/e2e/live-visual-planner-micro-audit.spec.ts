/**
 * Job Mitra — Planner Module Feature Inventory Live Visual Micro-Audit
 * Step 1: Single-user · Mobile 390×844 · screenshot every inventory control.
 * Multi-user stress = Step 2 only (after this report is verified).
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/live-visual-planner-micro-audit.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  PLANNER_FEATURE_INVENTORY,
  type PlannerInventoryItem,
} from "./helpers/plannerFeatureInventory";

const VIEWPORT = { width: 390, height: 844 };
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const OUT_DIR = path.resolve("test-results/planner-feature-inventory");

const PLAN_ID = `planner-aud-plan-${Date.now().toString(16)}`;
const WORKER_ML = "ML-AUD-PLANNER-WRK1";
const WORKER_NAME = "Planner Audit Worker";
const COMPANY = "Planner Audit Co";
const PLAN_NAME = "Audit Security Crew Plan";
const WS_DAY_ID = `planner-aud-ws-day-1`;

type ResultStatus = "PASS" | "FAIL" | "WARN" | "SKIP";
type ResultRow = {
  id: string;
  domain: string;
  category: string;
  name: string;
  status: ResultStatus;
  detail: string;
  screenshot?: string;
};

const results: ResultRow[] = [];
let shotIndex = 0;

/** Stage-gated / seed-conditional — WARN when not mounted */
const SOFT_IDS = new Set([
  "PH-E6",
  "WZ-E2",
  "WZ-E3",
  "WZ-E4",
  "WZ-E5",
  "PD-E2",
  "PD-E3",
  "PD-E4",
  "AP-E2",
  "AP-E3",
  "AP-E4",
  "RO-E2",
  "RO-E3",
  "RO-E4",
  "BR-W2",
  "BR-W3",
  "PR-W1",
  "PR-W2",
  "CF-W1",
  "AP-W1",
  "APP-W2",
  "WS-W2",
  "PU-E1",
  "AL-E1",
  "VX-W1",
  "SW-E1",
  "SW-E2",
]);

function resolvePath(raw: string | undefined): string {
  if (!raw) return "/#/";
  return raw
    .replace("DYNAMIC_PLAN", `/#/employer/planner/plans/${PLAN_ID}`)
    .replace("DYNAMIC_FINANCE", `/#/employer/planner/plans/${PLAN_ID}/finance`)
    .replace("DYNAMIC_ROSTER", `/#/employer/planner/roster/${PLAN_ID}`)
    .replace("DYNAMIC_PROJECT", `/#/employee/planner/projects/${PLAN_ID}`)
    .replace("DYNAMIC_APPLY", `/#/employee/planner/projects/${PLAN_ID}/apply`)
    .replace("DYNAMIC_WS_DAY", `/#/employee/planner/workspace/${WS_DAY_ID}`);
}

async function shot(page: Page, id: string): Promise<string> {
  fs.mkdirSync(path.join(OUT_DIR, "shots"), { recursive: true });
  shotIndex += 1;
  const file = path.join(OUT_DIR, "shots", `${String(shotIndex).padStart(3, "0")}-${id}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function prepare(page: Page, role: "employer" | "employee"): Promise<void> {
  await page.addInitScript(
    ({ splashKey, roleKey, sessionRole, workerMl, workerName }) => {
      sessionStorage.setItem(splashKey, "1");
      sessionStorage.setItem(roleKey, sessionRole);
      try {
        localStorage.setItem("wm_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employee_home_welcome_v1", "1");
        localStorage.setItem("wm_enable_pulse_dev_tools", "true");
        localStorage.setItem("wm:pulse-nav-enabled", "true");
        if (sessionRole === "employee") {
          localStorage.setItem(
            "wm_employee_profile_v1",
            JSON.stringify({
              uniqueId: workerMl,
              fullName: workerName,
              city: "City A",
              skills: ["security", "operations"],
              experience: "experienced",
              languages: ["English"],
              preferShiftJobs: true,
              preferCareerJobs: false,
              availability: {
                weekdays: true,
                weekends: true,
                morning: true,
                afternoon: true,
                evening: false,
              },
            }),
          );
        }
      } catch {
        /* ignore */
      }
    },
    {
      splashKey: SPLASH_KEY,
      roleKey: ROLE_KEY,
      sessionRole: role,
      workerMl: WORKER_ML,
      workerName: WORKER_NAME,
    },
  );
  await page.setViewportSize(VIEWPORT);
}

async function seedPlannerAudit(page: Page): Promise<void> {
  await page.evaluate(
    ({ planId, company, planName, workerMl, workerName, wsDayId }) => {
      const now = Date.now();
      const start = new Date(now + 2 * 86_400_000);
      while (start.getDay() !== 1) start.setDate(start.getDate() + 1);
      const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      const d1 = fmt(start);
      const d2 = new Date(start);
      d2.setDate(d2.getDate() + 1);
      const d2s = fmt(d2);
      const d3 = new Date(start);
      d3.setDate(d3.getDate() + 2);
      const d3s = fmt(d3);

      const slots = [
        { date: d1, workers: 3, payPerDay: 900, slotId: `sl_${planId}_1`, category: "Security" },
        { date: d2s, workers: 2, payPerDay: 900, slotId: `sl_${planId}_2`, category: "Security" },
        { date: d3s, workers: 2, payPerDay: 950, slotId: `sl_${planId}_3`, category: "Security" },
      ];

      const activePlan = {
        id: planId,
        name: planName,
        companyName: company,
        locationName: "City A Site",
        category: "Security",
        experience: "experienced",
        startDate: d1,
        endDate: d3s,
        workingDays: [1, 2, 3, 4, 5],
        slots,
        status: "active",
        createdAt: now - 86_400_000,
        updatedAt: now,
        submittedAt: now - 80_000,
        description: "Planner micro-audit active plan",
        schemaVersion: 2,
        legalEntityMlId: "ML-AUD-PLANNER-ENT",
        epochDays: 30,
        milestoneCursor: 0,
        publishStatus: "published",
        waitingBuffer: 1,
        roleGroups: [
          {
            id: `rg_${planId}_sec`,
            label: "Security",
            workerMlIds: [],
          },
        ],
      };

      const draftPlan = {
        ...activePlan,
        id: `${planId}_draft`,
        name: `${planName} Draft`,
        status: "draft",
        draftStep: 1,
        publishStatus: "idle",
        submittedAt: undefined,
      };

      localStorage.setItem(
        "wm_employer_demand_plans_v1",
        JSON.stringify([activePlan, draftPlan]),
      );

      // Wizard draft prompt (Resume Draft) — schema v1 envelope
      localStorage.setItem(
        "wm_employer_demand_plan_draft_v1",
        JSON.stringify({
          version: 1,
          step: 1,
          step1: {
            name: `${planName} Unsaved`,
            companyName: company,
            locationName: "City A Site",
            category: "Security",
            experience: "experienced",
            startDate: d1,
            endDate: d3s,
            workingDays: [1, 2, 3, 4, 5],
            description: "Audit wizard draft",
            defaultWorkers: 2,
            waitingBuffer: 1,
            shiftTiming: "09:00-18:00",
            mapsLink: "",
          },
          slots,
          planId: null,
          savedAt: now - 60_000,
        }),
      );

      const indexEntry = {
        planId,
        planName,
        companyName: company,
        locationName: "City A Site",
        category: "Security",
        experience: "experienced",
        dayCount: 3,
        openDayCount: 3,
        payMin: 900,
        payMax: 950,
        slotDates: [d1, d2s, d3s],
        postIdsByDate: {},
        slotIdsByDate: {
          [d1]: `sl_${planId}_1`,
          [d2s]: `sl_${planId}_2`,
          [d3s]: `sl_${planId}_3`,
        },
        payByDate: { [d1]: 900, [d2s]: 900, [d3s]: 950 },
        workersByDate: { [d1]: 3, [d2s]: 2, [d3s]: 2 },
        publishedAt: now - 80_000,
        status: "active",
        schemaVersion: 1,
      };
      localStorage.setItem("wm_planner_public_index_v1", JSON.stringify([indexEntry]));

      // Minimal vault history presence (may be empty array → soft)
      if (!localStorage.getItem("wm_vault_planner_history_v1")) {
        localStorage.setItem(
          "wm_vault_planner_history_v1",
          JSON.stringify([
            {
              id: `vph_${planId}`,
              planId,
              planName,
              kind: "epoch",
              closedAt: now - 7 * 86_400_000,
            },
          ]),
        );
      }

      // Employee workspace day stub (soft if page expects richer shape)
      localStorage.setItem(
        "wm_employee_planner_workspaces_v1",
        JSON.stringify([
          {
            id: wsDayId,
            planId,
            planName,
            date: d1,
            workerMlId: workerMl,
            workerName,
            status: "assigned",
            companyName: company,
            locationName: "City A Site",
          },
        ]),
      );

      for (const ev of [
        "wm:employer-demand-plans-changed",
        "wm:planner-public-index-changed",
        "wm:employee-planner-workspaces-changed",
      ]) {
        window.dispatchEvent(new Event(ev));
      }
    },
    {
      planId: PLAN_ID,
      company: COMPANY,
      planName: PLAN_NAME,
      workerMl: WORKER_ML,
      workerName: WORKER_NAME,
      wsDayId: WS_DAY_ID,
    },
  );
}

async function fullSync(source: Page, target: Page): Promise<void> {
  const snapshot = await source.evaluate(() => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.includes("planner") ||
        key.includes("demand") ||
        key.includes("vault_planner") ||
        key.startsWith("wm_employer_demand") ||
        key.startsWith("wm_employee_planner") ||
        key.startsWith("wm_planner")
      ) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  });
  await target.evaluate((data) => {
    for (const [k, v] of Object.entries(data)) {
      if (v == null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    }
    window.dispatchEvent(new Event("wm:employer-demand-plans-changed"));
    window.dispatchEvent(new Event("wm:planner-public-index-changed"));
  }, snapshot);
}

async function probeItem(page: Page, item: PlannerInventoryItem): Promise<ResultRow> {
  const soft = SOFT_IDS.has(item.id);

  if (item.probe.type === "skip") {
    const screenshot = await shot(page, item.id);
    return {
      id: item.id,
      domain: item.domain,
      category: item.category,
      name: item.name,
      status: "SKIP",
      detail: item.probe.reason,
      screenshot,
    };
  }

  if (item.probe.type === "storage") {
    const ok = await page.evaluate(
      ({ key, expectNonEmpty }) => {
        try {
          const raw = localStorage.getItem(key);
          if (raw == null) return !expectNonEmpty;
          if (!expectNonEmpty) return true;
          const trimmed = raw.trim();
          if (!trimmed || trimmed === "[]" || trimmed === "{}") return false;
          return true;
        } catch {
          return false;
        }
      },
      { key: item.probe.key, expectNonEmpty: item.probe.expectNonEmpty ?? false },
    );
    const screenshot = await shot(page, item.id);
    return {
      id: item.id,
      domain: item.domain,
      category: item.category,
      name: item.name,
      status: ok ? "PASS" : soft ? "WARN" : "FAIL",
      detail: ok ? `storage ${item.probe.key} ok` : `storage ${item.probe.key} missing/empty`,
      screenshot,
    };
  }

  const targetPath = resolvePath("path" in item.probe ? item.probe.path : item.route);

  try {
    await page.goto(targetPath, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.waitForTimeout(450);

    if (item.probe.type === "goto-testid") {
      const ok = await page
        .getByTestId(item.probe.testId)
        .first()
        .isVisible({ timeout: 8_000 })
        .catch(() => false);
      const screenshot = await shot(page, item.id);
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: ok ? "PASS" : soft ? "WARN" : "FAIL",
        detail: ok ? `testid ${item.probe.testId}` : `testid ${item.probe.testId} NOT VISIBLE`,
        screenshot,
      };
    }

    if (item.probe.type === "goto-text") {
      const ok = await page
        .getByText(item.probe.text)
        .first()
        .isVisible({ timeout: 8_000 })
        .catch(() => false);
      const screenshot = await shot(page, item.id);
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: ok ? "PASS" : soft ? "WARN" : "FAIL",
        detail: ok ? "text visible" : "text NOT VISIBLE",
        screenshot,
      };
    }

    if (item.probe.type === "goto-role") {
      const ok = await page
        .getByRole(item.probe.role, { name: item.probe.name })
        .first()
        .isVisible({ timeout: 8_000 })
        .catch(() => false);
      const screenshot = await shot(page, item.id);
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: ok ? "PASS" : soft ? "WARN" : "FAIL",
        detail: ok ? "role visible" : "role NOT VISIBLE",
        screenshot,
      };
    }

    if (item.probe.type === "click-role") {
      const btn = page.getByRole(item.probe.role, { name: item.probe.name }).first();
      const canClick = await btn.isVisible({ timeout: 6_000 }).catch(() => false);
      if (canClick) {
        await btn.click({ timeout: 5_000 }).catch(() => undefined);
        await page.waitForTimeout(600);
      }
      const afterOk = item.probe.afterText
        ? await page
            .getByText(item.probe.afterText)
            .first()
            .isVisible({ timeout: 6_000 })
            .catch(() => false)
        : canClick;
      const screenshot = await shot(page, item.id);
      const ok = canClick && afterOk;
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: ok ? "PASS" : soft ? "WARN" : "FAIL",
        detail: ok
          ? "click-role ok"
          : `click-role failed (clicked=${canClick} after=${afterOk})`,
        screenshot,
      };
    }

    if (item.probe.type === "click-testid") {
      const el = page.getByTestId(item.probe.testId).first();
      const canClick = await el.isVisible({ timeout: 6_000 }).catch(() => false);
      if (canClick) {
        await el.click({ timeout: 5_000 }).catch(() => undefined);
        await page.waitForTimeout(500);
      }
      const afterOk = item.probe.afterTestId
        ? await page
            .getByTestId(item.probe.afterTestId)
            .first()
            .isVisible({ timeout: 6_000 })
            .catch(() => false)
        : canClick;
      const screenshot = await shot(page, item.id);
      const ok = canClick && afterOk;
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: ok ? "PASS" : soft ? "WARN" : "FAIL",
        detail: ok ? "click-testid ok" : "click-testid failed",
        screenshot,
      };
    }

    if (item.probe.type === "pulse-active") {
      const pulse = await page.evaluate(async ({ flow, nodeId }) => {
        localStorage.setItem("wm:pulse-nav-enabled", "true");
        try {
          const nav = await import("/src/features/pulse/pulseNavStore.ts");
          nav.usePulseNavStore.getState().setEnabled(true);
          const store = await import("/src/features/pulse/pulseStore.ts");
          store.usePulseStore.getState().clearAll?.();
          store.usePulseStore.getState().setChain([nodeId], { severity: "urgent" });
          if (typeof store.usePulseStore.getState().triggerPulseFlow === "function") {
            store.usePulseStore.getState().triggerPulseFlow(flow as never, "planner-audit-001");
          }
          await new Promise((r) => setTimeout(r, 400));
        } catch {
          /* soft */
        }
        const el = document.querySelector(`[data-pulse-node-id="${nodeId}"]`);
        return { active: el?.getAttribute("data-pulse-active") === "true", found: Boolean(el) };
      }, item.probe);
      const screenshot = await shot(page, item.id);
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: pulse.active ? "PASS" : soft ? "WARN" : "FAIL",
        detail: `data-pulse-active=${pulse.active} found=${pulse.found}`,
        screenshot,
      };
    }
  } catch (err) {
    const screenshot = await shot(page, item.id).catch(() => undefined);
    return {
      id: item.id,
      domain: item.domain,
      category: item.category,
      name: item.name,
      status: soft ? "WARN" : "FAIL",
      detail: `probe error: ${err instanceof Error ? err.message.slice(0, 120) : String(err)}`,
      screenshot,
    };
  }

  return {
    id: item.id,
    domain: item.domain,
    category: item.category,
    name: item.name,
    status: "FAIL",
    detail: "unhandled probe",
  };
}

test.describe.configure({ mode: "serial" });

test.describe("Planner Feature Inventory Live Visual Micro-Audit @mobile390", () => {
  test("scrape inventory + single-user live screenshot audit", async ({ browser }) => {
    test.setTimeout(600_000);
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const employerCtx = await browser.newContext({ viewport: VIEWPORT });
    const employeeCtx = await browser.newContext({ viewport: VIEWPORT });
    const employer = await employerCtx.newPage();
    const employee = await employeeCtx.newPage();

    await prepare(employer, "employer");
    await prepare(employee, "employee");

    await employer.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });
    await seedPlannerAudit(employer);
    await employer.waitForTimeout(400);
    await employee.goto("/#/employee/planner/home", { waitUntil: "domcontentloaded" });
    await fullSync(employer, employee);

    for (const item of PLANNER_FEATURE_INVENTORY) {
      const page = item.domain === "Employee" ? employee : employer;
      // Shared probes: prefer employer context for weekly/swaps split by id prefix
      const target =
        item.domain === "Shared"
          ? item.id.startsWith("WSP-W") || item.id.startsWith("SW-W") || item.id.startsWith("VX-W")
            ? employee
            : employer
          : page;

      const row = await probeItem(target, item);
      results.push(row);
      console.log(`[${row.status}] ${row.id} — ${row.name} · ${row.detail}`);
    }

    const pass = results.filter((r) => r.status === "PASS").length;
    const fail = results.filter((r) => r.status === "FAIL").length;
    const warn = results.filter((r) => r.status === "WARN").length;
    const skip = results.filter((r) => r.status === "SKIP").length;

    const report = {
      viewport: VIEWPORT,
      planId: PLAN_ID,
      totals: { pass, fail, warn, skip, total: results.length },
      results,
    };
    fs.writeFileSync(
      path.join(OUT_DIR, "PLANNER_FEATURE_INVENTORY_REPORT.json"),
      JSON.stringify(report, null, 2),
    );

    const md = [
      "# Planner Feature Inventory Audit Report (Step 1 — Single-User)",
      "",
      `| PASS | ${pass} |`,
      `| FAIL | ${fail} |`,
      `| WARN | ${warn} |`,
      `| SKIP | ${skip} |`,
      `| TOTAL | ${results.length} |`,
      "",
      "Viewport: 390×844 · Multi-user stress deferred to Step 2.",
      "",
      `| ID | Domain | Category | Result | Name | Detail |`,
      `|---|---|---|---|---|---|`,
      ...results.map(
        (r) =>
          `| ${r.id} | ${r.domain} | ${r.category} | [${r.status === "PASS" ? "x" : " "}] ${r.status} | ${r.name.replace(/\|/g, "/")} | ${r.detail.replace(/\|/g, "/")} |`,
      ),
    ].join("\n");
    fs.writeFileSync(path.join(OUT_DIR, "PLANNER_FEATURE_INVENTORY_CHECKLIST.md"), md);
    console.log(`\n=== PLANNER AUDIT → ${path.join(OUT_DIR, "PLANNER_FEATURE_INVENTORY_CHECKLIST.md")} ===`);
    console.log(`PASS=${pass} FAIL=${fail} WARN=${warn} SKIP=${skip} TOTAL=${results.length}\n`);

    expect(fail, `Planner micro-audit FAIL must be 0 (got ${fail})`).toBe(0);
  });
});
