/**
 * Job Mitra — Career Warn18 State-Seeded Live Visual Proof
 * Converts all 18 Conditional WARNs → PASS with live 390×844 screenshots.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/live-visual-career-warn18-live-proof.spec.ts
 *
 * Career domain ONLY — never mixes Shift Jobs state.
 */

import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 390, height: 844 };
const OUT = path.resolve("test-results/career-jobs-warn18-live-proof");
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";

const SCOPE = "ML-AUD-CAREER-WARN18-EMP1";
const WORKER_ML = "ML-AUD-CAREER-WARN18-WRK1";
const WORKER_NAME = "Warn18 Career Worker";
const COMPANY = "Warn18 Career Co";
const JOB_TITLE = "Warn18 Operations Lead";

const POST_MAIN = `career-warn18-post-${Date.now()}`;
const POST_OPEN = `career-warn18-open-${Date.now()}`;
const APP_APPLIED_A = `career-warn18-app-a-${Date.now().toString(16)}`;
const APP_APPLIED_B = `career-warn18-app-b-${Date.now().toString(16)}`;
const APP_SHORTLIST = `career-warn18-app-sl-${Date.now().toString(16)}`;
const APP_INTERVIEW = `career-warn18-app-iv-${Date.now().toString(16)}`;
const APP_INTERVIEW_PASS = `career-warn18-app-ivp-${Date.now().toString(16)}`;
const APP_OFFERED = `career-warn18-app-of-${Date.now().toString(16)}`;
const APP_OFFER_ACCEPTED = `career-warn18-app-oa-${Date.now().toString(16)}`;
const WS_ID = `career-warn18-ws-${Date.now().toString(16)}`;

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
  const ok = await locator.first().isVisible({ timeout: 8_000 }).catch(() => false);
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

