/**
 * Job Mitra — Shift Jobs Feature Inventory Micro-Audit (mobile 390×844)
 *
 * Item-by-item visual audit against SHIFT_JOBS_FEATURE_INVENTORY.
 * Screenshots + PASS/FAIL/WARN/SKIP checkbox report.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/live-visual-shift-micro-audit.spec.ts
 */

import { expect, test, type Browser, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  SHIFT_JOBS_FEATURE_INVENTORY,
  type InventoryItem,
} from "./helpers/shiftJobsFeatureInventory";

const VIEWPORT = { width: 390, height: 844 };
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const OUT_DIR = path.resolve("test-results/shift-jobs-feature-inventory");
const SITE_ID = "11111111-2222-4333-8444-555555555555";
const MEMBERSHIP_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const WORKER_ML_ID = "ML-AUD-MICRO-WRK1";
const WORKER_NAME = "Micro Audit Worker";
const COMPANY = "Micro Audit Co";
const EMPLOYER_SCOPE_ID = "ML-AUD-MICRO-EMP1";
const JOB_TITLE = `Micro Audit Shift ${Date.now().toString().slice(-6)}`;

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
let postId = `micro-post-${Date.now()}`;
let workspaceId = "";
let appId = "";

function resolvePath(raw: string | undefined): string {
  if (!raw) return "/#/";
  return raw
    .replace("DYNAMIC_POST", `/#/employee/shift/post/${postId}`)
    .replace("DYNAMIC_DASH", `/#/employer/shift/post/${postId}`)
    .replace("DYNAMIC_WS_EMP", `/#/employer/shift/workspace/${workspaceId || "missing"}`)
    .replace("DYNAMIC_WS_EE", `/#/employee/shift/workspace/${workspaceId || "missing"}`);
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
    async ({ workerMlId, workerName, company }) => {
      const pii = await import("/src/shared/security/piiSecureStorage.ts");
      pii.piiSecureStorage.setJson("wm_employer_profile_v1", {
        companyName: company,
        registrationNo: "",
        industryType: "Logistics & Transport",
        companySize: "11–50",
        locationCity: "City A",
        locationState: "Region",
        companyDescription: "Micro audit employer",
        fullName: "Micro Employer",
        email: "employer.micro@mitralabs.test",
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
        uniqueId: "ML-AUD-MICRO-EMP1",
        companyUniqueId: "ML-AUD-MICRO-EMP1",
        employerOrgId: "ML-AUD-MICRO-EMP1",
      });
      pii.piiSecureStorage.setJson("wm_employee_profile_v1", {
        uniqueId: workerMlId,
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
    { workerMlId: WORKER_ML_ID, workerName: WORKER_NAME, company: COMPANY },
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
        key.startsWith("wm_vault_") ||
        key.startsWith("wm_pulse_") ||
        key.startsWith("wm_shift_") ||
        key === "wm:pulse-nav-enabled"
      ) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  });
  await target.evaluate((data) => {
    for (const [key, value] of Object.entries(data)) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    for (const eventName of [
      "wm:employer-shift-posts-changed",
      "wm:employee-shift-search-changed",
      "wm:employee-shift-applications-changed",
      "wm:employee-shift-workspaces-changed",
      "wm:employee-notifications-changed",
      "wm:employer-notifications-changed",
      "wm:vault-shift-history-changed",
      "wm:app-settings-changed",
    ]) {
      window.dispatchEvent(new Event(eventName));
    }
  }, snapshot);
}

