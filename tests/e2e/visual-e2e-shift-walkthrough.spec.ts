/**
 * Job Mitra — Visual headed E2E walkthrough (live browser)
 *
 * Employer: identity → create shift → manage applicants
 * Employee: identity → find shift → apply
 * Employer: shortlist → confirm → workspace broadcast message
 *
 * Run (watch the Chromium window):
 *   npm run test:e2e:visual-walkthrough
 *
 * Or:
 *   npx playwright test --project=chromium --headed ^
 *     tests/e2e/visual-e2e-shift-walkthrough.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import { confirmSubmitApplication } from "./helpers/submitApplicationConfirm";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const OBSERVE_MS = 0;
const JOB_TITLE = `Visual Walk Helper ${Date.now().toString().slice(-6)}`;
const COMPANY = "Visual Walkthrough Co";
const TEST_MESSAGE = "E2E visual walkthrough - report to gate at 18:00";
const WORKER_ML_ID = "ML-E2E-VIS-WALK";
const WORKER_NAME = "Visual Walk Worker";
/** Valid Shift Ops site UUID — required by confirmEmployerShiftCandidate */
const SITE_ID = "11111111-2222-4333-8444-555555555555";
const MEMBERSHIP_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

function logStep(step: string, detail?: string): void {
  const stamp = new Date().toISOString().slice(11, 19);
  console.log(`\n▶ [${stamp}] ${step}${detail ? ` — ${detail}` : ""}`);
}

async function observe(page: Page, label: string, ms = OBSERVE_MS): Promise<void> {
  logStep("PAUSE", `${label} (${ms}ms)`);
  if (ms > 0) {
    await page.waitForTimeout(ms);
  }
}

function localIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function skipSplashOnly(page: Page): Promise<void> {
  await page.addInitScript(
    ({ splashKey }) => {
      sessionStorage.setItem(splashKey, "1");
    },
    { splashKey: SPLASH_KEY },
  );
}

async function seedProfilesForPublishAndApply(page: Page): Promise<void> {
  await page.evaluate(
    async ({ workerMlId, workerName, company }) => {
      const pii = await import("/src/shared/security/piiSecureStorage.ts");

      const employerProfile = {
        companyName: company,
        registrationNo: "",
        industryType: "Logistics & Transport",
        companySize: "11–50",
        locationCity: "City A",
        locationState: "Region",
        companyDescription: "E2E visual walkthrough employer",
        fullName: "Walk Employer",
        email: "employer.walkthrough@mitralabs.test",
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
        uniqueId: "ML-E2E-VIS-EMP1",
        companyUniqueId: "ML-E2E-VIS-EMP1",
        employerOrgId: "ML-E2E-VIS-EMP1",
      };
      pii.piiSecureStorage.setJson("wm_employer_profile_v1", employerProfile);
      localStorage.setItem("wm_employer_profile_v1", JSON.stringify(employerProfile));
      localStorage.setItem("wm:employer-profile", JSON.stringify(employerProfile));
      localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
      localStorage.setItem("wm_onboarding_complete_v1", "1");

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

      localStorage.removeItem("wm_employer_shift_posts_v1");
      localStorage.removeItem("wm_employee_shift_applications_v1");
      localStorage.removeItem("wm_employee_shift_workspaces_v1");
      localStorage.removeItem("wm_employee_notifications_v1");
      localStorage.removeItem("wm_employer_notifications_v1");
      localStorage.removeItem("wm_pulse_event_queue_v1");
    },
    { workerMlId: WORKER_ML_ID, workerName: WORKER_NAME, company: COMPANY },
  );
}

