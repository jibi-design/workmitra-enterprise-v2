/**
 * Job Mitra — Career Module Feature Inventory Live Visual Micro-Audit
 * Mobile 390×844 — every inventory feature physically rendered + screenshot.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/live-visual-career-micro-audit.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  CAREER_FEATURE_INVENTORY,
  type CareerInventoryItem,
} from "./helpers/careerFeatureInventory";

const VIEWPORT = { width: 390, height: 844 };
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const OUT_DIR = path.resolve("test-results/career-feature-inventory");

const POST_ID = `career-aud-post-${Date.now().toString(16)}`;
const APP_APPLIED = `career-aud-app-applied`;
const APP_SHORTLIST = `career-aud-app-shortlist`;
const APP_INTERVIEW = `career-aud-app-interview`;
const APP_OFFERED = `career-aud-app-offered`;
const WS_ID = `career-aud-ws-1`;
const WORKER_ML = "ML-AUD-CAREER-WRK1";
const WORKER_NAME = "Career Audit Worker";
const COMPANY = "Career Audit Co";
const JOB_TITLE = "Operations Executive";

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

/** Conditional / stage-gated surfaces — WARN when not mounted in seed */
const SOFT_IDS = new Set([
  "DB-CE5",
  "CR-CE6",
  "CR-CE10",
  "SR-CW7",
  "SR-CW8",
  "SR-CW13",
  "AP-CW6",
  "AP-CW7",
  "AP-CW12",
  "AP-CE1",
  "AC-CE1",
  "AC-CE3",
  "AC-CE4",
  "AC-CE6",
  "AC-CE11",
  "AC-CE15",
  "AC-CE17",
  "IV-CE1",
  "IV-CE2",
  "IV-CE6",
  "IV-CW1",
  "IV-CW2",
  "IV-CW4",
  "VT-CW3",
  "VT-CW4",
  "VT-CE1",
  "AL-CW1",
  "AL-CE1",
  "AL-CW2",
  "AL-CE2",
  "NAV-SH1",
]);

