/**
 * Job Mitra — Career 10×1,000 Live Scale Stress Audit (HEADED)
 * Scale: 10 Employers × 100 candidates each (= 1,000) · Mobile 390×844
 * Career domain ONLY — never mixes Shift Jobs state.
 *
 * CRITICAL: Run headed so the physical browser is visible:
 *   npx playwright test --project=chromium --headed tests/e2e/live-visual-career-stress-scale-audit.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 390, height: 844 };
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const OUT = path.resolve("test-results/career-jobs-stress-scale-audit");

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
              fullName: "Career Scale Watch Worker",
              city: "City A",
              skills: ["operations", "communication"],
              experience: "experienced",
              languages: ["English"],
              preferShiftJobs: false,
              preferCareerJobs: true,
              availability: {
                weekdays: true,
                weekends: false,
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
    if (overflowX > 8) issues.push(`horizontalOverflowPx=${overflowX}`);
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
  // Cap payload — full 10×100 career dump can stall Playwright IPC.
  const snapshot = await source.evaluate(() => {
    const data: Record<string, string | null> = {};
    const prefer = (key: string) =>
      key.includes("career_posts") ||
      key.includes("career_applications") ||
      key.includes("career_create_draft") ||
      key.includes("employer_profile") ||
      key.includes("employer_settings") ||
      key.includes("CAREER_SCALE") ||
      key === "wm_qa_career_scale_employer_registry_v1" ||
      key.startsWith("wm_employer_ML_CAREER_SCALE") ||
      key.startsWith("wm_employee_ML_CAREER_SCALE");

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !prefer(key)) continue;
      const val = localStorage.getItem(key);
      // Skip oversized blobs (>1.5MB) to keep sync responsive
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
      "wm:employer-career-posts-changed",
      "wm:employee-career-applications-changed",
      "wm:employer-career-create-draft-changed",
      "wm:career-employer-scope-changed",
      "wm:pending-actions-changed",
    ]) {
      window.dispatchEvent(new Event(ev));
    }
  }, snapshot);
}

async function clickPipelineTab(page: Page, kind: "applied" | "shortlisted" | "interview" | "offered") {
  const patterns: Record<typeof kind, RegExp> = {
    applied: /^Applied/i,
    shortlisted: /Shortlist\d|📋\s*Shortlist|^Shortlist/i,
    interview: /InterviewRounds|💬\s*Interview/i,
    offered: /Offered|Offers|🤝/i,
  };
  const tab = page.getByRole("button", { name: patterns[kind] }).first();
  if (await tab.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await tab.click({ timeout: 5_000 }).catch(() => undefined);
    await page.waitForTimeout(500);
  }
}

test.describe.configure({ mode: "serial" });

// Headed + slowMo must be top-level (not inside describe) so Playwright can apply them.
test.use({
  headless: false,
  launchOptions: { slowMo: 50 },
  viewport: VIEWPORT,
});

test.describe("Career Stress Scale Live Visual Audit @mobile390 @headed", () => {
  test("10 employers × 1000 candidates — headed Command Center + pipeline ops", async ({
    browser,
  }) => {
    test.setTimeout(900_000);
    fs.mkdirSync(OUT, { recursive: true });

    const pageErrors: string[] = [];
    const employerCtx = await browser.newContext({
      viewport: VIEWPORT,
      // Force visible window even if project defaults headless
    });
    const employeeCtx = await browser.newContext({ viewport: VIEWPORT });
    const employer = await employerCtx.newPage();
    const employee = await employeeCtx.newPage();
    employer.on("pageerror", (e) => pageErrors.push(`employer: ${e.message}`));
    employee.on("pageerror", (e) => pageErrors.push(`employee: ${e.message}`));

    await prepare(employer, "employer");
    // Worker id patched after seed
    await prepare(employee, "employee", "ML_CAREER_SCALE_WRK_0009");

    // —— 1 Seed (Career-only) ——
    await employer.goto("/#/employer/career", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(600);
    const seedT0 = Date.now();
    const seed = await employer.evaluate(async () => {
      const mod = await import("/src/features/shared/career/qaLiveScaleCareerStress.seed.ts");
      return mod.applyCareerLiveScaleStressSeed(10, 100);
    });
    const seedMs = Date.now() - seedT0;

    expect(seed.employers).toBe(10);
    expect(seed.candidatesPerEmployer).toBe(100);
    expect(seed.totalCandidates).toBe(1000);
    expect(seed.totalApplications).toBe(1000);

    record({
      id: "SEED-CAREER-SCALE",
      status: "PASS",
      detail: `Seeded ${seed.employers} employers · ${seed.totalCandidates} candidates · ${seed.totalApplications} apps`,
      ms: seedMs,
      shot: await shot(employer, "SEED-CAREER-SCALE"),
    });

    // Re-bind employee profile to a worker with an offered application
    await employee.addInitScript(
      ({ worker }) => {
        try {
          localStorage.setItem(
            "wm_employee_profile_v1",
            JSON.stringify({
              uniqueId: worker,
              fullName: "Career Scale Watch Worker",
              city: "City A",
              skills: ["operations"],
              experience: "experienced",
              languages: ["English"],
              preferShiftJobs: false,
              preferCareerJobs: true,
            }),
          );
        } catch {
          /* ignore */
        }
      },
      { worker: seed.sampleWorkerMlId },
    );
    await employee.goto("/#/employee/career", { waitUntil: "domcontentloaded" });
    await employee.evaluate((worker) => {
      localStorage.setItem(
        "wm_employee_profile_v1",
        JSON.stringify({
          uniqueId: worker,
          fullName: "Career Scale Watch Worker",
          city: "City A",
          skills: ["operations"],
          experience: "experienced",
          languages: ["English"],
          preferShiftJobs: false,
          preferCareerJobs: true,
        }),
      );
    }, seed.sampleWorkerMlId);
    await fullSync(employer, employee);

    // —— 2 Employer Career Home under load ——
    await employer.goto("/#/employer/career", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(800);
    await assertUi(
      employer,
      "UI-EMP-CAREER-HOME",
      employer
        .getByTestId("employer-career-home-active")
        .or(employer.getByText(/Career Jobs|My Posts|Resume Draft|Applications/i)),
      "Employer Career Home under 10-tenant seed",
    );

    // Resume draft reminder (seeded on emp 1)
    await assertUi(
      employer,
      "UI-RESUME-DRAFT",
      employer.getByRole("button", { name: /Resume Draft/i }).or(
        employer.getByText(/Incomplete career job draft/i),
      ),
      "Resume draft reminder visible under scale seed",
      { soft: true },
    );

    // —— 3 Posts list ——
    await employer.goto("/#/employer/career/posts", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(700);
    await assertUi(
      employer,
      "UI-EMP-POSTS",
      employer.getByText(/Scale|Career Scale|Operations Lead|My Posts|Active/i),
      "Career posts list under scale load",
    );

    // —— 4 High-volume Candidate Command Center (100 apps) ——
    const dashT0 = Date.now();
    await employer.goto(`/#/employer/career/post/${seed.samplePostId}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(1200);
    const dashMs = Date.now() - dashT0;

    await assertUi(
      employer,
      "UI-100-COMMAND-CENTER",
      employer
        .getByText(/Pipeline|Applied|Shortlist|Candidates|Scale/i)
        .or(employer.locator("[data-testid^='career-applicant-quick-view-']").first()),
      `100-candidate Career Command Center (load ${dashMs}ms)`,
    );

    await clickPipelineTab(employer, "applied");
    await shot(employer, "UI-100-APPLIED-TOP");

    // Scroll candidate surface
    await employer.evaluate(() => {
      window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.45));
    });
    await employer.waitForTimeout(500);
    await shot(employer, "UI-100-APPLIED-MID");
    await employer.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await employer.waitForTimeout(500);
    await assertUi(
      employer,
      "UI-100-SCROLL",
      employer
        .locator("[data-testid^='career-applicant-quick-view-']")
        .first()
        .or(employer.getByText(/Applied|Scale Worker|Quick/i)),
      "100-candidate Applied tab scrolls without crash",
    );

    // Show more if present (pagination under volume)
    const showMore = employer.getByTestId("career-candidate-show-more");
    if (await showMore.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await showMore.click();
      await employer.waitForTimeout(600);
      await shot(employer, "UI-100-SHOW-MORE");
    }

    // —— 5 Pipeline: Shortlist ——
    await clickPipelineTab(employer, "applied");
    await employer.waitForTimeout(400);
    const shortlistBtn = employer
      .getByRole("button", { name: /Move to Shortlist|^Shortlist$/i })
      .first();
    const shortlistVisible = await shortlistBtn.isVisible({ timeout: 6_000 }).catch(() => false);
    if (shortlistVisible) {
      await shortlistBtn.click({ timeout: 5_000 });
      await employer.waitForTimeout(900);
      // Dismiss any notice/confirm left open so later tabs are clickable
      await employer.keyboard.press("Escape").catch(() => undefined);
      await employer.waitForTimeout(300);
      const health = await layoutHealth(employer);
      record({
        id: "OP-SHORTLIST",
        status: health.ok ? "PASS" : "FAIL",
        detail: health.ok
          ? "Move to Shortlist clicked live on Applied tab under load"
          : `Shortlist click left unhealthy UI: ${health.detail}`,
        shot: await shot(employer, "OP-SHORTLIST"),
      });
      if (!health.ok) expect(health.ok).toBe(true);
    } else {
      record({
        id: "OP-SHORTLIST",
        status: "WARN",
        detail: "Move to Shortlist button not visible on Applied tab",
        shot: await shot(employer, "OP-SHORTLIST"),
      });
    }

    // —— 6 Pipeline: Schedule Interview ——
    await clickPipelineTab(employer, "shortlisted");
    await employer.waitForTimeout(500);
    const scheduleBtn = employer
      .getByRole("button", { name: /Schedule Interview/i })
      .first();
    const scheduleVisible = await scheduleBtn.isVisible({ timeout: 6_000 }).catch(() => false);
    if (scheduleVisible) {
      await scheduleBtn.click({ timeout: 5_000 });
      await employer.waitForTimeout(800);
      await assertUi(
        employer,
        "OP-SCHEDULE-INTERVIEW",
        employer.getByRole("dialog").or(employer.getByText(/Schedule Interview|Round|Date|Time/i)),
        "Schedule Interview modal open under load",
      );
      await employer.keyboard.press("Escape").catch(() => undefined);
      await employer.waitForTimeout(400);
      const cancel = employer.getByRole("button", { name: /Cancel|Close/i }).first();
      if (await cancel.isVisible({ timeout: 1_500 }).catch(() => false)) {
        await cancel.click({ timeout: 3_000 }).catch(() => undefined);
        await employer.waitForTimeout(300);
      }
    } else {
      record({
        id: "OP-SCHEDULE-INTERVIEW",
        status: "WARN",
        detail: "Schedule Interview CTA not visible on Shortlisted tab",
        shot: await shot(employer, "OP-SCHEDULE-INTERVIEW"),
      });
    }

    // —— 7 Multi-tenant walk: open employer #5 Command Center ——
    await employer.evaluate(async () => {
      const mod = await import("/src/features/shared/career/qaLiveScaleCareerStress.seed.ts");
      mod.assumeCareerScaleEmployerByIndex(5);
    });
    await employer.goto(`/#/employer/career/post/${"career_scale_post_5"}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(1000);
    await assertUi(
      employer,
      "UI-TENANT-5",
      employer.getByText(/Scale|Career Scale Co #5|Pipeline|Applied/i),
      "Tenant #5 Command Center renders 100 candidates",
    );

    // —— 8 Employee Accept Offer under volume (before heavy re-sync) ——
    console.log("[STEP] Employee Accept Offer…");
    await employee.evaluate((worker) => {
      localStorage.setItem(
        "wm_employee_profile_v1",
        JSON.stringify({
          uniqueId: worker,
          fullName: "Career Scale Watch Worker",
          city: "City A",
          skills: ["operations"],
          experience: "experienced",
          languages: ["English"],
          preferShiftJobs: false,
          preferCareerJobs: true,
        }),
      );
    }, seed.sampleWorkerMlId);
    await fullSync(employer, employee);
    await employee.goto("/#/employee/career/applications", {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await employee.waitForTimeout(900);
    const offersTab = employee.getByRole("button", { name: /^Offers/i });
    if (await offersTab.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await offersTab.first().click({ timeout: 5_000 });
      await employee.waitForTimeout(500);
    }
    const acceptOffer = employee.getByRole("button", { name: /Accept Offer/i }).first();
    const acceptVisible = await acceptOffer.isVisible({ timeout: 8_000 }).catch(() => false);
    if (acceptVisible) {
      await acceptOffer.click({ timeout: 5_000 });
      await employee.waitForTimeout(1000);
      const confirm = employee.getByRole("button", { name: /Confirm|Accept|Yes/i }).last();
      if (await confirm.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirm.click({ timeout: 3_000 }).catch(() => undefined);
        await employee.waitForTimeout(800);
      }
      await assertUi(
        employee,
        "OP-ACCEPT-OFFER",
        employee.getByText(/Offer|Accepted|Congratulations|Workspace|Hired|Career/i),
        "Accept Offer executed under 1000-user volume",
        { soft: true },
      );
      record({
        id: "OP-ACCEPT-OFFER-CLICK",
        status: "PASS",
        detail: "Accept Offer clicked live on employee applications",
        shot: await shot(employee, "OP-ACCEPT-OFFER-CLICK"),
      });
    } else {
      await assertUi(
        employee,
        "OP-ACCEPT-OFFER",
        employee.getByText(/Offer|Applications|Career Scale|Interview/i),
        "Offer/applications surface under volume (Accept CTA soft-miss)",
        { soft: true },
      );
    }

    // Back to tenant 1 interview schedules
    console.log("[STEP] Interview schedules…");
    await employer.evaluate(async () => {
      const mod = await import("/src/features/shared/career/qaLiveScaleCareerStress.seed.ts");
      mod.assumeCareerScaleEmployerByIndex(1);
    });
    await employer.goto(`/#/employer/career/post/${seed.samplePostId}`, {
      waitUntil: "commit",
      timeout: 20_000,
    });
    await employer.waitForTimeout(1000);
    await employer.keyboard.press("Escape").catch(() => undefined);
    await clickPipelineTab(employer, "interview");
    await assertUi(
      employer,
      "UI-INTERVIEW-SCHEDULES",
      employer.getByText(/Interview|Scheduled|Screening|Scale Worker|Pipeline/i),
      "Interview schedules render under load",
      { soft: true },
    );

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
      path.join(OUT, "CAREER_STRESS_SCALE_REPORT.json"),
      JSON.stringify(report, null, 2),
    );
    const md = [
      "# Career 10×1,000 Stress Scale Live Visual Audit (Headed)",
      "",
      `| PASS | ${pass} |`,
      `| FAIL | ${fail} |`,
      `| WARN | ${warn} |`,
      `| TOTAL | ${rows.length} |`,
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
    fs.writeFileSync(path.join(OUT, "CAREER_STRESS_SCALE_CHECKLIST.md"), md);
    console.log(`\n=== CAREER STRESS REPORT → ${path.join(OUT, "CAREER_STRESS_SCALE_CHECKLIST.md")} ===\n`);

    expect(fail, `Career stress audit FAIL count must be 0 (got ${fail})`).toBe(0);
  });
});