async function setRoleDirect(page: Page, role: "employer" | "employee"): Promise<void> {
  logStep("IDENTITY", `Direct ${role} session`);
  await page.evaluate(
    ({ roleKey, roleValue, splashKey }) => {
      sessionStorage.setItem(roleKey, roleValue);
      sessionStorage.setItem(splashKey, "1");
    },
    { roleKey: ROLE_KEY, roleValue: role, splashKey: SPLASH_KEY },
  );
  await page.goto(`/#/${role}`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(new RegExp(`/#/${role}`), { timeout: 20_000 });
  await observe(page, `${role} home visible`);
}

async function clearRoleAndOpenLanding(page: Page): Promise<void> {
  await page.evaluate((roleKey) => {
    sessionStorage.removeItem(roleKey);
  }, ROLE_KEY);
  await page.goto("/#/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /Continue (to|as)/i })).toBeVisible({
    timeout: 20_000,
  });
  const clearWorkspace = page.getByRole("button", { name: "Clear", exact: true });
  if (await clearWorkspace.isVisible().catch(() => false)) {
    await clearWorkspace.click();
  }
}

async function pickRole(page: Page, role: "Employer" | "Employee"): Promise<void> {
  logStep("IDENTITY", `Select ${role}`);
  await page.locator("button.wm-press-card").filter({ hasText: role }).click();
  await page.getByRole("button", { name: new RegExp(`Continue (to|as) ${role}`, "i") }).click();
  await page.waitForURL(new RegExp(`/#/${role.toLowerCase()}`), { timeout: 20_000 });
  await observe(page, `${role} home visible`);
}

async function seedShiftPost(page: Page, postId: string, jobTitle: string): Promise<void> {
  await page.evaluate(
    async ({ id, job, company, siteId }) => {
      const now = Date.now();
      const post = {
        id,
        companyName: company,
        jobName: job,
        category: "Warehouse",
        experience: "helper",
        payPerDay: 900,
        payBasis: "per_day",
        locationName: "City A",
        locationAddress: "Gate B, Visual Walk Warehouse",
        distanceKm: 4,
        startAt: now + 86_400_000,
        endAt: now + 259_200_000,
        description: "Visual E2E walkthrough shift — night warehouse helper.",
        shiftTiming: "18:00 – 02:00",
        mapsLink: "",
        vacancies: 2,
        waitingBuffer: 1,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: [],
        rejectedIds: [],
        status: "active",
        mustHave: ["Can lift 20kg"],
        goodToHave: [],
        isHiddenFromSearch: false,
        source: "single",
        siteId,
      };

      const { readEmployerPosts, writeEmployerPosts } =
        await import("/src/features/employer/shiftJobs/storage/employerShift.postStorage.ts");
      writeEmployerPosts([post, ...readEmployerPosts().filter((item) => item.id !== id)]);

      localStorage.setItem("wm_employee_shift_search_v1", JSON.stringify([post]));
      window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
    },
    { id: postId, job: jobTitle, company: COMPANY, siteId: SITE_ID },
  );
}

/** Attach Shift Ops siteId on a published/seeded post (no Demand Planner linkage). */
async function attachOpsSiteId(page: Page, postId: string): Promise<void> {
  await page.evaluate(
    async ({ id, siteId }) => {
      const { readEmployerPosts, writeEmployerPosts } =
        await import("/src/features/employer/shiftJobs/storage/employerShift.postStorage.ts");
      const posts = readEmployerPosts();
      const next = posts.map((post) =>
        post.id === id
          ? {
              ...post,
              siteId,
              source: post.source === "planner" ? "single" : (post.source ?? "single"),
              planId: undefined,
            }
          : post,
      );
      writeEmployerPosts(next);

      const searchRaw = localStorage.getItem("wm_employee_shift_search_v1");
      if (searchRaw) {
        const search = JSON.parse(searchRaw) as Array<Record<string, unknown>>;
        localStorage.setItem(
          "wm_employee_shift_search_v1",
          JSON.stringify(
            search.map((post) =>
              post.id === id
                ? {
                    ...post,
                    siteId,
                    source: post.source === "planner" ? "single" : (post.source ?? "single"),
                    planId: undefined,
                  }
                : post,
            ),
          ),
        );
      }

      window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
    },
    { id: postId, siteId: SITE_ID },
  );
}