function resolvePath(raw: string | undefined): string {
  if (!raw) return "/#/";
  return raw
    .replace("DYNAMIC_POST", `/#/employee/career/post/${POST_ID}`)
    .replace("DYNAMIC_DASH", `/#/employer/career/post/${POST_ID}`)
    .replace("DYNAMIC_WS", `/#/employee/career/workspace/${WS_ID}`)
    .replace(
      "DYNAMIC_VAULT",
      `/#/employer/career/post/${POST_ID}/candidate/${APP_SHORTLIST}/work-vault-review`,
    )
    .replace("DYNAMIC_QUICK_VIEW", `career-applicant-quick-view-${APP_APPLIED}`);
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
        if (sessionRole === "employee") {
          localStorage.setItem(
            "wm_employee_profile_v1",
            JSON.stringify({
              uniqueId: workerMl,
              fullName: workerName,
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
      workerMl: WORKER_ML,
      workerName: WORKER_NAME,
    },
  );
  await page.setViewportSize(VIEWPORT);
}

async function seedCareerAuditState(page: Page): Promise<void> {
  await page.evaluate(
    async ({
      postId,
      appApplied,
      appShortlist,
      appInterview,
      appOffered,
      wsId,
      workerMl,
      workerName,
      company,
      jobTitle,
    }) => {
      const now = Date.now();
      const closingDate = now + 30 * 86_400_000;

      try {
        const pii = await import("/src/shared/security/piiSecureStorage.ts");
        pii.piiSecureStorage.setJson("wm_employer_profile_v1", {
          companyName: company,
          registrationNo: "",
          industryType: "Professional Services",
          companySize: "11–50",
          locationCity: "City A",
          locationState: "Region",
          companyDescription: "Career audit employer",
          fullName: "Career Employer",
          email: "employer.career.aud@mitralabs.test",
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
          uniqueId: "ML-AUD-CAREER-EMP1",
          companyUniqueId: "ML-AUD-CAREER-EMP1",
          employerOrgId: "ML-AUD-CAREER-EMP1",
        });
      } catch {
        /* continue without PII */
      }

      const post = {
        id: postId,
        employerId: "ML-AUD-CAREER-EMP1",
        companyName: company,
        jobTitle,
        department: "Operations",
        jobType: "full-time",
        workMode: "on-site",
        location: "City A",
        vacancies: 2,
        probationPeriod: "none",
        salaryMin: 25000,
        salaryMax: 35000,
        salaryPeriod: "monthly",
        noticePeriodDays: 30,
        experienceMin: 0,
        experienceMax: 3,
        qualifications: ["Graduate"],
        skills: ["Operations", "Communication"],
        description: "Career module live visual audit post.",
        responsibilities: ["Daily operations", "Team coordination"],
        interviewRounds: 2,
        roundConfigs: [
          { round: 1, label: "Screening", mode: "phone" },
          { round: 2, label: "Final", mode: "video" },
        ],
        status: "active",
        createdAt: now,
        updatedAt: now,
        closingDate,
        screeningQuestions: ["Are you available to join within 30 days?"],
        isTemplate: false,
        totalApplications: 4,
        shortlisted: 1,
        inInterview: 1,
        offered: 1,
        hired: 0,
        rejected: 0,
      };

      const draft = {
        ...post,
        id: `${postId}-draft`,
        jobTitle: `${jobTitle} Draft`,
        status: "draft",
        totalApplications: 0,
        shortlisted: 0,
        inInterview: 0,
        offered: 0,
      };

      const searchable = [
        {
          id: post.id,
          companyName: post.companyName,
          jobTitle: post.jobTitle,
          department: post.department,
          jobType: post.jobType,
          workMode: post.workMode,
          location: post.location,
          salaryMin: post.salaryMin,
          salaryMax: post.salaryMax,
          salaryPeriod: post.salaryPeriod,
          experienceMin: post.experienceMin,
          experienceMax: post.experienceMax,
          skills: post.skills,
          description: post.description,
          status: post.status,
          closingDate: post.closingDate,
          interviewRounds: post.interviewRounds,
          createdAt: post.createdAt,
        },
      ];

      const baseApp = {
        jobId: postId,
        employeeId: workerMl,
        employeeName: workerName,
        companyName: company,
        jobTitle,
        location: "City A",
        appliedAt: now - 86_400_000,
        updatedAt: now,
        coverNote: "Excited to apply for the career audit role.",
        expectedSalary: 30000,
        noticePeriodDays: 15,
        screeningAnswers: { "0": "Yes" },
        resumeSummary: "5 years operations experience",
      };

      const apps = [
        {
          ...baseApp,
          id: appApplied,
          stage: "applied",
          employeeId: `${workerMl}-A`,
          employeeName: `${workerName} A`,
        },
        {
          ...baseApp,
          id: appShortlist,
          stage: "shortlisted",
          employeeId: `${workerMl}-S`,
          employeeName: `${workerName} S`,
        },
        {
          ...baseApp,
          id: appInterview,
          stage: "interview",
          employeeId: workerMl,
          employeeName: workerName,
          interviewRound: 1,
          interviewStatus: "scheduled",
          interviewMode: "phone",
          interviewAt: now + 2 * 86_400_000,
        },
        {
          ...baseApp,
          id: appOffered,
          stage: "offered",
          employeeId: `${workerMl}-O`,
          employeeName: `${workerName} O`,
          offerSalary: 32000,
        },
      ];

      // Primary worker owns interview app for Accept/Decline + applied twin for withdraw probes
      const employeeApps = [
        {
          ...baseApp,
          id: appInterview,
          stage: "interview",
          employeeId: workerMl,
          employeeName: workerName,
          interviewRound: 1,
          interviewStatus: "pending_rsvp",
          interviewMode: "phone",
          interviewAt: now + 2 * 86_400_000,
        },
        {
          ...baseApp,
          id: `${appApplied}-self`,
          stage: "applied",
          employeeId: workerMl,
          employeeName: workerName,
        },
        {
          ...baseApp,
          id: appOffered,
          stage: "offered",
          employeeId: workerMl,
          employeeName: workerName,
          offerSalary: 32000,
        },
      ];

      const workspace = {
        id: wsId,
        jobId: postId,
        applicationId: appOffered,
        companyName: company,
        jobTitle,
        status: "active",
        employeeId: workerMl,
        employeeName: workerName,
        startedAt: now - 7 * 86_400_000,
        location: "City A",
      };

      localStorage.setItem("wm_employer_career_posts_v1", JSON.stringify([post, draft]));
      localStorage.setItem("wm_employee_career_posts_search_v1", JSON.stringify(searchable));
      localStorage.setItem("wm_employee_career_applications_v1", JSON.stringify(employeeApps));
      // Employer candidate list often reads same applications key / projection
      localStorage.setItem(
        "wm_employer_career_applications_v1",
        JSON.stringify(apps),
      );
      localStorage.setItem("wm_employee_career_workspaces_v1", JSON.stringify([workspace]));
      localStorage.setItem(
        "wm_employee_career_saved_jobs_v1",
        JSON.stringify([postId]),
      );
      localStorage.setItem(
        "wm_vault_career_history_v1",
        JSON.stringify([
          {
            id: "vch-aud-1",
            jobId: postId,
            jobTitle,
            companyName: company,
            closedAt: now - 30 * 86_400_000,
            vaultHit: true,
          },
        ]),
      );

      // Pending interview RSVP for alerts hub
      const pending = [
        {
          id: `career-interview-rsvp-${postId}`,
          domain: "career",
          kind: "interview_rsvp",
          title: "Interview invitation",
          body: `${jobTitle} — please respond`,
          createdAt: now,
          href: "/#/employee/career/applications",
        },
        {
          id: `career-offer-response-${postId}`,
          domain: "career",
          kind: "offer_response",
          title: "Offer received",
          body: `${jobTitle} offer awaiting response`,
          createdAt: now,
          href: "/#/employee/career/applications",
        },
      ];
      localStorage.setItem("wm_pending_actions_v1", JSON.stringify(pending));

      for (const ev of [
        "wm:employer-career-posts-changed",
        "wm:employee-career-applications-changed",
        "wm:employee-career-workspaces-changed",
        "wm:vault-career-history-changed",
        "wm:pending-actions-changed",
      ]) {
        window.dispatchEvent(new Event(ev));
      }
    },
    {
      postId: POST_ID,
      appApplied: APP_APPLIED,
      appShortlist: APP_SHORTLIST,
      appInterview: APP_INTERVIEW,
      appOffered: APP_OFFERED,
      wsId: WS_ID,
      workerMl: WORKER_ML,
      workerName: WORKER_NAME,
      company: COMPANY,
      jobTitle: JOB_TITLE,
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
        key.startsWith("wm_") ||
        key.startsWith("wm:") ||
        key.includes("career") ||
        key.includes("vault") ||
        key.includes("pending") ||
        key.includes("pulse")
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
      "wm:employer-career-posts-changed",
      "wm:employee-career-applications-changed",
      "wm:employee-career-workspaces-changed",
      "wm:pending-actions-changed",
      "wm:app-settings-changed",
    ]) {
      window.dispatchEvent(new Event(ev));
    }
  }, snapshot);
}

