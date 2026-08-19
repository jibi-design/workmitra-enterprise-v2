/**
 * Job Mitra — State-Seeded Live Visual Proof for 17 Conditional WARNs
 * Mobile 390×844 — every control must physically render; screenshots required.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/live-visual-shift-warn17-live-proof.spec.ts
 */

import { expect, test, type Browser, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 390, height: 844 };
const OUT = path.resolve("test-results/shift-jobs-warn17-live-proof");
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const SITE_ID = "11111111-2222-4333-8444-555555555555";
const MEMBERSHIP_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const SCOPE = "ML-AUD-WARN17-EMP1";
const WORKER_ML = "ML-AUD-WARN17-WRK1";
const WORKER_NAME = "Warn17 Worker";
const COMPANY = "Warn17 Audit Co";
const POST_ACTIVE = `warn17-post-active-${Date.now()}`;
const POST_OPEN = `warn17-post-open-${Date.now()}`;
const POST_WITHDRAW = `warn17-post-withdraw-${Date.now()}`;
const POST_PLAN = `warn17-post-plan-${Date.now()}`;
const POST_INVITE = `warn17-post-invite-${Date.now()}`;
const APP_APPLIED = `app_warn17_applied_${Date.now().toString(16)}`;
const APP_CONFIRMED = `app_warn17_confirmed_${Date.now().toString(16)}`;
const WS_ACTIVE = `ws_warn17_active_${Date.now().toString(16)}`;
const WS_COMPLETED = `ws_warn17_done_${Date.now().toString(16)}`;
const PLAN_ID = `plan_warn17_${Date.now().toString(16)}`;
const INVITE_ID = `inv_warn17_${Date.now().toString(16)}`;

type Row = { id: string; status: "PASS" | "FAIL"; detail: string; shot: string };
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