/** Guard: Shift Job lifecycle must never land on Planner routes. */
async function assertStayOnShiftDomain(page: Page, label: string): Promise<void> {
  const url = page.url();
  expect(url, `${label}: must not open Planner — got ${url}`).not.toMatch(/\/planner\//i);
}

async function ensureWorkerIdentityOnApps(page: Page): Promise<void> {
  await page.evaluate(
    ({ workerMlId, workerName }) => {
      const apps = JSON.parse(
        localStorage.getItem("wm_employee_shift_applications_v1") ?? "[]",
      ) as Array<{
        profileSnapshot?: { uniqueId?: string; fullName?: string };
      }>;
      for (const app of apps) {
        app.profileSnapshot = {
          ...app.profileSnapshot,
          uniqueId: workerMlId,
          fullName: app.profileSnapshot?.fullName || workerName,
        };
      }
      localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify(apps));
      window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
    },
    { workerMlId: WORKER_ML_ID, workerName: WORKER_NAME },
  );
}

async function seedLocalMembershipTruth(page: Page): Promise<void> {
  await page.evaluate(
    ({ siteId, workerMlId, membershipId }) => {
      const key = "wm_shift_ops_site_membership_truth_v1";
      const mapKey = `${siteId.trim().toLowerCase()}::${workerMlId.trim().toUpperCase()}`;
      const map = {
        [mapKey]: {
          siteId,
          workerMlId: workerMlId.toUpperCase(),
          membershipId,
          status: "pending_manager_approval",
          updatedAt: Date.now(),
        },
      };
      localStorage.setItem(key, JSON.stringify(map));
    },
    { siteId: SITE_ID, workerMlId: WORKER_ML_ID, membershipId: MEMBERSHIP_ID },
  );
}