async function runProbe(
  item: CareerInventoryItem,
  employerPage: Page,
  employeePage: Page,
): Promise<ResultRow> {
  const useEmployer =
    item.domain === "Employer" ||
    item.id.startsWith("AL-CE") ||
    item.id.startsWith("ST-POSTS") ||
    item.id.startsWith("DM-") ||
    (item.domain === "Shared" &&
      (item.id.startsWith("VT-CE") || item.id === "ST-VAULT" || item.id === "NAV-SH1"));

  const active =
    item.domain === "Employee" ||
    item.id.startsWith("AL-CW") ||
    item.id.startsWith("ST-APPS") ||
    item.id.startsWith("ST-SEARCH")
      ? employeePage
      : useEmployer
        ? employerPage
        : employeePage;

  // Guest browse can run on either context
  const page = item.id === "NAV-SH1" ? employeePage : active;

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
      const ok = await page.evaluate(
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
      const screenshot = await shot(page, item.id);
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
      await page.goto(item.probe.path, { waitUntil: "domcontentloaded" });
      const pulse = await page.evaluate(async ({ flow, nodeId }) => {
        localStorage.setItem("wm:pulse-nav-enabled", "true");
        try {
          const nav = await import("/src/features/pulse/pulseNavStore.ts");
          nav.usePulseNavStore.getState().setEnabled(true);
          const store = await import("/src/features/pulse/pulseStore.ts");
          store.usePulseStore.getState().clearAll?.();
          if (typeof store.usePulseStore.getState().triggerPulseFlow === "function") {
            store.usePulseStore.getState().triggerPulseFlow(flow, "career-audit-001");
          }
          await new Promise((r) => setTimeout(r, 900));
        } catch {
          /* soft */
        }
        const el = document.querySelector(
          `[data-pulse-node-id="${nodeId}"], [data-pulse-node="${nodeId}"]`,
        );
        return {
          active: el?.getAttribute("data-pulse-active") === "true",
          mode: el?.getAttribute("data-pulse-visual-mode") ?? null,
          found: Boolean(el),
        };
      }, item.probe);
      const screenshot = await shot(page, item.id);
      const ok = pulse.active;
      return {
        id: item.id,
        domain: item.domain,
        category: item.category,
        name: item.name,
        status: ok ? "PASS" : SOFT_IDS.has(item.id) ? "WARN" : "FAIL",
        detail: `data-pulse-active=${pulse.active} found=${pulse.found} mode=${pulse.mode}`,
        screenshot,
      };
    }

    let targetPath = resolvePath("path" in item.probe ? item.probe.path : item.route);
    if (item.probe.type === "goto-testid" && item.probe.testId === "DYNAMIC_QUICK_VIEW") {
      // rewritten in resolvePath for path; testId still dynamic
    }
    const testId =
      item.probe.type === "goto-testid"
        ? item.probe.testId.replace("DYNAMIC_QUICK_VIEW", `career-applicant-quick-view-${APP_APPLIED}`)
        : "";

    await page.goto(targetPath, { waitUntil: "domcontentloaded" });
    await page
      .locator('[data-testid$="-loading"]')
      .first()
      .waitFor({ state: "hidden", timeout: 12_000 })
      .catch(() => undefined);

    if (item.probe.type === "goto-testid") {
      const tid = testId || item.probe.testId;
      await page
        .getByTestId(tid)
        .first()
        .waitFor({ state: "visible", timeout: 12_000 })
        .catch(() => undefined);
    } else if (item.probe.type !== "pulse-active") {
      await page.waitForTimeout(700);
    }

    // Pipeline tabs needed before stage actions
    if (
      ["IV-CE1", "IV-CE2", "AC-CE1", "AC-CE3", "AC-CE4", "AC-CE6", "AP-CE1"].includes(item.id)
    ) {
      const applied = page.getByRole("button", { name: /^Applied$/i });
      if (await applied.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await applied.click().catch(() => undefined);
        await page.waitForTimeout(300);
      }
    }
    if (["IV-CE6", "AC-CE17"].includes(item.id)) {
      const offered = page.getByRole("button", { name: /Offered|Offers/i });
      if (await offered.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await offered.click().catch(() => undefined);
        await page.waitForTimeout(300);
      }
    }
    if (["IV-CW1", "IV-CW2"].includes(item.id)) {
      const interview = page.getByRole("button", { name: /^Interview$/i });
      if (await interview.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await interview.click().catch(() => undefined);
        await page.waitForTimeout(300);
      }
    }
    if (item.id === "IV-CW4") {
      const offers = page.getByRole("button", { name: /^Offers$/i });
      if (await offers.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await offers.click().catch(() => undefined);
        await page.waitForTimeout(300);
      }
    }

    let visible = false;
    let detail = "";

    if (item.probe.type === "goto-testid") {
      const loc = page.getByTestId(testId || item.probe.testId).first();
      visible = await loc.isVisible({ timeout: 12_000 }).catch(() => false);
      detail = `testid=${testId || item.probe.testId}`;
    } else if (item.probe.type === "goto-role") {
      const loc = page.getByRole(item.probe.role, { name: item.probe.name }).first();
      visible = await loc.isVisible({ timeout: 12_000 }).catch(() => false);
      detail = `role=${item.probe.role} name=${String(item.probe.name)}`;
    } else if (item.probe.type === "goto-text") {
      const loc = page.getByText(item.probe.text).first();
      visible = await loc.isVisible({ timeout: 12_000 }).catch(() => false);
      if (!visible) {
        const body = await page.locator("body").innerText();
        visible =
          item.probe.text instanceof RegExp
            ? item.probe.text.test(body)
            : body.includes(String(item.probe.text));
      }
      detail = `text=${String(item.probe.text)}`;
    } else if (item.probe.type === "click-testid") {
      const loc = page.getByTestId(item.probe.testId).first();
      visible = await loc.isVisible({ timeout: 6_000 }).catch(() => false);
      if (visible) await loc.click().catch(() => undefined);
      if (item.probe.afterTestId) {
        visible = await page
          .getByTestId(item.probe.afterTestId)
          .first()
          .isVisible({ timeout: 4_000 })
          .catch(() => false);
      }
      detail = `click testid=${item.probe.testId}`;
    } else if (item.probe.type === "click-role") {
      const loc = page.getByRole(item.probe.role, { name: item.probe.name }).first();
      visible = await loc.isVisible({ timeout: 6_000 }).catch(() => false);
      if (visible) await loc.click().catch(() => undefined);
      await page.waitForTimeout(300);
      if (item.probe.afterText) {
        const afterOk = await page
          .getByText(item.probe.afterText)
          .first()
          .isVisible({ timeout: 4_000 })
          .catch(() => false);
        if (!afterOk && visible) {
          const screenshot = await shot(page, item.id);
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

    const screenshot = await shot(page, item.id);
    if (!visible && SOFT_IDS.has(item.id)) {
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
    postId: POST_ID,
    workspaceId: WS_ID,
    jobTitle: JOB_TITLE,
    inventoryCount: CAREER_FEATURE_INVENTORY.length,
    totals: {
      pass: results.filter((r) => r.status === "PASS").length,
      fail: results.filter((r) => r.status === "FAIL").length,
      warn: results.filter((r) => r.status === "WARN").length,
      skip: results.filter((r) => r.status === "SKIP").length,
      total: results.length,
    },
    results,
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "CAREER_INVENTORY_AUDIT_REPORT.json"),
    JSON.stringify(summary, null, 2),
  );

  const lines = [
    "# Career Module Feature Inventory — Live Visual Micro-Audit",
    "",
    `Viewport: ${VIEWPORT.width}×${VIEWPORT.height}`,
    `Post: ${POST_ID} · Workspace: ${WS_ID}`,
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
  fs.writeFileSync(path.join(OUT_DIR, "CAREER_INVENTORY_CHECKLIST.md"), lines.join("\n"), "utf8");
}

test.describe.configure({ mode: "serial" });

test.describe("Career Module feature inventory micro-audit @mobile390", () => {
  test("item-by-item live visual checklist", async ({ browser }) => {
    test.setTimeout(480_000);
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const employerContext = await browser.newContext({ viewport: VIEWPORT });
    const employeeContext = await browser.newContext({ viewport: VIEWPORT });
    const employerPage = await employerContext.newPage();
    const employeePage = await employeeContext.newPage();
    await prepare(employerPage, "employer");
    await prepare(employeePage, "employee");

    await employerPage.goto("/#/employer/career", { waitUntil: "domcontentloaded" });
    await employeePage.goto("/#/employee/career", { waitUntil: "domcontentloaded" });
    await seedCareerAuditState(employerPage);
    await fullSync(employerPage, employeePage);
    await employerPage.reload({ waitUntil: "domcontentloaded" });
    await employeePage.reload({ waitUntil: "domcontentloaded" });

    console.log(`\n=== Career inventory size: ${CAREER_FEATURE_INVENTORY.length} items ===\n`);

    for (const item of CAREER_FEATURE_INVENTORY) {
      const row = await runProbe(item, employerPage, employeePage);
      results.push(row);
      console.log(`[${row.status}] ${row.id} — ${row.name} — ${row.detail}`);
    }

    writeReports();
    console.log(`\n=== REPORT → ${path.join(OUT_DIR, "CAREER_INVENTORY_CHECKLIST.md")} ===\n`);

    await employerContext.close();
    await employeeContext.close();

    const fails = results.filter((r) => r.status === "FAIL");
    const criticalFails = fails.filter((r) =>
      /^(NAV-CE1|NAV-CW1|SR-CW1|CR-CE1|AP-CW9|DB-CE8|ST-POSTS|ST-APPS)$/.test(r.id),
    );
    console.log(
      `\nCareer inventory totals PASS=${results.filter((r) => r.status === "PASS").length} FAIL=${fails.length} WARN=${results.filter((r) => r.status === "WARN").length} SKIP=${results.filter((r) => r.status === "SKIP").length}\n`,
    );
    expect(
      criticalFails,
      `Critical FAIL findings: ${JSON.stringify(criticalFails, null, 2)}`,
    ).toEqual([]);
  });
});