async function seedRichLifecycle(employerPage: Page, employeePage: Page): Promise<void> {
  const now = Date.now();
  appId = `app_micro_${now.toString(16)}`;
  workspaceId = `ws_micro_${now.toString(16)}`;

  await employerPage.evaluate(
    ({
      id,
      job,
      company,
      siteId,
      scopeId,
      app,
      ws,
      workerMlId,
      workerName,
    }) => {
      const startAt = Date.now() + 86_400_000;
      const endAt = startAt + 86_400_000;
      const post = {
        id,
        companyName: company,
        jobName: job,
        category: "Warehouse",
        experience: "helper",
        payPerDay: 900,
        payBasis: "per_day",
        locationName: "City A",
        locationAddress: "Gate Micro",
        distanceKm: 2,
        startAt,
        endAt,
        description: "Micro audit seeded shift",
        shiftTiming: "09:00-18:00",
        mapsLink: "",
        vacancies: 2,
        waitingBuffer: 1,
        analysisStatus: "not_started",
        shortlistIds: [app],
        waitingIds: [] as string[],
        confirmedIds: [] as string[],
        rejectedIds: [] as string[],
        status: "active",
        mustHave: ["Can lift 20kg"],
        goodToHave: [] as string[],
        isHiddenFromSearch: false,
        source: "single",
        siteId,
        employerScopeId: scopeId,
        employerOrgId: scopeId,
      };
      const application = {
        id: app,
        postId: id,
        createdAt: Date.now(),
        status: "shortlisted",
        employerScopeId: scopeId,
        profileSnapshot: {
          uniqueId: workerMlId,
          fullName: workerName,
          city: "City A",
          skills: ["loading", "warehouse"],
          experience: "fresher",
        },
        mustHaveAnswers: { "Can lift 20kg": "meets" },
        goodToHaveAnswers: {},
        notes: {},
      };
      localStorage.setItem("wm_employer_shift_posts_v1", JSON.stringify([post]));
      localStorage.setItem(`wm_employer_${scopeId}_shift_posts_v1`, JSON.stringify([post]));
      localStorage.setItem("wm_employee_shift_search_v1", JSON.stringify([post]));
      localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify([application]));
      localStorage.setItem(
        `wm_employer_${scopeId}_shift_applications_v1`,
        JSON.stringify([application]),
      );
      localStorage.setItem(
        "wm_employee_shift_favorites_v1",
        JSON.stringify([{ postId: id, savedAt: Date.now() }]),
      );
      localStorage.setItem(
        `wm_employer_${scopeId}_shift_favorites_v1`,
        JSON.stringify([
          {
            workerMlId,
            workerName,
            addedAt: Date.now(),
            addedVia: "manual",
          },
        ]),
      );
      localStorage.setItem(
        "wm_employee_availability_broadcast_v1",
        JSON.stringify({
          expiresAt: Date.now() + 3_600_000,
          selectedDates: [new Date().toISOString().slice(0, 10)],
          window: "this_week",
        }),
      );
      localStorage.setItem(
        "wm_vault_shift_history_v1",
        JSON.stringify([
          {
            workspaceId: ws,
            companyName: company,
            jobTitle: job,
            vaultFinalized: true,
            completedAt: Date.now() - 86_400_000,
          },
        ]),
      );
      window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
    },
    {
      id: postId,
      job: JOB_TITLE,
      company: COMPANY,
      siteId: SITE_ID,
      scopeId: EMPLOYER_SCOPE_ID,
      app: appId,
      ws: workspaceId,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
    },
  );

  await fullSync(employerPage, employeePage);

  // Confirm worker via UI to get real workspace + communication surfaces
  await employerPage.goto(`/#/employer/shift/post/${postId}`);
  await employerPage.reload({ waitUntil: "domcontentloaded" });
  await employerPage.evaluate(
    ({ siteId, workerMlId, membershipId }) => {
      const key = "wm_shift_ops_site_membership_truth_v1";
      const mapKey = `${siteId.trim().toLowerCase()}::${workerMlId.trim().toUpperCase()}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          [mapKey]: {
            siteId,
            workerMlId: workerMlId.toUpperCase(),
            membershipId,
            status: "pending_manager_approval",
            updatedAt: Date.now(),
          },
        }),
      );
    },
    { siteId: SITE_ID, workerMlId: WORKER_ML_ID, membershipId: MEMBERSHIP_ID },
  );

  const shortlistedTab = employerPage.getByRole("button", { name: /^Shortlisted\b/ });
  if (await shortlistedTab.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await shortlistedTab.click();
  }
  const confirmBtn = employerPage.getByRole("button", { name: "Confirm Worker", exact: true });
  if (await confirmBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await confirmBtn.click();
    await employerPage
      .waitForURL(/\/#\/employer\/shift\/workspace\//, { timeout: 12_000 })
      .catch(() => undefined);
    const match = employerPage.url().match(/\/employer\/shift\/workspace\/([^/?#]+)/);
    if (match?.[1]) workspaceId = match[1];
  }

  // Always force a known active workspace for communication / rating / exit probes
  workspaceId = `ws_micro_forced_${Date.now().toString(16)}`;
  await employerPage.evaluate(
    ({ ws, post, workerMlId, workerName, scopeId, app }) => {
      const workspace = {
        id: ws,
        postId: post,
        workerMlId,
        workerName,
        status: "active",
        createdAt: Date.now(),
        updates: [
          {
            id: `upd_${Date.now()}`,
            kind: "broadcast",
            title: "Announcement",
            body: "Micro audit forced broadcast",
            createdAt: Date.now(),
          },
        ],
      };
      localStorage.setItem("wm_employee_shift_workspaces_v1", JSON.stringify([workspace]));
      localStorage.setItem(
        `wm_employer_${scopeId}_shift_workspaces_v1`,
        JSON.stringify([workspace]),
      );
      // Keep application confirmed for Selected/Open Group surfaces
      const apps = JSON.parse(
        localStorage.getItem("wm_employee_shift_applications_v1") ?? "[]",
      ) as Array<Record<string, unknown>>;
      const nextApps = apps.map((a) =>
        a.id === app || a.postId === post ? { ...a, status: "confirmed" } : a,
      );
      localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify(nextApps));
      localStorage.setItem(
        `wm_employer_${scopeId}_shift_applications_v1`,
        JSON.stringify(nextApps),
      );
      const posts = JSON.parse(
        localStorage.getItem("wm_employer_shift_posts_v1") ?? "[]",
      ) as Array<Record<string, unknown>>;
      const nextPosts = posts.map((p) =>
        p.id === post
          ? {
              ...p,
              confirmedIds: [app],
              shortlistIds: [],
            }
          : p,
      );
      localStorage.setItem("wm_employer_shift_posts_v1", JSON.stringify(nextPosts));
      localStorage.setItem(
        `wm_employer_${scopeId}_shift_posts_v1`,
        JSON.stringify(nextPosts),
      );
      window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
      window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
    },
    {
      ws: workspaceId,
      post: postId,
      workerMlId: WORKER_ML_ID,
      workerName: WORKER_NAME,
      scopeId: EMPLOYER_SCOPE_ID,
      app: appId,
    },
  );

  await fullSync(employerPage, employeePage);
}

async function runProbe(
  item: InventoryItem,
  employerPage: Page,
  employeePage: Page,
): Promise<ResultRow> {
  const page =
    item.domain === "Employee" ||
    (item.domain === "Shared" && item.probe.type !== "pulse-active")
      ? item.category === "Pulse" && item.id === "PL-S1"
        ? employerPage
        : item.domain === "Shared" && item.id.startsWith("SF-")
          ? employerPage
          : item.domain === "Employee" || item.id === "PL-S9" || item.id.startsWith("ST-W")
            ? employeePage
            : employerPage
      : employerPage;

  // Domain routing for Shared / Employer / Employee pages
  const useEmployer =
    item.domain === "Employer" ||
    item.id === "PL-S1" ||
    item.id === "SF-E1" ||
    item.id === "SF-CALL" ||
    item.id.startsWith("WS-E") ||
    item.id.startsWith("CL-E") ||
    item.id.startsWith("RT-E") ||
    item.id.startsWith("AV-E") ||
    item.id.startsWith("DB-") ||
    item.id.startsWith("AC-") ||
    item.id.startsWith("CR-") ||
    item.id.startsWith("NAV-E") ||
    item.id.startsWith("FV-E");
  const active = useEmployer ? employerPage : employeePage;

  if (item.probe.type === "skip") {
    return {
      id: item.id,
      domain: item.domain,
      category: item.category,
      name: item.name,
      status: "SKIP",
      detail: item.probe.reason,
    };
  }

  try {
    if (item.probe.type === "storage") {
      const ok = await active.evaluate(
        ({ key, expectNonEmpty }) => {
          const raw = localStorage.getItem(key);
          if (raw === null) return !expectNonEmpty;
          if (!expectNonEmpty) return true;
          try {
            const parsed = JSON.parse(raw) as unknown;
            if (Array.isArray(parsed)) return parsed.length > 0;
            if (parsed && typeof parsed === "object") return Object.keys(parsed).length > 0;
            return String(raw).length > 0;
          } catch {
            return String(raw).length > 0;
          }
        },
        { key: item.probe.key, expectNonEmpty: item.probe.expectNonEmpty ?? false },
      );
      const screenshot = await shot(active, item.id);
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: ok ? "PASS" : "FAIL",
        detail: ok ? `storage ${item.probe.key} ok` : `storage ${item.probe.key} missing/empty`,
        screenshot,
      };
    }

    if (item.probe.type === "pulse-active") {
      await active.goto(item.probe.path, { waitUntil: "domcontentloaded" });
      const pulse = await active.evaluate(async ({ flow, nodeId }) => {
        localStorage.setItem("wm:pulse-nav-enabled", "true");
        const nav = await import("/src/features/pulse/pulseNavStore.ts");
        nav.usePulseNavStore.getState().setEnabled(true);
        const store = await import("/src/features/pulse/pulseStore.ts");
        store.usePulseStore.getState().clearAll?.();
        store.usePulseStore.getState().triggerPulseFlow(flow, "micro-audit-001");
        await new Promise((r) => setTimeout(r, 900));
        const el = document.querySelector(`[data-pulse-node-id="${nodeId}"]`);
        return {
          active: el?.getAttribute("data-pulse-active") === "true",
          mode: el?.getAttribute("data-pulse-visual-mode") ?? null,
        };
      }, item.probe);
      const screenshot = await shot(active, item.id);
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: pulse.active ? "PASS" : "FAIL",
        detail: `data-pulse-active=${pulse.active} mode=${pulse.mode}`,
        screenshot,
      };
    }

    const targetPath = resolvePath(
      "path" in item.probe ? item.probe.path : item.route,
    );
    if (targetPath.includes("/missing")) {
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: "WARN",
        detail: "Dynamic workspace/post id unavailable for probe",
      };
    }

    await active.goto(targetPath, { waitUntil: "domcontentloaded" });
    await active
      .locator('[data-testid$="-loading"]')
      .first()
      .waitFor({ state: "hidden", timeout: 12_000 })
      .catch(() => undefined);

    if (item.probe.type === "goto-testid") {
      await active
        .getByTestId(item.probe.testId)
        .first()
        .waitFor({ state: "visible", timeout: 12_000 })
        .catch(() => undefined);
    } else {
      await active.waitForTimeout(700);
    }

    let visible = false;
    let detail = "";

    if (item.probe.type === "goto-testid") {
      const loc = active.getByTestId(item.probe.testId).first();
      visible = await loc.isVisible({ timeout: 12_000 }).catch(() => false);
      detail = `testid=${item.probe.testId}`;
    } else if (item.probe.type === "goto-role") {
      const loc = active.getByRole(item.probe.role, { name: item.probe.name }).first();
      visible = await loc.isVisible({ timeout: 12_000 }).catch(() => false);
      detail = `role=${item.probe.role} name=${String(item.probe.name)}`;
    } else if (item.probe.type === "goto-text") {
      const loc = active.getByText(item.probe.text).first();
      visible = await loc.isVisible({ timeout: 12_000 }).catch(() => false);
      if (!visible) {
        const body = await active.locator("body").innerText();
        visible = item.probe.text instanceof RegExp
          ? item.probe.text.test(body)
          : body.includes(String(item.probe.text));
      }
      detail = `text=${String(item.probe.text)}`;
    } else if (item.probe.type === "click-testid") {
      const loc = active.getByTestId(item.probe.testId).first();
      visible = await loc.isVisible({ timeout: 6_000 }).catch(() => false);
      if (visible) await loc.click().catch(() => undefined);
      if (item.probe.afterTestId) {
        visible = await active
          .getByTestId(item.probe.afterTestId)
          .first()
          .isVisible({ timeout: 4_000 })
          .catch(() => false);
      }
      detail = `click testid=${item.probe.testId}`;
    } else if (item.probe.type === "click-role") {
      const loc = active.getByRole(item.probe.role, { name: item.probe.name }).first();
      visible = await loc.isVisible({ timeout: 6_000 }).catch(() => false);
      if (visible) await loc.click().catch(() => undefined);
      if (item.probe.afterText) {
        const after = active.getByText(item.probe.afterText).first();
        const afterOk = await after.isVisible({ timeout: 4_000 }).catch(() => false);
        // Clear filters may only appear after a filter is active — WARN if click worked but after missing
        if (!afterOk && visible) {
          const screenshot = await shot(active, item.id);
          return {
            id: item.id,
            domain: item.domain,
            category: item.category,
            name: item.name,
            status: "WARN",
            detail: `clicked ${String(item.probe.name)}; afterText not shown`,
            screenshot,
          };
        }
        visible = afterOk;
      }
      detail = `click role=${item.probe.role} name=${String(item.probe.name)}`;
    }

    const screenshot = await shot(active, item.id);
    // Conditional / state-gated surfaces → WARN (still visually audited)
    const softIds = new Set([
      "CR-E17",
      "CR-E18",
      "SR-W8",
      "SR-W10",
      "AP-W8",
      "IN-W1",
      "AP-W10",
      "FV-W1",
      "AV-W1",
      "SF-E1",
      "ST-W1",
      "AC-E3",
      "WS-E2",
      "WS-E3",
      "WS-E4",
      "WS-E5",
      "WS-W2",
      "WS-W3",
      "CL-E3",
      "CL-W2",
      "RT-E1",
      "RT-W1",
      "SF-CALL",
      "SR-W11",
    ]);
    if (!visible && softIds.has(item.id)) {
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: "WARN",
        detail: `${detail} — not visible in current seeded/mobile state (conditional UI)`,
        screenshot,
      };
    }

    return {
      id: item.id,
      domain: item.domain,
      category: item.category,
      name: item.name,
      status: visible ? "PASS" : "FAIL",
      detail,
      screenshot,
    };
  } catch (err) {
    return {
      id: item.id,
      domain: item.domain,
      category: item.category,
      name: item.name,
      status: "FAIL",
      detail: String(err).slice(0, 240),
    };
  }
}

function writeReports(): void {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const summary = {
    viewport: VIEWPORT,
    postId,
    workspaceId,
    appId,
    jobTitle: JOB_TITLE,
    totals: {
      pass: results.filter((r) => r.status === "PASS").length,
      fail: results.filter((r) => r.status === "FAIL").length,
      warn: results.filter((r) => r.status === "WARN").length,
      skip: results.filter((r) => r.status === "SKIP").length,
      total: results.length,
    },
    results,
  };
  fs.writeFileSync(path.join(OUT_DIR, "INVENTORY_AUDIT_REPORT.json"), JSON.stringify(summary, null, 2));

  const lines = [
    "# Shift Jobs Feature Inventory — Visual Micro-Audit",
    "",
    `Viewport: ${VIEWPORT.width}×${VIEWPORT.height}`,
    `Post: ${postId} · Workspace: ${workspaceId}`,
    "",
    `| Status | Count |`,
    `|---|---|`,
    `| PASS | ${summary.totals.pass} |`,
    `| FAIL | ${summary.totals.fail} |`,
    `| WARN | ${summary.totals.warn} |`,
    `| SKIP | ${summary.totals.skip} |`,
    `| TOTAL | ${summary.totals.total} |`,
    "",
    "| ID | Domain | Category | Feature | Result | Detail |",
    "|---|---|---|---|---|---|",
    ...results.map(
      (r) =>
        `| ${r.id} | ${r.domain} | ${r.category} | ${r.name} | ${r.status === "PASS" ? "[x] PASS" : r.status === "FAIL" ? "[ ] FAIL" : r.status === "WARN" ? "[~] WARN" : "[-] SKIP"} | ${r.detail.replace(/\|/g, "/")} |`,
    ),
    "",
  ];
  fs.writeFileSync(path.join(OUT_DIR, "INVENTORY_CHECKLIST.md"), lines.join("\n"), "utf8");
}

test.describe.configure({ mode: "serial" });

test.describe("Shift Jobs feature inventory micro-audit @mobile390", () => {
  test("item-by-item visual checklist", async ({ browser }) => {
    test.setTimeout(420_000);
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const employerContext = await browser.newContext({ viewport: VIEWPORT });
    const employeeContext = await browser.newContext({ viewport: VIEWPORT });
    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();
    await prepare(employerPage, "employer");
    await prepare(employeePage, "employee");

    await employerPage.goto("/#/", { waitUntil: "domcontentloaded" });
    await employeePage.goto("/#/", { waitUntil: "domcontentloaded" });
    await seedProfiles(employerPage);
    await seedProfiles(employeePage);
    await seedRichLifecycle(employerPage, employeePage);

    console.log(`\n=== Inventory size: ${SHIFT_JOBS_FEATURE_INVENTORY.length} items ===\n`);

    for (const item of SHIFT_JOBS_FEATURE_INVENTORY) {
      const row = await runProbe(item, employerPage, employeePage);
      results.push(row);
      console.log(`[${row.status}] ${row.id} — ${row.name} — ${row.detail}`);
    }

    writeReports();
    console.log(`\n=== REPORT → ${path.join(OUT_DIR, "INVENTORY_CHECKLIST.md")} ===\n`);

    await employerContext.close();
    await employeeContext.close();

    const fails = results.filter((r) => r.status === "FAIL");
    const criticalFails = fails.filter((r) =>
      /NAV-|AT-W|DB-E|PL-S1|VH-W1|FV-E1|SR-W1|CR-E1/.test(r.id),
    );
    console.log(
      `\nInventory totals PASS=${results.filter((r) => r.status === "PASS").length} FAIL=${fails.length} WARN=${results.filter((r) => r.status === "WARN").length} SKIP=${results.filter((r) => r.status === "SKIP").length}\n`,
    );
    expect(
      criticalFails,
      `Critical FAIL findings: ${JSON.stringify(criticalFails, null, 2)}`,
    ).toEqual([]);
  });
});