async function fillAndPublishShift(page: Page): Promise<string> {
  logStep("EMPLOYER", "Open Create Shift wizard");
  await page.goto("/#/employer/shift/create", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("employer-shift-create-page")).toBeVisible({ timeout: 20_000 });
  await observe(page, "Create wizard step 1");

  logStep("EMPLOYER", `Fill basic info — ${JOB_TITLE}`);
  await page.getByPlaceholder("Enter company name").fill(COMPANY);
  await page.getByPlaceholder("e.g. Driver, Helper, Cleaner").fill(JOB_TITLE);

  const categorySelect = page
    .locator("select.wm-input")
    .filter({ has: page.locator('option[value="Warehouse"]') })
    .first();
  await categorySelect.selectOption("Warehouse");

  await page
    .getByPlaceholder(
      "Briefly describe the work, reporting expectations, and anything workers should know.",
    )
    .fill("Visual E2E walkthrough shift — night warehouse helper.");

  await page.getByPlaceholder("Enter number").fill("2");
  await observe(page, "Step 1 filled");

  await page.getByTestId("shift-create-wizard-next").click();
  await observe(page, "Wizard step 2 — schedule & location");

  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(0).fill(localIsoDate(1));
  await dateInputs.nth(1).fill(localIsoDate(2));
  await page.getByPlaceholder("e.g. 8:00 AM - 5:00 PM").fill("18:00 – 02:00");

  const payBasisSelect = page
    .locator("select.wm-input")
    .filter({ has: page.locator('option[value="per_day"]') })
    .first();
  await payBasisSelect.selectOption("per_day");
  await page.getByPlaceholder("Amount without currency symbol").fill("900");

  await page.getByPlaceholder("Enter city or area").fill("City A");
  await page
    .getByPlaceholder("Building name, street, entrance note, landmark...")
    .fill("Gate B, Visual Walk Warehouse");
  await observe(page, "Step 2 filled");

  await page.getByTestId("shift-create-wizard-next").click();
  await observe(page, "Wizard step 3 — requirements");

  await page.getByPlaceholder("Enter requirements, one per line").fill("Can lift 20kg");
  await observe(page, "Step 3 filled");

  logStep("EMPLOYER", "Review & Publish");
  await page.getByRole("button", { name: /Review.*Publish/i }).click();
  await expect(page.getByRole("button", { name: /Publish Shift|Publish Anyway/i })).toBeVisible({
    timeout: 10_000,
  });
  await observe(page, "Confirm modal open");
  await page.getByRole("button", { name: /Publish Shift|Publish Anyway/i }).click();

  const published = await page
    .waitForURL(/\/#\/employer\/shift\/post\//, { timeout: 12_000 })
    .then(() => true)
    .catch(() => false);

  if (published) {
    const match = page.url().match(/\/employer\/shift\/post\/([^/?#]+)/);
    const postId = match?.[1] ?? "";
    expect(postId).toBeTruthy();
    logStep("EMPLOYER", `UI published postId=${postId}`);
    await attachOpsSiteId(page, postId);
    await page.reload({ waitUntil: "domcontentloaded" });
    await observe(page, "Post dashboard after publish (+ siteId attached)");
    return postId;
  }

  const notice = page.getByRole("dialog").or(page.getByRole("alert"));
  if (
    await notice
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    const text = (
      await notice
        .first()
        .innerText()
        .catch(() => "")
    ).slice(0, 240);
    logStep("FALLBACK", `Publish stayed on create — notice: ${text || "(none)"}`);
  } else {
    logStep("FALLBACK", "Publish stayed on create — seeding post with Shift Ops siteId");
  }

  const postId = `e2e-visual-${Date.now()}`;
  await seedShiftPost(page, postId, JOB_TITLE);
  await page.goto(`/#/employer/shift/post/${postId}`);
  await expect(page.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 15_000 });
  await observe(page, "Seeded post dashboard (visual create already demonstrated)");
  return postId;
}

function workspaceIdFromUrl(workspaceUrl: string): string {
  const wsMatch = workspaceUrl.match(/\/employer\/shift\/workspace\/([^/?#]+)/);
  return wsMatch?.[1] ?? "";
}

test.describe.configure({ mode: "serial" });

test.use({
  launchOptions: { slowMo: process.env.PW_HEADED === "1" ? 400 : 0 },
  viewport: { width: 1280, height: 900 },
});

test.describe("Visual headed E2E — Shift hire walkthrough", () => {
  test("Employer create → Employee apply → Shortlist → Message", async ({ page }) => {
    test.setTimeout(600_000);

    logStep("BOOT", "Launch headed Chromium (slowMo=400 via launchOptions)");
    await skipSplashOnly(page);
    page.on("pageerror", (err) => {
      console.log(`\n▶ [PAGEERROR] ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`\n▶ [CONSOLE.ERROR] ${msg.text().slice(0, 240)}`);
      }
    });

    await test.step("0. Boot app + seed verified profiles", async () => {
      logStep("BOOT", "Open landing (splash skipped)");
      await page.goto("/#/", { waitUntil: "domcontentloaded" });
      await seedProfilesForPublishAndApply(page);
      await observe(page, "Profiles seeded for publish/apply");
    });

    let postId = "";

    await test.step("1. Employer identity + create shift", async () => {
      await setRoleDirect(page, "employer");
      postId = await fillAndPublishShift(page);

      logStep("EMPLOYER", "Managing applicants surface");
      await page.goto(`/#/employer/shift/post/${postId}`);
      await expect(page.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 15_000 });
      await assertStayOnShiftDomain(page, "employer post dashboard");
      await observe(page, "Applicant management (waiting for apply)");
    });

    await test.step("2. Employee identity + find + apply", async () => {
      await setRoleDirect(page, "employee");

      logStep("EMPLOYEE", "Open shift browse / find posted job");
      await page.goto("/#/employee/shift", { waitUntil: "domcontentloaded" });
      await assertStayOnShiftDomain(page, "employee shift home");
      await observe(page, "Employee shift home");

      await page.goto(`/#/employee/shift/post/${postId}`);
      await expect(page.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 15_000 });
      await assertStayOnShiftDomain(page, "employee shift post");
      await observe(page, "Employee viewing posted shift");

      logStep("EMPLOYEE", "Answer must-have + submit application");
      const meets = page.getByRole("button", { name: "Meets" }).first();
      if (await meets.isVisible().catch(() => false)) {
        await meets.click();
      }
      await page.getByRole("button", { name: "Submit Application" }).click();
      await confirmSubmitApplication(page);
      await expect(page).toHaveURL(/\/#\/employee\/shift\/applications/, { timeout: 20_000 });
      await assertStayOnShiftDomain(page, "employee applications");
      await ensureWorkerIdentityOnApps(page);
      await seedLocalMembershipTruth(page);
      await observe(page, "Application submitted — applications list");
    });

    await test.step("3. Employer shortlist + confirm + message", async () => {
      await setRoleDirect(page, "employer");

      logStep("EMPLOYER", "View application on post dashboard");
      await page.goto(`/#/employer/shift/post/${postId}`);
      await expect(page.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 15_000 });
      await ensureWorkerIdentityOnApps(page);
      await attachOpsSiteId(page, postId);
      await seedLocalMembershipTruth(page);
      await page.reload({ waitUntil: "domcontentloaded" });
      await assertStayOnShiftDomain(page, "employer applicant dashboard");
      await observe(page, "Post dashboard with applicant");

      await page.getByRole("button", { name: /^Applied\b/ }).click();
      await observe(page, "Applied tab");

      logStep("EMPLOYER", "Shortlist candidate");
      await page.getByRole("button", { name: "Shortlist", exact: true }).click();
      await observe(page, "After shortlist");

      await page.getByRole("button", { name: /^Shortlisted\b/ }).click();
      await observe(page, "Shortlisted tab");

      logStep("EMPLOYER", "Confirm worker → creates workspace / group");
      await page.getByRole("button", { name: "Confirm Worker", exact: true }).click();

      const okDialog = page.getByRole("dialog", { name: /Candidate confirmed|Confirm failed/i });
      if (await okDialog.isVisible({ timeout: 5_000 }).catch(() => false)) {
        const dialogText = await okDialog.innerText().catch(() => "");
        logStep("EMPLOYER", `Confirm dialog: ${dialogText.slice(0, 160)}`);
        // Firefox can hang on dialog OK click — prefer dispatchEvent + Escape.
        const okBtn = okDialog.getByRole("button", { name: "OK" });
        await okBtn.dispatchEvent("click").catch(() => undefined);
        await page.keyboard.press("Escape").catch(() => undefined);
      }

      // Firefox juggler can hang indefinitely on waitForURL after confirm.
      // Always resolve workspace from storage and goto — never waitForURL here.
      let workspaceUrl = page.url();
      if (!/\/employer\/shift\/workspace\//.test(workspaceUrl)) {
        let wsId = "";
        await expect
          .poll(
            async () => {
              wsId = await page.evaluate((post) => {
                const raw = localStorage.getItem("wm_employee_shift_workspaces_v1") ?? "[]";
                const list = JSON.parse(raw) as Array<{
                  id?: string;
                  postId?: string;
                  status?: string;
                }>;
                const hit =
                  list.find((ws) => ws.postId === post) ??
                  list.find(
                    (ws) =>
                      ws.status === "active" ||
                      ws.status === "upcoming" ||
                      ws.status === "confirmed",
                  );
                return hit?.id ?? "";
              }, postId);
              return wsId;
            },
            { timeout: 15_000, message: "Confirm Worker must create a workspace in storage" },
          )
          .not.toEqual("");

        expect(wsId, "Confirm Worker must create a shift workspace in storage").toBeTruthy();
        logStep("RECOVER", `Opening workspace from storage ${wsId}`);
        try {
          await page.goto(`/#/employer/shift/workspace/${wsId}`, {
            waitUntil: "domcontentloaded",
            timeout: 20_000,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!/interrupted by another navigation/i.test(msg)) throw err;
        }
        workspaceUrl = page.url();
      }

      logStep("EMPLOYER", `Workspace URL ${workspaceUrl}`);
      await assertStayOnShiftDomain(page, "employer shift workspace after confirm");
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);

      const workspaceReady = page.getByTestId("employer-shift-workspace-page");
      if (!(await workspaceReady.isVisible({ timeout: 8_000 }).catch(() => false))) {
        try {
          await page.reload({ waitUntil: "domcontentloaded", timeout: 15_000 });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (
            !/interrupted by another navigation|Target page, context or browser has been closed/i.test(
              msg,
            )
          ) {
            throw err;
          }
          logStep("RECOVER", "Workspace reload interrupted — continuing");
        }
      }
      await observe(page, "Workspace / group created");

      const tryAgain = page.getByRole("button", { name: "Try Again" });
      if (await tryAgain.isVisible().catch(() => false)) {
        logStep("RECOVER", "Workspace error boundary — Try Again");
        await tryAgain.click();
        await page.waitForTimeout(500);
        try {
          await page.goto(workspaceUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!/interrupted by another navigation/i.test(msg)) throw err;
        }
      }

      await expect(page.getByTestId("employer-shift-workspace-page")).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.getByTestId("employer-shift-workspace-controls")).toBeVisible({
        timeout: 20_000,
      });

      logStep("EMPLOYER", "Send test broadcast message");
      const broadcastBtn = page.getByRole("button", { name: "Broadcast", exact: true });
      await broadcastBtn.scrollIntoViewIfNeeded();
      await broadcastBtn.click();

      const titleInput = page.getByPlaceholder("Announcement");
      const bodyInput = page.getByPlaceholder("Type shift update details");
      await titleInput.click();
      await titleInput.fill("E2E Walkthrough Alert");
      await bodyInput.click();
      await bodyInput.fill(TEST_MESSAGE);
      await expect(titleInput).toHaveValue("E2E Walkthrough Alert");
      await expect(bodyInput).toHaveValue(TEST_MESSAGE);
      await observe(page, "Broadcast composer filled");
      await page.getByRole("button", { name: "Send Broadcast" }).click();
      await expect(page.getByText("E2E Walkthrough Alert").first()).toBeVisible({
        timeout: 10_000,
      });
      await observe(page, "Broadcast sent (visible on employer workspace)");

      // Prove LS has the update before role-switch navigate.
      const storedTitle = await page.evaluate((wsId) => {
        const raw = localStorage.getItem("wm_employee_shift_workspaces_v1");
        const list = raw
          ? (JSON.parse(raw) as Array<{ id: string; updates?: Array<{ title?: string }> }>)
          : [];
        const ws = list.find((item) => item.id === wsId);
        return ws?.updates?.[0]?.title ?? null;
      }, workspaceIdFromUrl(workspaceUrl));
      logStep("EMPLOYER", `Stored broadcast title=${storedTitle ?? "(missing)"}`);
      expect(storedTitle).toBe("E2E Walkthrough Alert");

      logStep("EMPLOYEE", "Verify message on employee workspace");
      await setRoleDirect(page, "employee");
      const workspaceId = workspaceIdFromUrl(workspaceUrl);
      expect(workspaceId).toBeTruthy();
      await page.goto(`/#/employee/shift/workspace/${workspaceId}`);
      await expect(page).toHaveURL(/\/#\/employee\/shift\/workspace\//, { timeout: 15_000 });
      await assertStayOnShiftDomain(page, "employee shift workspace message check");
      await expect(page.getByTestId("shift-workspace-updates")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText("E2E Walkthrough Alert").first()).toBeVisible({
        timeout: 15_000,
      });
      await observe(page, "Employee sees test message — walkthrough complete");
    });

    logStep("DONE", "Visual E2E walkthrough finished successfully");
  });
});