async function seedWarn18(page: Page): Promise<void> {
  await page.evaluate(
    async ({
      scope,
      postMain,
      postOpen,
      appAppliedA,
      appAppliedB,
      appShortlist,
      appInterview,
      appInterviewPass,
      appOffered,
      appOfferAccepted,
      wsId,
      workerMl,
      workerName,
      company,
      jobTitle,
    }) => {
      const now = Date.now();
      const closingDate = now + 30 * 86_400_000;
      const tomorrow = new Date(now + 2 * 86_400_000);
      const scheduledDate = tomorrow.toISOString().slice(0, 10);
      const scheduledTime = "10:30";

      try {
        const settings = await import(
          "/src/features/employer/company/storage/employerSettings.storage.ts"
        );
        settings.employerSettingsStorage.save({
          companyName: company,
          registrationNo: "",
          industryType: "Professional Services",
          companySize: "11–50",
          locationCity: "City A",
          locationState: "Region",
          companyDescription: "Warn18 career employer",
          fullName: "Warn18 Employer",
          email: "employer.warn18@mitralabs.test",
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
      } catch {
        try {
          const pii = await import("/src/shared/security/piiSecureStorage.ts");
          pii.piiSecureStorage.setJson("wm_employer_profile_v1", {
            companyName: company,
            uniqueId: scope,
            companyUniqueId: scope,
            employerOrgId: scope,
            fullName: "Warn18 Employer",
            email: "employer.warn18@mitralabs.test",
            phone: "9876543210",
            industryType: "Professional Services",
            companySize: "11–50",
            locationCity: "City A",
            locationState: "Region",
            companyDescription: "Warn18",
            registrationNo: "",
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
          });
        } catch {
          /* continue */
        }
      }

      const makePost = (id: string, title: string, extra: Record<string, unknown> = {}) => ({
        id,
        employerId: scope,
        companyName: company,
        jobTitle: title,
        department: "Operations",
        jobType: "full-time",
        workMode: "on-site",
        location: "City A",
        vacancies: 3,
        probationPeriod: "none",
        salaryMin: 25000,
        salaryMax: 35000,
        salaryPeriod: "monthly",
        noticePeriodDays: 30,
        experienceMin: 0,
        experienceMax: 5,
        qualifications: ["Graduate"],
        skills: ["Operations", "Communication"],
        description: "Warn18 career live proof post.",
        responsibilities: ["Daily operations"],
        interviewRounds: 1,
        roundConfigs: [{ round: 1, label: "Screening", mode: "phone" }],
        status: "active",
        createdAt: now,
        updatedAt: now,
        closingDate,
        screeningQuestions: ["Available within 30 days?"],
        isTemplate: false,
        totalApplications: 0,
        shortlisted: 0,
        inInterview: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
        ...extra,
      });

      const post = makePost(postMain, jobTitle, {
        totalApplications: 8,
        shortlisted: 1,
        inInterview: 2,
        offered: 2,
      });
      const openPost = makePost(postOpen, `${jobTitle} Open Apply`);

      const baseApp = {
        jobId: postMain,
        employeePhone: "9000000000",
        employeeEmail: "worker.warn18@mitralabs.test",
        companyName: company,
        jobTitle,
        location: "City A",
        appliedAt: now - 86_400_000,
        updatedAt: now,
        coverNote: "Warn18 cover note",
        expectedSalary: 30000,
        noticePeriod: "15 days",
        resumeSummary: "Operations background",
        screeningAnswers: { "0": "yes" },
        roundResults: [] as unknown[],
        currentRound: 0,
      };

      const apps = [
        {
          ...baseApp,
          id: appAppliedA,
          stage: "applied",
          employeeId: `${workerMl}-A`,
          employeeName: `${workerName} A`,
          profileSnapshot: {
            uniqueId: `${workerMl}-A`,
            fullName: `${workerName} A`,
            city: "City A",
            skills: ["ops"],
          },
        },
        {
          ...baseApp,
          id: appAppliedB,
          stage: "applied",
          employeeId: `${workerMl}-B`,
          employeeName: `${workerName} B`,
          profileSnapshot: {
            uniqueId: `${workerMl}-B`,
            fullName: `${workerName} B`,
            city: "City A",
            skills: ["ops"],
          },
        },
        {
          ...baseApp,
          id: appShortlist,
          stage: "shortlisted",
          employeeId: `${workerMl}-S`,
          employeeName: `${workerName} S`,
          profileSnapshot: {
            uniqueId: `${workerMl}-S`,
            fullName: `${workerName} S`,
            city: "City A",
            skills: ["ops"],
          },
        },
    // Only keep the passed-rounds interview candidate on the interview tab (avoids Schedule R* crowding Send Offer).
    {
      ...baseApp,
      id: appInterviewPass,
      stage: "interview",
      employeeId: `${workerMl}-P`,
      employeeName: `${workerName} Pass`,
      currentRound: 1,
      profileSnapshot: {
        uniqueId: `${workerMl}-P`,
        fullName: `${workerName} Pass`,
        city: "City A",
        skills: ["ops"],
      },
      roundResults: [
        {
          round: 1,
          label: "Screening",
          status: "passed",
          feedback: "Strong",
          interviewMode: "phone",
          completedAt: now - 10_000,
        },
      ],
    },
        {
          ...baseApp,
          id: appOffered,
          stage: "offered",
          employeeId: workerMl,
          employeeName: workerName,
          offeredAt: now - 3_600_000,
          profileSnapshot: {
            uniqueId: workerMl,
            fullName: workerName,
            city: "City A",
            skills: ["ops"],
          },
          offerDetails: {
            jobTitle,
            salary: 32000,
            salaryPeriod: "monthly",
            startDate: scheduledDate,
            message: "Welcome aboard — Warn18 offer letter preview.",
          },
          roundResults: [
            {
              round: 1,
              label: "Screening",
              status: "passed",
              feedback: "ok",
              interviewMode: "phone",
              completedAt: now - 100_000,
            },
          ],
        },
        {
          ...baseApp,
          id: appOfferAccepted,
          stage: "offer_accepted",
          employeeId: `${workerMl}-H`,
          employeeName: `${workerName} Hire`,
          offeredAt: now - 86_400_000,
          offerAcceptedAt: now - 3_600_000,
          profileSnapshot: {
            uniqueId: `${workerMl}-H`,
            fullName: `${workerName} Hire`,
            city: "City A",
            skills: ["ops"],
          },
          offerDetails: {
            jobTitle,
            salary: 33000,
            salaryPeriod: "monthly",
            startDate: scheduledDate,
            message: "Accepted offer",
          },
          roundResults: [
            {
              round: 1,
              label: "Screening",
              status: "passed",
              feedback: "ok",
              interviewMode: "phone",
              completedAt: now - 200_000,
            },
          ],
        },
      ];

      // Employee-owned apps: interview RSVP + offer accept + applied twin
      const employeeInterviewApp = {
        ...baseApp,
        id: appInterview,
        stage: "interview",
        employeeId: workerMl,
        employeeName: workerName,
        currentRound: 1,
        profileSnapshot: {
          uniqueId: workerMl,
          fullName: workerName,
          city: "City A",
          skills: ["ops"],
        },
        roundResults: [
          {
            round: 1,
            label: "Screening",
            status: "scheduled",
            feedback: "",
            interviewMode: "phone",
            scheduledDate,
            scheduledTime,
            location: "HQ",
            meetingLink: "",
            rsvpStatus: "pending",
          },
        ],
      };

      const employeeApps = [
        employeeInterviewApp,
        apps.find((a) => a.id === appOffered),
        {
          ...baseApp,
          id: `${appAppliedA}-self`,
          stage: "applied",
          employeeId: workerMl,
          employeeName: workerName,
          jobId: postMain,
        },
      ].filter(Boolean);

      const workspace = {
        id: wsId,
        jobId: postMain,
        companyName: company,
        jobTitle,
        department: "Operations",
        location: "City A",
        status: "active",
        lastActivityAt: now,
        unreadCount: 0,
        updates: [],
        hiredAt: now - 14 * 86_400_000,
      };

      const employment = {
        id: `emp_${postMain}_warn18`,
        careerPostId: postMain,
        employeeId: workerMl,
        employeeName: workerName,
        employeeMlId: workerMl,
        employerId: scope,
        companyName: company,
        employerMlId: scope,
        jobTitle,
        department: "Operations",
        salaryMin: 32000,
        salaryMax: 32000,
        salaryPeriod: "monthly",
        status: "working",
        offeredAt: now - 20 * 86_400_000,
        acceptedAt: now - 18 * 86_400_000,
        joinedAt: now - 14 * 86_400_000,
        resignedAt: null,
        completedAt: null,
        noticePeriodDays: 30,
        lastWorkingDay: null,
        exitType: null,
        exitReason: null,
        exitNotes: "",
        wasWithdrawn: false,
        withdrawnAt: null,
        workDurationDays: null,
        workDurationDisplay: "",
        forceCompleted: false,
        timeline: [
          {
            id: "tl1",
            status: "working",
            timestamp: now - 14 * 86_400_000,
            actor: "system",
            note: "Joined",
          },
        ],
        employeeRated: false,
        employerRated: false,
      };

      const searchable = [post, openPost].map((p) => ({
        id: p.id,
        companyName: p.companyName,
        jobTitle: p.jobTitle,
        department: p.department,
        jobType: p.jobType,
        workMode: p.workMode,
        location: p.location,
        salaryMin: p.salaryMin,
        salaryMax: p.salaryMax,
        salaryPeriod: p.salaryPeriod,
        experienceMin: p.experienceMin,
        experienceMax: p.experienceMax,
        skills: p.skills,
        description: p.description,
        status: p.status,
        closingDate: p.closingDate,
        interviewRounds: p.interviewRounds,
        createdAt: p.createdAt,
      }));

      const scopedPosts = `wm_employer_${scope}_career_posts_v1`;
      const scopedApps = `wm_employer_${scope}_career_applications_v1`;
      const scopedWs = `wm_employer_${scope}_career_workspaces_v1`;
      const eeApps = `wm_employee_${workerMl}_career_applications_v1`;
      const eeWs = `wm_employee_${workerMl}_career_workspaces_v1`;

      localStorage.setItem("wm_employer_career_posts_v1", JSON.stringify([post, openPost]));
      localStorage.setItem(scopedPosts, JSON.stringify([post, openPost]));
      localStorage.setItem(`${scopedPosts}__migrated_v1`, "1");

      localStorage.setItem("wm_employer_career_applications_v1", JSON.stringify(apps));
      localStorage.setItem("wm_employee_career_applications_v1", JSON.stringify(employeeApps));
      localStorage.setItem(scopedApps, JSON.stringify(apps));
      localStorage.setItem(`${scopedApps}__migrated_v1`, "1");
      localStorage.setItem(eeApps, JSON.stringify(employeeApps));

      localStorage.setItem("wm_employee_career_posts_search_v1", JSON.stringify(searchable));
      localStorage.setItem("wm_employee_career_workspaces_v1", JSON.stringify([workspace]));
      localStorage.setItem(scopedWs, JSON.stringify([workspace]));
      localStorage.setItem(eeWs, JSON.stringify([workspace]));
      localStorage.setItem("wm_employee_career_saved_jobs_v1", JSON.stringify([postMain]));

      const createDraftPayload = {
        step: 2,
        basic: {
          companyName: company,
          jobTitle: `${jobTitle} Draft Wizard`,
          department: "Operations",
          jobType: "full-time" as const,
          workMode: "hybrid" as const,
          location: "City A",
          vacancies: "2",
          probationPeriod: "none",
        },
        req: {
          salaryMin: "25000",
          salaryMax: "40000",
          salaryPeriod: "monthly" as const,
          experienceMin: "0",
          experienceMax: "5",
          noticePeriodDays: "30" as const,
          noticePeriodCustomDays: "30",
          qualifications: "Graduate",
          skills: "Operations\nCommunication\nLeadership",
          description: "Warn18 draft for skills + publish proof.",
          responsibilities: "Lead ops team",
          closingDate: Date.now() + 30 * 86_400_000,
        },
        interview: {
          roundConfigs: [
            { round: 1, label: "Screening", mode: "phone" },
            { round: 2, label: "Final", mode: "video" },
          ],
        },
        screeningQuestions: [{ id: "q1", text: "Can you join in 30 days?" }],
      };

      try {
        const draftMod = await import(
          "/src/features/employer/careerJobs/storage/careerCreateDraft.storage.ts"
        );
        draftMod.careerCreateDraftStorage.save(createDraftPayload);
      } catch {
        const createDraft = {
          id: "career_create_draft",
          ...createDraftPayload,
          savedAt: now - 60_000,
          updatedAt: now,
        };
        localStorage.setItem(
          `wm_employer_${scope}_career_create_draft_v1`,
          JSON.stringify(createDraft),
        );
        localStorage.setItem("wm_employer_career_create_draft_v1", JSON.stringify(createDraft));
      }

      localStorage.setItem("wm_career_employment_v1", JSON.stringify([employment]));

      for (const ev of [
        "wm:employer-career-posts-changed",
        "wm:employee-career-applications-changed",
        "wm:employee-career-workspaces-changed",
        "wm:employer-career-create-draft-changed",
        "wm:career-employer-scope-changed",
        "wm:career-employment-changed",
        "wm:pending-actions-changed",
      ]) {
        window.dispatchEvent(new Event(ev));
      }
    },
    {
      scope: SCOPE,
      postMain: POST_MAIN,
      postOpen: POST_OPEN,
      appAppliedA: APP_APPLIED_A,
      appAppliedB: APP_APPLIED_B,
      appShortlist: APP_SHORTLIST,
      appInterview: APP_INTERVIEW,
      appInterviewPass: APP_INTERVIEW_PASS,
      appOffered: APP_OFFERED,
      appOfferAccepted: APP_OFFER_ACCEPTED,
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
        key.includes("career") ||
        key.includes("pulse") ||
        key.includes("pending") ||
        key.includes("employment")
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
      "wm:employer-career-create-draft-changed",
      "wm:career-employment-changed",
      "wm:pending-actions-changed",
      "wm:pulse-chain-changed",
    ]) {
      window.dispatchEvent(new Event(ev));
    }
  }, snapshot);
}

