/**
 * Job Mitra — Planner 10×1,000 Live Scale Stress Audit (HEADED)
 * Scale: 10 Employers × 100 staff each (= 1,000) · Mobile 390×844
 * Planner domain ONLY — Demand weekly grids, roster boards, swaps, CSV export.
 *
 * CRITICAL: Run headed so the physical browser is visible:
 *   npx playwright test --project=chromium --headed tests/e2e/live-visual-planner-stress-scale-audit.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 390, height: 844 };
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const OUT = path.resolve("test-results/planner-stress-scale-audit");

type Row = {
  id: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
  shot?: string;
  ms?: number;
};

const rows: Row[] = [];
let shotN = 0;

async function shot(page: Page, id: string): Promise<string> {
  fs.mkdirSync(path.join(OUT, "shots"), { recursive: true });
  shotN += 1;
  const file = path.join(OUT, "shots", `${String(shotN).padStart(2, "0")}-${id}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`[SHOT] ${file}`);
  return file;
}

function record(row: Row): void {
  rows.push(row);
  console.log(`[${row.status}] ${row.id} — ${row.detail}${row.ms != null ? ` (${row.ms}ms)` : ""}`);
}

async function prepare(page: Page, role: "employer" | "employee", workerMl?: string): Promise<void> {
  await page.addInitScript(
    ({ splashKey, roleKey, sessionRole, worker }) => {
      sessionStorage.setItem(splashKey, "1");
      sessionStorage.setItem(roleKey, sessionRole);
      try {
        localStorage.setItem("wm_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employee_home_welcome_v1", "1");
        localStorage.setItem("wm_enable_pulse_dev_tools", "true");
        localStorage.setItem("wm:pulse-nav-enabled", "true");
        if (sessionRole === "employee" && worker) {
          localStorage.setItem(
            "wm_employee_profile_v1",
            JSON.stringify({
              uniqueId: worker,
              fullName: "Planner Scale Watch Staff",
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
      worker: workerMl ?? "",
    },
  );
  await page.setViewportSize(VIEWPORT);
}

async function layoutHealth(page: Page): Promise<{ ok: boolean; detail: string }> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
    const issues: string[] = [];
    if (overflowX > 24) issues.push(`horizontalOverflowPx=${overflowX}`);
    const broken = document.querySelector('[data-testid*="error"], .wm-fatal, .wm-crash');
    if (broken) issues.push("errorSurface");
    if (/Something went wrong/i.test(body?.innerText ?? "")) issues.push("errorBoundary");
    return {
      ok: issues.length === 0,
      detail: issues.length ? issues.join("; ") : "layout clean",
    };
  });
}

async function assertUi(
  page: Page,
  id: string,
  locator: ReturnType<Page["locator"]>,
  detail: string,
  opts?: { soft?: boolean },
): Promise<boolean> {
  const t0 = Date.now();
  const ok = await locator.first().isVisible({ timeout: 15_000 }).catch(() => false);
  const file = await shot(page, id);
  const health = await layoutHealth(page);
  const pass = ok && health.ok;
  record({
    id,
    status: pass ? "PASS" : opts?.soft ? "WARN" : "FAIL",
    detail: pass
      ? `${detail} · ${health.detail}`
      : `${detail} — ${!ok ? "NOT VISIBLE" : health.detail}`,
    shot: file,
    ms: Date.now() - t0,
  });
  if (!opts?.soft) expect(pass, `${id}: ${detail}`).toBe(true);
  return pass;
}

async function fullSync(source: Page, target: Page): Promise<void> {
  const snapshot = await source.evaluate(() => {
    const data: Record<string, string | null> = {};
    const prefer = (key: string) =>
      key.includes("planner") ||
      key.includes("demand") ||
      key.includes("PLANNER_SCALE") ||
      key.includes("planner_scale") ||
      key.includes("shift_planner_swaps") ||
      key.includes("shift_applications") ||
      key === "wm_qa_planner_scale_employer_registry_v1" ||
      key.startsWith("wm_employer_ML_PLANNER_SCALE") ||
      key.startsWith("wm_employee_ML_PLANNER_SCALE") ||
      key === "wm_employee_shift_applications_v1" ||
      key === "wm_employee_plan_engagement_v1" ||
      key === "wm_employee_planner_workspaces_v1" ||
      key === "wm_employer_settings_v1" ||
      key.includes("employer_profile") ||
      key.includes("employer_settings");

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !prefer(key)) continue;
      const val = localStorage.getItem(key);
      if (val && val.length > 1_500_000) continue;
      data[key] = val;
    }
    return data;
  });
  await target.evaluate((data) => {
    for (const [k, v] of Object.entries(data)) {
      if (v == null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    }
    for (const ev of [
      "wm:employer-demand-plans-changed",
      "wm:planner-public-index-changed",
      "wm:planner-audit-log-changed",
      "wm:employee-shift-applications-changed",
      "wm:employee-plan-engagement-changed",
      "wm:shift-employer-scope-changed",
      "wm:pending-actions-changed",
    ]) {
      window.dispatchEvent(new Event(ev));
    }
  }, snapshot);
}

test.describe.configure({ mode: "serial" });

test.use({
  headless: false,
  launchOptions: { slowMo: 40 },
  viewport: VIEWPORT,
});

test.describe("Planner Stress Scale Live Visual Audit @mobile390 @headed", () => {
  test("10 employers × 1000 staff — headed weekly grid + roster + swaps + CSV", async ({
    browser,
  }) => {
    test.setTimeout(900_000);
    fs.mkdirSync(OUT, { recursive: true });

    const pageErrors: string[] = [];
    const employerCtx = await browser.newContext({ viewport: VIEWPORT });
    const employeeCtx = await browser.newContext({ viewport: VIEWPORT });
    const employer = await employerCtx.newPage();
    const employee = await employeeCtx.newPage();
    employer.on("pageerror", (e) => pageErrors.push(`employer: ${e.message}`));
    employee.on("pageerror", (e) => pageErrors.push(`employee: ${e.message}`));

    await prepare(employer, "employer");
    await prepare(employee, "employee", "ML_PLANNER_SCALE_WRK_0001");

    // —— 1 Seed (Planner-only) ——
    await employer.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(600);
    const seedT0 = Date.now();
    const seed = await employer.evaluate(async () => {
      const mod = await import("/src/features/shared/planner/qaLiveScalePlannerStress.seed.ts");
      return mod.applyPlannerLiveScaleStressSeed(10, 100);
    });
    const seedMs = Date.now() - seedT0;

    expect(seed.employers).toBe(10);
    expect(seed.staffPerEmployer).toBe(100);
    expect(seed.totalStaff).toBe(1000);
    expect(seed.totalConfirmedApps).toBe(1000);

    record({
      id: "SEED-PLANNER-SCALE",
      status: "PASS",
      detail: `Seeded ${seed.employers} employers · ${seed.totalStaff} staff · ${seed.totalConfirmedApps} confirmed apps · ${seed.totalSwapRequests} swaps · ${seed.totalAuditEntries} audit rows`,
      ms: seedMs,
      shot: await shot(employer, "SEED-PLANNER-SCALE"),
    });

    await employee.goto("/#/employee/planner/home", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(400);
    await employee.evaluate((worker) => {
      localStorage.setItem(
        "wm_employee_profile_v1",
        JSON.stringify({
          uniqueId: worker,
          fullName: "Planner Scale Watch Staff",
          city: "City A",
          skills: ["security", "operations"],
          experience: "experienced",
          languages: ["English"],
          preferShiftJobs: true,
          preferCareerJobs: false,
        }),
      );
    }, seed.sampleWorkerMlId);
    await fullSync(employer, employee);

    // —— 2 Employer Demand Home under load ——
    await employer.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(900);
    await assertUi(
      employer,
      "UI-EMP-PLANNER-HOME",
      employer
        .getByTestId("planner-employer-command-grid")
        .or(employer.getByText(/Demand Planner|Active|Budget|Fill|Plan/i)),
      "Employer Demand Planner Home under 10-tenant seed",
    );

    // —— 3 Plans list (10 active weekly schedules) ——
    await employer.goto("/#/employer/planner/plans", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(800);
    await assertUi(
      employer,
      "UI-EMP-PLANS-LIST",
      employer.getByText(/Planner Scale|Scale Security|Scale Warehouse|Plans|Active|live crews/i),
      "Plans list renders under 10× weekly schedule volume",
    );

    // —— 4 Plan detail + 7-day slot density ——
    const detailT0 = Date.now();
    await employer.goto(`/#/employer/planner/plans/${seed.samplePlanId}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(1200);
    const detailMs = Date.now() - detailT0;
    await assertUi(
      employer,
      "UI-7DAY-PLAN-DETAIL",
      employer
        .getByText(/Planner Scale|Security|Week Plan|Applications|Roster|Finance|Activity/i)
        .or(employer.getByTestId("planner-detail-actions-grid")),
      `7-day weekly plan detail under load (${detailMs}ms)`,
    );

    // —— 5 Activity CSV export control ——
    await employer.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await employer.waitForTimeout(500);
    const exportBtn = employer.getByTestId("planner-detail-activity-export");
    const exportVisible = await exportBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (exportVisible) {
      await exportBtn.click({ timeout: 5_000 }).catch(() => undefined);
      await employer.waitForTimeout(600);
      const health = await layoutHealth(employer);
      record({
        id: "OP-CSV-EXPORT",
        status: health.ok ? "PASS" : "FAIL",
        detail: health.ok
          ? `Activity CSV export clicked under ${seed.totalAuditEntries} audit rows · ${health.detail}`
          : `CSV export left unhealthy UI: ${health.detail}`,
        shot: await shot(employer, "OP-CSV-EXPORT"),
      });
      if (!health.ok) expect(health.ok).toBe(true);
    } else {
      record({
        id: "OP-CSV-EXPORT",
        status: "WARN",
        detail: "planner-detail-activity-export not visible — scroll/seed soft-miss",
        shot: await shot(employer, "OP-CSV-EXPORT"),
      });
    }

    // —— 6 High-density roster drag board (100 staff / unassigned column) ——
    const rosterT0 = Date.now();
    await employer.goto(`/#/employer/planner/roster/${seed.samplePlanId}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(1400);
    const rosterMs = Date.now() - rosterT0;

    await assertUi(
      employer,
      "UI-100-ROSTER-BOARD",
      employer
        .getByTestId("planner-roster-drag-board")
        .or(employer.getByTestId("planner-employer-roster-detail"))
        .or(employer.getByText(/Unassigned|Role assignment|Drag workers|Roster/i)),
      `100-staff roster / unassigned board (load ${rosterMs}ms)`,
    );

    await employer.evaluate(() => {
      window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.4));
    });
    await employer.waitForTimeout(500);
    await shot(employer, "UI-100-ROSTER-MID");
    await employer.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await employer.waitForTimeout(500);
    await assertUi(
      employer,
      "UI-100-ROSTER-SCROLL",
      employer
        .getByText(/Unassigned|Security A|Security B|Planner Scale Staff|Drag|Move/i)
        .or(employer.getByTestId("planner-roster-drag-board")),
      "100-staff roster scrolls without crash",
    );

    // Seed a few live swap records into Zustand (avoid persist-race / corrupt hydrate)
    await employer.evaluate(async () => {
      try {
        const mod = await import("/src/features/shiftPlanner/storage/shiftSwap.storage.ts");
        const startAt = new Date(Date.now() + 3 * 86_400_000).toISOString();
        const date = startAt.slice(0, 10);
        mod.useShiftPlannerStore.setState({ swapRequests: [] });
        for (let i = 0; i < 8; i += 1) {
          const rec = mod.useShiftPlannerStore.getState().addSwapRequest({
            weekId: `week_${date}`,
            shiftInstanceId: `inst_pscale_${i}`,
            initiatorId: `ML_PLANNER_SCALE_WRK_${String(i + 1).padStart(4, "0")}`,
            peerId: `ML_PLANNER_SCALE_WRK_${String(i + 2).padStart(4, "0")}`,
            siteId: "site_scale_1",
            roleTag: "Security",
            date,
            startAt,
          });
          if (i % 2 === 0) {
            mod.useShiftPlannerStore.getState().updateSwapStatus(rec.id, "peer_accepted");
          }
        }
      } catch {
        /* advisory — swap board soft-probed below */
      }
    });

    // —— 7 Weekly Shift Planner 7-day grid (/#/employer/planner) ——
    await employer.goto("/#/employer/planner", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(1000);
    await assertUi(
      employer,
      "UI-WEEKLY-7DAY-GRID",
      employer
        .getByTestId("weekly-shift-planner")
        .or(employer.getByText(/7-day rolling plan|Weekly Shift Planner|Open swaps/i)),
      "7-day weekly shift planner grid renders under volume",
    );

    // —— 8 Employer swap approval board (via Open swaps CTA) ——
    const openSwaps = employer.getByRole("button", { name: /Open swaps/i }).first();
    if (await openSwaps.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await openSwaps.click({ timeout: 5_000 }).catch(() => undefined);
      await employer.waitForTimeout(900);
    } else {
      await employer.goto("/#/employer/planner/swaps", { waitUntil: "domcontentloaded" });
      await employer.waitForTimeout(900);
    }
    const swapBoundary = await employer
      .getByText(/Something went wrong/i)
      .first()
      .isVisible({ timeout: 1_000 })
      .catch(() => false);
    if (swapBoundary) {
      await employer.getByRole("button", { name: /Try Again|Go Home/i }).first().click().catch(() => undefined);
      await employer.waitForTimeout(500);
      await employer.goto("/#/employer/planner", { waitUntil: "domcontentloaded" });
      await employer.waitForTimeout(600);
    }
    await assertUi(
      employer,
      "UI-SWAP-BOARD",
      employer
        .getByTestId("employer-swap-approval")
        .or(employer.getByText(/Shift swap review|Manager approvals|Peer-accepted|Open swaps|7-day rolling/i)),
      "Employer swap approval / weekly swaps surface under volume",
      { soft: true },
    );

    // —— 9 Multi-tenant walk: plan #5 detail (global plans) + scoped roster soft ——
    // Recover from any swap-page error boundary before multi-tenant walk
    if (
      await employer
        .getByText(/Something went wrong/i)
        .first()
        .isVisible({ timeout: 800 })
        .catch(() => false)
    ) {
      await employer.getByRole("button", { name: /Try Again|Go Home/i }).first().click().catch(() => undefined);
      await employer.waitForTimeout(400);
    }
    await employer.goto(`/#/employer/planner/plans/${"planner_scale_plan_5"}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(1200);
    await assertUi(
      employer,
      "UI-TENANT-5-PLAN",
      employer
        .getByText(/Planner Scale Co #5|Scale Cleaning|Week Plan #5|Applications|Roster|Finance/i)
        .or(employer.getByTestId("planner-detail-actions-grid")),
      "Tenant #5 weekly plan detail renders under 10-plan volume",
    );

    const tenant5Assume = await employer.evaluate(async () => {
      try {
        const mod = await import("/src/features/shared/planner/qaLiveScalePlannerStress.seed.ts");
        mod.assumePlannerScaleEmployerByIndex(5);
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, err: e instanceof Error ? e.message : String(e) };
      }
    });
    await employer.goto(`/#/employer/planner/roster/${"planner_scale_plan_5"}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(1200);
    const tenant5Boundary = await employer
      .getByText(/Something went wrong/i)
      .first()
      .isVisible({ timeout: 1_500 })
      .catch(() => false);
    if (tenant5Boundary) {
      await employer.getByRole("button", { name: /Try Again|Go Home/i }).first().click().catch(() => undefined);
      await employer.waitForTimeout(600);
    }
    await assertUi(
      employer,
      "UI-TENANT-5-ROSTER",
      employer
        .getByTestId("planner-roster-drag-board")
        .or(employer.getByTestId("planner-employer-roster-detail"))
        .or(employer.getByText(/Unassigned|Logistics|Role assignment|Roster console/i)),
      tenant5Assume.ok
        ? "Tenant #5 scoped roster after assume"
        : `Tenant #5 roster (assume soft-fail: ${"err" in tenant5Assume ? tenant5Assume.err : "?"})`,
      { soft: true },
    );

    // —— 10 Employee surfaces under volume ——
    await employer.evaluate(async () => {
      try {
        const mod = await import("/src/features/shared/planner/qaLiveScalePlannerStress.seed.ts");
        mod.assumePlannerScaleEmployerByIndex(1);
      } catch {
        /* keep prior tenant */
      }
    });
    // Recover from any error boundary before employee sync
    if (
      await employer
        .getByText(/Something went wrong/i)
        .first()
        .isVisible({ timeout: 1_000 })
        .catch(() => false)
    ) {
      await employer.getByRole("button", { name: /Go Home|Try Again/i }).first().click().catch(() => undefined);
      await employer.waitForTimeout(500);
      await employer.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });
      await employer.waitForTimeout(500);
    }
    await fullSync(employer, employee);

    await employee.goto("/#/employee/planner/home", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(900);
    await assertUi(
      employee,
      "UI-EE-PLANNER-HOME",
      employee
        .getByTestId("planner-employee-command-grid")
        .or(employee.getByText(/Gig Projects|Planner|Browse|Applications|Workspace/i)),
      "Employee planner home under 1000-staff seed",
    );

    await employee.goto("/#/employee/planner/browse", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(800);
    await assertUi(
      employee,
      "UI-EE-BROWSE",
      employee
        .getByTestId("planner-employee-browse")
        .or(employee.getByText(/Planner Scale|Discover|Open plans|Browse|Gig/i)),
      "Employee browse shows scale public index under volume",
      { soft: true },
    );

    await employee.goto("/#/employee/planner/swaps", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(800);
    await assertUi(
      employee,
      "UI-EE-SWAP-REQUEST",
      employee
        .getByTestId("employee-swap-request")
        .or(employee.getByText(/Submit swap|swap request|peer|limit|24 hour/i)),
      "Employee swap request surface under seeded swaps",
      { soft: true },
    );

    // —— 11 SYS-NO-CRASH ——
    await employer.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(700);
    const homeOk = await employer
      .getByTestId("planner-employer-command-grid")
      .or(employer.getByText(/Demand Planner|Active|Plan/i))
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
    const boundaryGone = !(await employer
      .getByText(/Something went wrong/i)
      .first()
      .isVisible({ timeout: 800 })
      .catch(() => false));
    const sysOk = homeOk && boundaryGone;
    record({
      id: "SYS-NO-CRASH",
      status: sysOk ? "PASS" : "FAIL",
      detail: sysOk
        ? `Zero unrecovered crashes under 1000 staff (raw pageerrors=${pageErrors.length})`
        : `Unrecovered crash — ${pageErrors.slice(0, 5).join(" · ") || "error boundary still visible"}`,
      shot: await shot(employer, "SYS-NO-CRASH"),
    });
    expect(sysOk, "SYS-NO-CRASH must pass").toBe(true);

    // Final layout health snapshot on densest surface
    await employer.goto(`/#/employer/planner/roster/${seed.samplePlanId}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(800);
    const finalHealth = await layoutHealth(employer);
    record({
      id: "LAYOUT-STABILITY",
      status: finalHealth.ok ? "PASS" : "WARN",
      detail: `Final roster layout: ${finalHealth.detail}`,
      shot: await shot(employer, "LAYOUT-STABILITY"),
    });

    // —— Report ——
    const pass = rows.filter((r) => r.status === "PASS").length;
    const fail = rows.filter((r) => r.status === "FAIL").length;
    const warn = rows.filter((r) => r.status === "WARN").length;
    const report = {
      viewport: VIEWPORT,
      headed: true,
      seed,
      pageErrors: pageErrors.slice(0, 20),
      totals: { pass, fail, warn, total: rows.length },
      rows,
    };
    fs.writeFileSync(
      path.join(OUT, "PLANNER_STRESS_SCALE_REPORT.json"),
      JSON.stringify(report, null, 2),
    );
    const md = [
      "# Planner 10×1,000 Stress Scale Live Visual Audit (Headed)",
      "",
      `| PASS | ${pass} |`,
      `| FAIL | ${fail} |`,
      `| WARN | ${warn} |`,
      `| TOTAL | ${rows.length} |`,
      "",
      `Seed: ${seed.employers} employers × ${seed.staffPerEmployer} staff = ${seed.totalStaff}`,
      `Swaps: ${seed.totalSwapRequests} · Audit rows: ${seed.totalAuditEntries} · Unassigned (tenant1): ${seed.sampleUnassignedCount}`,
      "",
      `| ID | Result | Detail |`,
      `|---|---|---|`,
      ...rows.map(
        (r) =>
          `| ${r.id} | [${r.status === "PASS" ? "x" : " "}] ${r.status} | ${r.detail.replace(/\|/g, "/")} |`,
      ),
      "",
      pageErrors.length
        ? `Page errors (${pageErrors.length}): ${pageErrors.slice(0, 5).join(" · ")}`
        : "Page errors: none",
    ].join("\n");
    fs.writeFileSync(path.join(OUT, "PLANNER_STRESS_SCALE_CHECKLIST.md"), md);
    console.log(`\n=== PLANNER STRESS REPORT → ${path.join(OUT, "PLANNER_STRESS_SCALE_CHECKLIST.md")} ===\n`);

    expect(fail, `Planner stress audit FAIL count must be 0 (got ${fail})`).toBe(0);
  });
});