async function assertVisible(
  page: Page,
  id: string,
  locator: ReturnType<Page["locator"]>,
  detail: string,
): Promise<void> {
  const ok = await locator.first().isVisible({ timeout: 10_000 }).catch(() => false);
  const file = await shot(page, id);
  rows.push({
    id,
    status: ok ? "PASS" : "FAIL",
    detail: ok ? detail : `${detail} — NOT VISIBLE`,
    shot: file,
  });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${id} — ${detail}`);
  expect(ok, `${id} must be live-visible: ${detail}`).toBe(true);
}

async function prepare(page: Page, role: "employer" | "employee"): Promise<void> {
  await page.addInitScript(
    ({ splashKey, roleKey, sessionRole }) => {
      sessionStorage.setItem(splashKey, "1");
      sessionStorage.setItem(roleKey, sessionRole);
      try {
        localStorage.setItem("wm_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
      } catch {
        /* ignore */
      }
    },
    { splashKey: SPLASH_KEY, roleKey: ROLE_KEY, sessionRole: role },
  );
  await page.setViewportSize(VIEWPORT);
}

async function seedProfiles(page: Page): Promise<void> {
  await page.evaluate(
    async ({ workerMl, workerName, company, scope }) => {
      const pii = await import("/src/shared/security/piiSecureStorage.ts");
      pii.piiSecureStorage.setJson("wm_employer_profile_v1", {
        companyName: company,
        registrationNo: "",
        industryType: "Logistics & Transport",
        companySize: "11–50",
        locationCity: "City A",
        locationState: "Region",
        companyDescription: "Warn17 employer",
        fullName: "Warn17 Employer",
        email: "employer.warn17@mitralabs.test",
        phone: "9876543210",
        notificationsEnabled: true,
        hrManagementEnabled: false,
        language: "en",
        hapticFeedback: true,
        globalMute: false,
        quietHoursEnabled: false,
        quietFrom: "22:00",
        quietTo: "07:00",
        transferStatus: "none",
        businessAdminIds: [],
        previousHandles: [],
        contactVerified: true,
        verificationLevel: 1,
        uniqueId: scope,
        companyUniqueId: scope,
        employerOrgId: scope,
      });
      pii.piiSecureStorage.setJson("wm_employee_profile_v1", {
        uniqueId: workerMl,
        fullName: workerName,
        city: "City A",
        skills: ["loading", "warehouse"],
        experience: "fresher",
        languages: ["Malayalam", "English"],
        preferShiftJobs: true,
        preferCareerJobs: false,
        availability: {
          weekdays: true,
          weekends: true,
          morning: true,
          afternoon: true,
          evening: true,
        },
        createdAt: Date.now(),
      });
      const settingsRaw = localStorage.getItem("wm_employee_settings_v1");
      const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
      localStorage.setItem(
        "wm_employee_settings_v1",
        JSON.stringify({ ...settings, quickApplyEnabled: true }),
      );
    },
    { workerMl: WORKER_ML, workerName: WORKER_NAME, company: COMPANY, scope: SCOPE },
  );
}

async function seedAllStates(page: Page): Promise<void> {
  await page.evaluate(
    ({
      scope,
      siteId,
      membershipId,
      workerMl,
      workerName,
      company,
      postActive,
      postOpen,
      postWithdraw,
      postPlan,
      postInvite,
      appApplied,
      appConfirmed,
      wsActive,
      wsCompleted,
      planId,
      inviteId,
    }) => {
      const now = Date.now();
      const startAt = now + 86_400_000;
      const endAt = now + 172_800_000;

      const makeWs = (
        id: string,
        postId: string,
        appId: string,
        status: "active" | "completed",
        jobName: string,
      ) => ({
        id,
        postId,
        appId,
        workerMlId: workerMl,
        workerName,
        companyName: company,
        jobName,
        category: "other",
        locationName: "City A",
        locationAddress: "Gate Warn17",
        mapsLink: "",
        startAt,
        endAt,
        lastActivityAt: now,
        unreadCount: 1,
        status,
        updates: [
          {
            id: `upd_${id}`,
            createdAt: now,
            kind: "broadcast",
            title: "Announcement",
            body: "Warn17 live broadcast body — report to gate.",
          },
        ],
      });

      const makePost = (
        id: string,
        job: string,
        extra: Record<string, unknown> = {},
      ): Record<string, unknown> => ({
        id,
        companyName: company,
        jobName: job,
        category: "Warehouse",
        experience: "helper",
        payPerDay: 900,
        payBasis: "per_day",
        locationName: "City A",
        locationAddress: "Gate Warn17",
        distanceKm: 2,
        startAt,
        endAt,
        description: "Warn17 seeded shift",
        shiftTiming: "09:00-18:00",
        mapsLink: "",
        vacancies: 2,
        waitingBuffer: 1,
        analysisStatus: "not_started",
        shortlistIds: [] as string[],
        waitingIds: [] as string[],
        confirmedIds: [] as string[],
        rejectedIds: [] as string[],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: false,
        source: "single",
        siteId,
        employerScopeId: scope,
        employerOrgId: scope,
        ...extra,
      });

      const posts = [
        makePost(postActive, "Warn17 Active Shift", {
          confirmedIds: [appConfirmed],
          shortlistIds: [],
        }),
        makePost(postOpen, "Warn17 Open Finder Shift"),
        // Separate post so applied status is effective (confirmed ranks above applied).
        makePost(postWithdraw, "Warn17 Withdraw Shift"),
        makePost(postPlan, "Warn17 Plan Day A", {
          source: "planner",
          planId,
        }),
        makePost(`${postPlan}-b`, "Warn17 Plan Day B", {
          source: "planner",
          planId,
        }),
        makePost(postInvite, "Warn17 Invite Shift"),
      ];

      const apps = [
        {
          id: appApplied,
          postId: postWithdraw,
          createdAt: now,
          status: "applied",
          employerScopeId: scope,
          profileSnapshot: {
            uniqueId: workerMl,
            fullName: workerName,
            city: "City A",
            skills: ["loading"],
          },
          mustHaveAnswers: {},
          goodToHaveAnswers: {},
          notes: {},
        },
        {
          id: appConfirmed,
          postId: postActive,
          createdAt: now,
          status: "confirmed",
          employerScopeId: scope,
          profileSnapshot: {
            uniqueId: workerMl,
            fullName: workerName,
            city: "City A",
            skills: ["loading"],
          },
          mustHaveAnswers: {},
          goodToHaveAnswers: {},
          notes: {},
        },
      ];

      const workspaces = [
        makeWs(wsActive, postActive, appConfirmed, "active", "Warn17 Active Shift"),
        makeWs(wsCompleted, postActive, appConfirmed, "completed", "Warn17 Active Shift"),
      ];

      const invite = {
        id: inviteId,
        postId: postInvite,
        workerMlId: workerMl,
        employerScopeId: scope,
        companyName: company,
        jobName: "Warn17 Invite Shift",
        status: "pending",
        createdAt: now,
        shiftDateLabel: new Date(startAt).toLocaleDateString(),
      };

      localStorage.setItem("wm_employer_shift_posts_v1", JSON.stringify(posts));
      localStorage.setItem(`wm_employer_${scope}_shift_posts_v1`, JSON.stringify(posts));
      localStorage.setItem("wm_employee_shift_search_v1", JSON.stringify(posts));
      localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify(apps));
      localStorage.setItem(`wm_employer_${scope}_shift_applications_v1`, JSON.stringify(apps));
      localStorage.setItem("wm_employee_shift_workspaces_v1", JSON.stringify(workspaces));
      localStorage.setItem(`wm_employer_${scope}_shift_workspaces_v1`, JSON.stringify(workspaces));
      localStorage.setItem("wm_employee_shift_direct_invites_v1", JSON.stringify([invite]));
      localStorage.setItem(
        `wm_employer_${scope}_shift_direct_invites_v1`,
        JSON.stringify([invite]),
      );
      const mapKey = `${siteId.trim().toLowerCase()}::${workerMl.trim().toUpperCase()}`;
      localStorage.setItem(
        "wm_shift_ops_site_membership_truth_v1",
        JSON.stringify({
          [mapKey]: {
            siteId,
            workerMlId: workerMl.toUpperCase(),
            membershipId,
            status: "ready_for_assignment",
            updatedAt: now,
          },
        }),
      );

      for (const ev of [
        "wm:employer-shift-posts-changed",
        "wm:employee-shift-search-changed",
        "wm:employee-shift-applications-changed",
        "wm:employee-shift-workspaces-changed",
        "wm:shift-employer-scope-changed",
      ]) {
        window.dispatchEvent(new Event(ev));
      }
    },
    {
      scope: SCOPE,
      siteId: SITE_ID,
      membershipId: MEMBERSHIP_ID,
      workerMl: WORKER_ML,
      workerName: WORKER_NAME,
      company: COMPANY,
      postActive: POST_ACTIVE,
      postOpen: POST_OPEN,
      postWithdraw: POST_WITHDRAW,
      postPlan: POST_PLAN,
      postInvite: POST_INVITE,
      appApplied: APP_APPLIED,
      appConfirmed: APP_CONFIRMED,
      wsActive: WS_ACTIVE,
      wsCompleted: WS_COMPLETED,
      planId: PLAN_ID,
      inviteId: INVITE_ID,
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
        key.startsWith("wm_employer_") ||
        key.startsWith("wm_employee_") ||
        key.startsWith("wm_shift_") ||
        key.startsWith("wm_vault_")
      ) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  });
  await target.evaluate((data) => {
    for (const [k, v] of Object.entries(data)) {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    }
    for (const ev of [
      "wm:employer-shift-posts-changed",
      "wm:employee-shift-search-changed",
      "wm:employee-shift-applications-changed",
      "wm:employee-shift-workspaces-changed",
      "wm:shift-employer-scope-changed",
      "wm:app-settings-changed",
    ]) {
      window.dispatchEvent(new Event(ev));
    }
  }, snapshot);
}

test.describe.configure({ mode: "serial" });

test.describe("Warn17 state-seeded live visual proof @mobile390", () => {
  test("convert 17 conditional WARNs to live PASS with screenshots", async ({ browser }) => {
    test.setTimeout(300_000);
    fs.mkdirSync(OUT, { recursive: true });

    const employerCtx = await browser.newContext({ viewport: VIEWPORT });
    const employeeCtx = await browser.newContext({ viewport: VIEWPORT });
    const employer = await employerCtx.newPage();
    const employee = await employeeCtx.newPage();
    await prepare(employer, "employer");
    await prepare(employee, "employee");

    await employer.goto("/#/", { waitUntil: "domcontentloaded" });
    await employee.goto("/#/", { waitUntil: "domcontentloaded" });
    await seedProfiles(employer);
    await seedProfiles(employee);
    await seedAllStates(employer);
    await fullSync(employer, employee);

    // —— 1 Filter & Status Controls ——
    await employer.goto(`/#/employer/shift/posts?status=applied`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(500);
    await assertVisible(
      employer,
      "CR-E17",
      employer.getByTestId("shift-posts-status-filter"),
      "Posts status filter banner live with ?status=applied",
    );

    await employer.goto("/#/employer/shift/posts", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(500);
    await assertVisible(
      employer,
      "CR-E18",
      employer.getByTestId("shift-posts-plan-days-toggle"),
      "Plan-days toggle live with planner child posts",
    );

    // —— 2 Quick Apply (open post, not yet applied) ——
    await employee.goto("/#/employee/shift/search", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(700);
    await assertVisible(
      employee,
      "AP-W8",
      employee.getByRole("button", { name: /Quick Apply/i }),
      "Quick Apply CTA live on Finder card",
    );

    // —— 3 Withdraw (applied-only post — confirmed ranks above applied on same post) ——
    await employee.goto(`/#/employee/shift/post/${POST_WITHDRAW}`, {
      waitUntil: "domcontentloaded",
    });
    await employee.waitForTimeout(600);
    await assertVisible(
      employee,
      "AP-W10",
      employee.getByRole("button", { name: /Withdraw/i }),
      "Withdraw control live on applied/shortlisted post details",
    );

    // —— 4 Open Group + Contact Lock (confirmed candidate) ——
    await employer.goto(`/#/employer/shift/post/${POST_ACTIVE}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.reload({ waitUntil: "domcontentloaded" });
    await employer.getByRole("button", { name: /^Selected\b/ }).click();
    await employer.waitForTimeout(500);
    await assertVisible(
      employer,
      "AC-E3",
      employer.getByRole("button", { name: /Open Group|Confirm Worker/i }),
      "Open Group / Confirm Worker live on Selected tab",
    );

    await employer.getByRole("button", { name: /^Applied\b/ }).click();
    await employer.waitForTimeout(400);
    // Contact lock on candidate card — may need scrolling in virtual list
    const lock = employer.getByTestId("shift-contact-platform-lock");
    if (!(await lock.first().isVisible({ timeout: 2_000 }).catch(() => false))) {
      await employer.getByRole("button", { name: /^Selected\b/ }).click();
      await employer.waitForTimeout(400);
    }
    await assertVisible(
      employer,
      "SF-E1",
      employer.getByTestId("shift-contact-platform-lock"),
      "Contact platform lock strip live on candidate card",
    );

    // —— 5 Active Workspace: Broadcast / Reply / Call / Feed / Mark Completed ——
    await employer.goto(`/#/employer/shift/workspace/${WS_ACTIVE}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(700);
    await assertVisible(
      employer,
      "WS-E3",
      employer.getByRole("button", { name: "Broadcast", exact: true }),
      "Broadcast button live on active workspace",
    );
    await employer.getByRole("button", { name: "Broadcast", exact: true }).click();
    await employer.waitForTimeout(400);
    await assertVisible(
      employer,
      "WS-E3-MODAL",
      employer.getByPlaceholder(/Type shift update details|Announcement/i).or(
        employer.getByRole("button", { name: /Send Broadcast/i }),
      ),
      "Broadcast modal open live",
    );
    // Close modal if open
    const closeBroadcast = employer.getByRole("button", { name: /Cancel|Close/i }).first();
    if (await closeBroadcast.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeBroadcast.click().catch(() => undefined);
    }

    await assertVisible(
      employer,
      "WS-E4",
      employer.getByRole("button", { name: /^Reply$/i }),
      "Reply button live on active workspace",
    );
    await employer.getByRole("button", { name: /^Reply$/i }).click();
    await employer.waitForTimeout(400);
    await assertVisible(
      employer,
      "WS-E4-MODAL",
      employer.getByRole("button", { name: /Send Reply/i }).or(
        employer.getByPlaceholder(/Reply|Type/i),
      ),
      "Reply modal open live",
    );
    const closeReply = employer.getByRole("button", { name: /Cancel|Close/i }).first();
    if (await closeReply.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeReply.click().catch(() => undefined);
    }

    await assertVisible(
      employer,
      "WS-E5",
      employer
        .getByTestId("call-worker-button")
        .or(employer.getByTestId("call-worker-button-locked"))
        .or(employer.getByRole("button", { name: /^Call/i })),
      "Call control live (unlocked or locked)",
    );
    await shot(employer, "SF-CALL");
    rows.push({
      id: "SF-CALL",
      status: "PASS",
      detail: "Call control visually confirmed on active workspace (same surface as WS-E5)",
      shot: path.join(OUT, "shots", `${String(shotN).padStart(2, "0")}-SF-CALL.png`),
    });
    console.log("[PASS] SF-CALL — Call control live");

    await assertVisible(
      employer,
      "CL-E3",
      employer.getByRole("button", { name: "Mark Completed", exact: true }),
      "Mark Completed live on active workspace",
    );

    await assertVisible(
      employer,
      "WS-W3-EMP",
      employer.getByTestId("employer-shift-workspace-updates"),
      "Employer workspace updates feed live",
    );

    // Employee updates feed + exit
    await fullSync(employer, employee);
    await employee.goto(`/#/employee/shift/workspace/${WS_ACTIVE}`, {
      waitUntil: "domcontentloaded",
    });
    await employee.waitForTimeout(700);
    await assertVisible(
      employee,
      "WS-W3",
      employee.getByTestId("shift-workspace-updates"),
      "Employee workspace updates feed live",
    );
    await assertVisible(
      employee,
      "CL-W2",
      employee.getByTestId("shift-workspace-exit"),
      "Workspace exit (emergency path) live on active workspace",
    );

    // —— 6 Completed Shift: Rate Worker + Rate Employer ——
    await employer.goto(`/#/employer/shift/workspace/${WS_COMPLETED}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(700);
    await assertVisible(
      employer,
      "RT-E1",
      employer.getByRole("button", { name: /Rate Worker/i }),
      "Rate Worker live on completed workspace",
    );
    await employer.getByRole("button", { name: /Rate Worker/i }).click();
    await employer.waitForTimeout(500);
    await assertVisible(
      employer,
      "RT-E1-MODAL",
      employer.getByRole("button", { name: /Submit Rating|5 stars/i }),
      "Rate Worker modal open live with star controls",
    );
    const closeRate = employer.getByRole("button", { name: /Close|Cancel/i }).first();
    if (await closeRate.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeRate.click().catch(() => undefined);
    }

    await employee.goto(`/#/employee/shift/workspace/${WS_COMPLETED}`, {
      waitUntil: "domcontentloaded",
    });
    await employee.waitForTimeout(700);
    await assertVisible(
      employee,
      "RT-W1",
      employee.getByTestId("shift-workspace-rating"),
      "Rate Employer section live on completed workspace",
    );
    await employee.getByRole("button", { name: /Rate Employer/i }).click();
    await employee.waitForTimeout(500);
    await assertVisible(
      employee,
      "RT-W1-MODAL",
      employee.getByRole("button", { name: /Submit Rating|5 stars/i }),
      "Rate Employer modal open live",
    );

    // —— 7 Availability broadcast (Shift Ops CC — DEV default on) ——
    await employee.goto("/#/employee/shift-ops", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(800);
    await assertVisible(
      employee,
      "AV-W1",
      employee.getByTestId("shift-availability-broadcast-card"),
      "Availability broadcast card live on Shift Ops control center",
    );

    // —— 8 Direct invite accept card ——
    await employee.goto(`/#/employee/shift/post/${POST_INVITE}`, {
      waitUntil: "domcontentloaded",
    });
    await employee.waitForTimeout(800);
    await assertVisible(
      employee,
      "IN-W1",
      employee.getByTestId("shift-direct-invite-accept-card"),
      "Direct invite accept card live on invited post",
    );

    // Write report
    const report = {
      viewport: VIEWPORT,
      totals: {
        pass: rows.filter((r) => r.status === "PASS").length,
        fail: rows.filter((r) => r.status === "FAIL").length,
        total: rows.length,
      },
      ids: {
        POST_ACTIVE,
        POST_OPEN,
        WS_ACTIVE,
        WS_COMPLETED,
      },
      rows,
    };
    fs.writeFileSync(path.join(OUT, "WARN17_LIVE_PROOF_REPORT.json"), JSON.stringify(report, null, 2));
    const md = [
      "# Warn17 State-Seeded Live Visual Proof",
      "",
      `| PASS | ${report.totals.pass} |`,
      `| FAIL | ${report.totals.fail} |`,
      `| TOTAL | ${report.totals.total} |`,
      "",
      "| ID | Result | Detail |",
      "|---|---|---|",
      ...rows.map(
        (r) =>
          `| ${r.id} | ${r.status === "PASS" ? "[x] PASS" : "[ ] FAIL"} | ${r.detail.replace(/\|/g, "/")} |`,
      ),
      "",
    ].join("\n");
    fs.writeFileSync(path.join(OUT, "WARN17_LIVE_PROOF_CHECKLIST.md"), md, "utf8");
    console.log(`\n=== WARN17 REPORT → ${path.join(OUT, "WARN17_LIVE_PROOF_CHECKLIST.md")} ===\n`);

    await employerCtx.close();
    await employeeCtx.close();

    const fails = rows.filter((r) => r.status === "FAIL");
    expect(fails, JSON.stringify(fails, null, 2)).toEqual([]);
  });
});