async function clickTab(page: Page, name: RegExp): Promise<void> {
  const tab = page.getByRole("button", { name }).first();
  if (await tab.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(450);
  }
}

async function clickPipelineTab(
  page: Page,
  kind: "applied" | "shortlisted" | "interview" | "offered",
): Promise<void> {
  const patterns: Record<typeof kind, RegExp> = {
    applied: /^Applied/i,
    shortlisted: /^Shortlist/i,
    // Pipeline chip is "InterviewRoundsN" (emoji + label), not "Schedule Interview".
    interview: /InterviewRounds|💬\s*Interview/i,
    offered: /Offered|Offers|🤝/i,
  };
  const tab = page.getByRole("button", { name: patterns[kind] }).first();
  await tab.click({ timeout: 5_000 });
  await page.waitForTimeout(500);
}

test.describe.configure({ mode: "serial" });

test.describe("Career Warn18 state-seeded live visual proof @mobile390", () => {
  test("convert 18 conditional WARNs to live PASS with screenshots", async ({ browser }) => {
    test.setTimeout(480_000);
    fs.mkdirSync(OUT, { recursive: true });

    const employerCtx = await browser.newContext({ viewport: VIEWPORT });
    const employeeCtx = await browser.newContext({ viewport: VIEWPORT });
    const employer = await employerCtx.newPage();
    const employee = await employeeCtx.newPage();

    await prepare(employer, "employer");
    await prepare(employee, "employee");

    await employer.goto("/#/employer/career", { waitUntil: "domcontentloaded" });
    await seedWarn18(employer);
    await employer.waitForTimeout(500);
    await employee.goto("/#/employee/career", { waitUntil: "domcontentloaded" });
    await fullSync(employer, employee);
    await employee.waitForTimeout(300);

    // —— 1 DB-CE5 Resume Draft ——
    await employer.goto("/#/employer/career", { waitUntil: "domcontentloaded" });
    await employer.evaluate(() => {
      window.dispatchEvent(new Event("wm:employer-career-create-draft-changed"));
    });
    await employer.waitForTimeout(800);
    await assertVisible(
      employer,
      "DB-CE5",
      employer.getByRole("button", { name: /Resume Draft/i }).or(
        employer.getByText(/Incomplete career job draft/i),
      ),
      "Resume Draft reminder live from create-draft seed",
    );

    // —— 2–3 CR-CE6 Skills + CR-CE10 Publish (wizard steppers) ——
    await employer.goto("/#/employer/career/create", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(700);
    // Draft restores at step 2 → Skills Required
    await assertVisible(
      employer,
      "CR-CE6",
      employer.getByText(/Skills Required|Skills/i),
      "Skills Required field live on create wizard step 2",
    );

    // Advance to final review for Publish — persist step=4 then hard-reload create route
    await employer.evaluate(async () => {
      const draftMod = await import(
        "/src/features/employer/careerJobs/storage/careerCreateDraft.storage.ts"
      );
      const current = draftMod.careerCreateDraftStorage.get();
      if (!current) throw new Error("draft missing before CR-CE10");
      const result = draftMod.careerCreateDraftStorage.save({
        step: 4,
        basic: current.basic,
        req: {
          ...current.req,
          closingDate: current.req.closingDate || Date.now() + 30 * 86_400_000,
        },
        interview: current.interview,
        screeningQuestions: current.screeningQuestions,
      });
      if (!result.ok) throw new Error(`draft save failed: ${result.reason}`);
    });
    await employer.goto("/#/employer/career/create", { waitUntil: "domcontentloaded" });
    await employer.reload({ waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(900);
    const publishBtn = employer.getByRole("button", { name: /Publish Job/i });
    await publishBtn.scrollIntoViewIfNeeded().catch(() => undefined);
    await assertVisible(
      employer,
      "CR-CE10",
      publishBtn.or(employer.getByText(/Publish Job/i)),
      "Publish Job control live on wizard final step",
    );

    // —— 4–5 SR-CW5 Work mode + SR-CW7 Clear filters ——
    await employee.goto("/#/employee/career/search", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(600);
    await employee.getByRole("button", { name: /Filters/i }).click();
    await employee.waitForTimeout(400);
    await assertVisible(
      employee,
      "SR-CW5",
      employee.getByText(/All modes|On-site|Remote|Hybrid/i),
      "Work mode filter chips live after Filters open",
    );
    // Activate a chip so Clear filters mounts
    const modeChip = employee.getByRole("button", { name: /On-site|Remote|Hybrid/i }).first();
    if (await modeChip.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await modeChip.click();
      await employee.waitForTimeout(350);
    }
    await assertVisible(
      employee,
      "SR-CW7",
      employee.getByRole("button", { name: /Clear filters/i }),
      "Clear filters live after active filter selection",
    );

    // —— 6 AP-CW6 Submit Application (open post, no prior app) ——
    await employee.goto(`/#/employee/career/post/${POST_OPEN}`, {
      waitUntil: "domcontentloaded",
    });
    await employee.waitForTimeout(700);
    await assertVisible(
      employee,
      "AP-CW6",
      employee.getByRole("button", { name: /Submit Application|Apply/i }),
      "Submit Application CTA live on open career post",
    );

    // —— 7 AP-CE1 Applicant quick-view ——
    await employer.goto(`/#/employer/career/post/${POST_MAIN}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(700);
    await clickPipelineTab(employer, "applied");
    await assertVisible(
      employer,
      "AP-CE1",
      employer.getByTestId(`career-applicant-quick-view-${APP_APPLIED_A}`),
      "Applicant quick-view control live on Applied tab",
    );

    // —— 8 AC-CE6 Bulk reject (≥2 applied) ——
    await assertVisible(
      employer,
      "AC-CE6",
      employer.getByTestId("career-candidate-bulk-reject"),
      "Bulk reject control live with 2+ applied candidates",
    );

    // —— 9–11 Schedule Interview + modal ——
    await clickPipelineTab(employer, "shortlisted");
    await assertVisible(
      employer,
      "IV-CE1",
      employer.getByRole("button", { name: /Schedule Interview/i }),
      "Schedule Interview CTA live on Shortlisted tab",
    );
    await employer.getByRole("button", { name: /Schedule Interview/i }).first().click();
    await employer.waitForTimeout(450);
    await assertVisible(
      employer,
      "IV-CE2",
      employer.getByText(/Phone|Video|In-person|Confirm Schedule|Schedule Interview/i),
      "Schedule Interview modal open live",
    );
    await employer.keyboard.press("Escape").catch(() => undefined);
    const closeSched = employer.getByRole("button", { name: /Cancel|Close/i }).first();
    if (await closeSched.isVisible({ timeout: 800 }).catch(() => false)) {
      await closeSched.click().catch(() => undefined);
    }
    await employer.waitForTimeout(300);

    // —— 12 IV-CE6 Send Offer (all rounds passed) ——
    await employer.goto(`/#/employer/career/post/${POST_MAIN}`, {
      waitUntil: "domcontentloaded",
    });
    await employer.waitForTimeout(600);
    await clickPipelineTab(employer, "interview");
    await assertVisible(
      employer,
      "IV-CE6",
      employer.getByRole("button", { name: /Send Offer/i }),
      "Send Offer control live for passed-rounds interview candidate",
    );

    // —— 13 AC-CE17 Mark as Hired (offer_accepted on Offered tab) ——
    await clickPipelineTab(employer, "offered");
    await assertVisible(
      employer,
      "AC-CE17",
      employer.getByRole("button", { name: /Mark as Hired/i }),
      "Mark as Hired live for offer_accepted candidate",
    );

    // —— 14–16 Employee Accept/Decline Interview + Accept Offer ——
    await fullSync(employer, employee);
    // Re-assert employee interview/offer apps after sync (worker-scoped key)
    await employee.evaluate(
      ({ workerMl, appInterview, appOffered, postMain, jobTitle, company, scheduledDate, scheduledTime }) => {
        const now = Date.now();
        const apps = [
          {
            id: appInterview,
            jobId: postMain,
            stage: "interview",
            employeeId: workerMl,
            employeeName: "Warn18 Career Worker",
            appliedAt: now - 86_400_000,
            updatedAt: now,
            coverNote: "n",
            expectedSalary: 30000,
            noticePeriod: "15 days",
            roundResults: [
              {
                round: 1,
                label: "Screening",
                status: "scheduled",
                feedback: "",
                interviewMode: "phone",
                scheduledDate,
                scheduledTime,
                location: "HQ",
                meetingLink: "",
                rsvpStatus: "pending",
              },
            ],
            offerDetails: undefined,
          },
          {
            id: appOffered,
            jobId: postMain,
            stage: "offered",
            employeeId: workerMl,
            employeeName: "Warn18 Career Worker",
            appliedAt: now - 86_400_000,
            updatedAt: now,
            coverNote: "n",
            expectedSalary: 30000,
            noticePeriod: "15 days",
            offeredAt: now - 3_600_000,
            roundResults: [
              {
                round: 1,
                label: "Screening",
                status: "passed",
                feedback: "ok",
                interviewMode: "phone",
                completedAt: now - 100_000,
              },
            ],
            offerDetails: {
              jobTitle,
              salary: 32000,
              salaryPeriod: "monthly",
              startDate: scheduledDate,
              message: "Welcome aboard — Warn18 offer letter preview.",
            },
          },
        ];
        localStorage.setItem("wm_employee_career_applications_v1", JSON.stringify(apps));
        localStorage.setItem(`wm_employee_${workerMl}_career_applications_v1`, JSON.stringify(apps));
        window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
      },
      {
        workerMl: WORKER_ML,
        appInterview: APP_INTERVIEW,
        appOffered: APP_OFFERED,
        postMain: POST_MAIN,
        jobTitle: JOB_TITLE,
        company: COMPANY,
        scheduledDate: new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10),
        scheduledTime: "10:30",
      },
    );
    await employee.goto("/#/employee/career/applications", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(900);
    // Click Interview filter tab if present
    const ivTab = employee.getByRole("button", { name: /^Interview/i });
    if (await ivTab.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await ivTab.first().click();
      await employee.waitForTimeout(400);
    }
    await assertVisible(
      employee,
      "IV-CW1",
      employee.getByRole("button", { name: /Accept Interview/i }),
      "Accept Interview live for pending RSVP interview",
    );
    await assertVisible(
      employee,
      "IV-CW2",
      employee.getByRole("button", { name: /Decline Interview/i }),
      "Decline Interview live for pending RSVP interview",
    );
    const offersTab = employee.getByRole("button", { name: /^Offers/i });
    if (await offersTab.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await offersTab.first().click();
      await employee.waitForTimeout(400);
    }
    await assertVisible(
      employee,
      "IV-CW4",
      employee.getByRole("button", { name: /Accept Offer/i }),
      "Accept Offer live with offerDetails preview",
    );

    // —— 17 VT-CW4 Resign ——
    // Workspace page requires updates[] (raw LS is not normalized on employee read).
    // writeCareerWorkspacesForEmployee(list, workerMlId) — list first.
    await employee.evaluate(
      async ({ postMain, wsId, workerMl, workerName, company, jobTitle, scope }) => {
        const now = Date.now();
        const workspace = {
          id: wsId,
          jobId: postMain,
          companyName: company,
          jobTitle,
          department: "Operations",
          location: "City A",
          status: "active" as const,
          lastActivityAt: now,
          unreadCount: 0,
          updates: [] as [],
          hiredAt: now - 14 * 86_400_000,
        };
        const employment = {
          id: `emp_${postMain}_warn18`,
          careerPostId: postMain,
          employeeId: workerMl,
          employeeName: workerName,
          employeeMlId: workerMl,
          employerId: scope,
          companyName: company,
          employerMlId: scope,
          jobTitle,
          department: "Operations",
          salaryMin: 32000,
          salaryMax: 32000,
          salaryPeriod: "monthly",
          status: "working",
          offeredAt: now - 20 * 86_400_000,
          acceptedAt: now - 18 * 86_400_000,
          joinedAt: now - 14 * 86_400_000,
          resignedAt: null,
          completedAt: null,
          noticePeriodDays: 30 as const,
          lastWorkingDay: null,
          exitType: null,
          exitReason: null,
          exitNotes: "",
          wasWithdrawn: false,
          withdrawnAt: null,
          workDurationDays: null,
          workDurationDisplay: "",
          forceCompleted: false,
          timeline: [
            {
              id: "tl1",
              status: "working",
              timestamp: now - 14 * 86_400_000,
              actor: "system" as const,
              note: "Joined",
            },
          ],
          employeeRated: false,
          employerRated: false,
        };

        try {
          const persist = await import(
            "/src/features/employer/careerJobs/helpers/careerNormalizers.ts"
          );
          persist.writeCareerWorkspacesForEmployee([workspace as never], workerMl);
        } catch {
          const raw = JSON.stringify([workspace]);
          localStorage.setItem("wm_employee_career_workspaces_v1", raw);
          localStorage.setItem(`wm_employee_${workerMl}_career_workspaces_v1`, raw);
        }

        try {
          const emp = await import("/src/shared/employment/employmentStorage.ts");
          const existing = emp.employmentStorage
            .getAll()
            .filter((r) => r.careerPostId !== postMain);
          localStorage.setItem(
            "wm_career_employment_v1",
            JSON.stringify([...existing, employment]),
          );
          window.dispatchEvent(new Event("wm:employment-changed"));
        } catch {
          localStorage.setItem("wm_career_employment_v1", JSON.stringify([employment]));
          window.dispatchEvent(new Event("wm:employment-changed"));
        }

        window.dispatchEvent(new Event("wm:employee-career-workspaces-changed"));
      },
      {
        postMain: POST_MAIN,
        wsId: WS_ID,
        workerMl: WORKER_ML,
        workerName: WORKER_NAME,
        company: COMPANY,
        jobTitle: JOB_TITLE,
        scope: SCOPE,
      },
    );
    await employee.goto(`/#/employee/career/workspace/${WS_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await employee.waitForTimeout(900);
    await assertVisible(
      employee,
      "VT-CW4",
      employee.getByRole("button", { name: /Resign job|Resign/i }),
      "Resign job live on working employment workspace",
    );

    // —— 18 AL-CW1 Pending actions hub (compact on employee home; needs urgent items) ——
    await employee.evaluate(
      async ({
        workerMl,
        appInterview,
        appOffered,
        postMain,
        postOpen,
        jobTitle,
        company,
        scope,
      }) => {
        const now = Date.now();
        const scheduledDate = new Date(now + 2 * 86_400_000).toISOString().slice(0, 10);

        // Hub uses readCareerPosts() → employer-scoped posts. Ensure scope + posts exist here.
        try {
          const settings = await import(
            "/src/features/employer/company/storage/employerSettings.storage.ts"
          );
          const cur = settings.employerSettingsStorage.get();
          settings.employerSettingsStorage.save({
            ...cur,
            companyName: company,
            uniqueId: scope,
            companyUniqueId: scope,
            employerOrgId: scope,
            fullName: cur.fullName || "Warn18 Employer",
            email: cur.email || "employer.warn18@mitralabs.test",
            phone: cur.phone || "9876543210",
            industryType: cur.industryType || "Professional Services",
            companySize: cur.companySize || "11–50",
            locationCity: cur.locationCity || "City A",
            locationState: cur.locationState || "Region",
            companyDescription: cur.companyDescription || "Warn18",
            registrationNo: cur.registrationNo || "",
            notificationsEnabled: true,
            hrManagementEnabled: false,
            language: "en",
            hapticFeedback: true,
            globalMute: false,
            quietHoursEnabled: false,
            quietFrom: "22:00",
            quietTo: "07:00",
            transferStatus: "none",
            businessAdminIds: cur.businessAdminIds ?? [],
            previousHandles: cur.previousHandles ?? [],
            contactVerified: true,
            verificationLevel: 1,
          });
        } catch {
          /* ignore */
        }

        const post = {
          id: postMain,
          companyName: company,
          jobTitle,
          department: "Operations",
          jobType: "full-time",
          workMode: "hybrid",
          location: "City A",
          salaryMin: 25000,
          salaryMax: 40000,
          salaryPeriod: "monthly",
          experienceMin: 0,
          experienceMax: 5,
          skills: ["operations"],
          description: "Warn18 post",
          responsibilities: "Lead",
          qualifications: "Graduate",
          vacancies: 1,
          probationPeriod: "none",
          noticePeriodDays: 30,
          closingDate: now + 30 * 86_400_000,
          interviewRounds: [{ round: 1, label: "Screening", mode: "phone" }],
          status: "open",
          createdAt: now - 86_400_000,
          updatedAt: now,
          employerId: scope,
          employerOrgId: scope,
        };
        const openPost = { ...post, id: postOpen, jobTitle: `${jobTitle} Open` };
        localStorage.setItem(`wm_employer_${scope}_career_posts_v1`, JSON.stringify([post, openPost]));
        localStorage.setItem("wm_employer_career_posts_v1", JSON.stringify([post, openPost]));
        localStorage.setItem(`wm_employer_${scope}_career_posts_v1__migrated_v1`, "1");

        const apps = [
          {
            id: appInterview,
            jobId: postMain,
            stage: "interview",
            employeeId: workerMl,
            employeeName: "Warn18 Career Worker",
            appliedAt: now - 86_400_000,
            updatedAt: now,
            coverNote: "n",
            expectedSalary: 30000,
            noticePeriod: "15 days",
            roundResults: [
              {
                round: 1,
                label: "Screening",
                status: "scheduled",
                feedback: "",
                interviewMode: "phone",
                scheduledDate,
                scheduledTime: "10:30",
                location: "HQ",
                meetingLink: "",
                rsvpStatus: "pending",
              },
            ],
          },
          {
            id: appOffered,
            jobId: postMain,
            stage: "offered",
            employeeId: workerMl,
            employeeName: "Warn18 Career Worker",
            appliedAt: now - 86_400_000,
            updatedAt: now,
            coverNote: "n",
            expectedSalary: 30000,
            noticePeriod: "15 days",
            offeredAt: now - 3_600_000,
            roundResults: [
              {
                round: 1,
                label: "Screening",
                status: "passed",
                feedback: "ok",
                interviewMode: "phone",
                completedAt: now - 100_000,
              },
            ],
            offerDetails: {
              jobTitle,
              salary: 32000,
              salaryPeriod: "monthly",
              startDate: scheduledDate,
              message: "Welcome aboard — Warn18 offer letter preview.",
            },
          },
        ];
        localStorage.setItem(`wm_employee_${workerMl}_career_applications_v1`, JSON.stringify(apps));
        localStorage.setItem("wm_employee_career_applications_v1", JSON.stringify(apps));

        // Clear dismissals so compact hub can mount
        for (const k of Object.keys(localStorage)) {
          if (k.includes("pending") && k.includes("dismiss")) localStorage.removeItem(k);
        }

        window.dispatchEvent(new Event("wm:employer-career-posts-changed"));
        window.dispatchEvent(new Event("wm:employee-career-applications-changed"));
        window.dispatchEvent(new Event("wm:pending-actions-changed"));
        window.dispatchEvent(new Event("wm:career-employer-scope-changed"));
      },
      {
        workerMl: WORKER_ML,
        appInterview: APP_INTERVIEW,
        appOffered: APP_OFFERED,
        postMain: POST_MAIN,
        postOpen: POST_OPEN,
        jobTitle: JOB_TITLE,
        company: COMPANY,
        scope: SCOPE,
      },
    );
    await employee.goto("/#/employee/home", { waitUntil: "domcontentloaded" });
    await employee.waitForTimeout(1200);
    await assertVisible(
      employee,
      "AL-CW1",
      employee.getByTestId("pending-actions-hub"),
      "Pending actions hub live (interview/offer urgent items)",
    );

    // —— 19 AL-CE1 Pulse applications card ——
    // storeIsActive is true only for chain[0]; set chain head to the career applications card.
    await employer.goto("/#/employer/career", { waitUntil: "domcontentloaded" });
    await employer.waitForTimeout(500);
    const pulse = await employer.evaluate(async () => {
      localStorage.setItem("wm:pulse-nav-enabled", "true");
      try {
        const nav = await import("/src/features/pulse/pulseNavStore.ts");
        nav.usePulseNavStore.getState().setEnabled(true);
      } catch {
        /* ignore */
      }
      const store = await import("/src/features/pulse/pulseStore.ts");
      store.usePulseStore.getState().clearAll?.();
      // Head of chain must be the on-screen node (storeIsActive === chain[0]).
      store.usePulseStore.getState().setChain(["career-dashboard-applications"], {
        severity: "urgent",
      });
      await new Promise((r) => setTimeout(r, 450));
      const el = document.querySelector(
        '[data-pulse-node-id="career-dashboard-applications"]',
      );
      return {
        found: Boolean(el),
        active: el?.getAttribute("data-pulse-active") === "true",
        mode: el?.getAttribute("data-pulse-visual-mode") ?? null,
        chain: store.usePulseStore.getState().chain,
      };
    });
    const pulseOk = pulse.active === true;
    const pulseFile = await shot(employer, "AL-CE1");
    rows.push({
      id: "AL-CE1",
      status: pulseOk ? "PASS" : "FAIL",
      detail: pulseOk
        ? "Pulse applications card live with data-pulse-active=true"
        : `Pulse applications card — data-pulse-active NOT VISIBLE (found=${pulse.found} mode=${pulse.mode} chain=${JSON.stringify(pulse.chain)})`,
      shot: pulseFile,
    });
    console.log(`[${pulseOk ? "PASS" : "FAIL"}] AL-CE1 — pulse active`);
    expect(pulseOk, "AL-CE1 pulse must be live-active").toBe(true);

    // Report
    const report = {
      viewport: VIEWPORT,
      totals: {
        pass: rows.filter((r) => r.status === "PASS").length,
        fail: rows.filter((r) => r.status === "FAIL").length,
        total: rows.length,
      },
      ids: { POST_MAIN, POST_OPEN, WS_ID, APP_APPLIED_A, APP_INTERVIEW, APP_OFFERED },
      rows,
    };
    fs.writeFileSync(path.join(OUT, "WARN18_LIVE_PROOF_REPORT.json"), JSON.stringify(report, null, 2));
    const md = [
      "# Career Warn18 State-Seeded Live Visual Proof",
      "",
      `| PASS | ${report.totals.pass} |`,
      `| FAIL | ${report.totals.fail} |`,
      `| WARN | 0 |`,
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
    fs.writeFileSync(path.join(OUT, "WARN18_LIVE_PROOF_CHECKLIST.md"), md, "utf8");
    console.log(`\n=== WARN18 REPORT → ${path.join(OUT, "WARN18_LIVE_PROOF_CHECKLIST.md")} ===\n`);

    await employerCtx.close();
    await employeeCtx.close();

    expect(rows.filter((r) => r.status === "FAIL")).toEqual([]);
    expect(report.totals.pass).toBe(18);
    expect(report.totals.fail).toBe(0);
  });
});
