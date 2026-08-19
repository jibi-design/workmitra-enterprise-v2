/**
 * Headed dual-role UI/UX simulation (~5 min window) mixed with background API load.
 * Shift, Career, and Planner stay on separate routes (no shared Zustand mix).
 */
import { expect, test } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { signInAs, skipSplashAndSetRole, wipeBrowserState } from "./helpers/realUserCleanSlate";
import { seedCareerCircuitPost } from "./helpers/career-circuit.helpers";
import {
  attachHybridProbes,
  assertNoHorizontalOverflow,
  probeHomeTicker,
  dismissHomeTickerIfPresent,
  expectShellAlive,
  inspectRoute,
  probePlannerPlansApi,
  ensureCareerSaveJobVisible,
  type HttpProbe,
} from "./helpers/hybrid-5min.helpers";

const WINDOW_MS = 300_000;

test.describe.configure({ mode: "serial" });

test("Hybrid 5-min UI/UX — dual headed Shift + Career + Planner", async ({ browser }) => {
  test.setTimeout(330_000);
  const started = Date.now();
  const probe: HttpProbe = {
    status429: 0,
    status5xx: 0,
    status5xxUrls: [],
    pageErrors: [],
    overflowHits: [],
  };
  const findings: Array<{ id: string; status: "PASS" | "FAIL" | "WARN"; detail: string }> = [];

  const employerContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const employeeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const employer = await employerContext.newPage();
  const employee = await employeeContext.newPage();
  attachHybridProbes(employer, "employer", probe);
  attachHybridProbes(employee, "employee", probe);

  await wipeBrowserState(employer);
  await wipeBrowserState(employee);
  await signInAs(employer, "employer@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(employer, "employer");
  await signInAs(employee, "employee@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(employee, "employee");
  await seedCareerCircuitPost(employer);
  await seedCareerCircuitPost(employee);

  await test.step("Banners — home tickers", async () => {
    await employer.goto("/#/employer", { waitUntil: "domcontentloaded" });
    await employee.goto("/#/employee", { waitUntil: "domcontentloaded" });
    const er = await dismissHomeTickerIfPresent(employer, "employer-home-inbox-ticker");
    const eeHome = await probeHomeTicker(employee, "employee-home-inbox-ticker");
    findings.push({ id: "banner-employer", status: er === "absent" ? "WARN" : "PASS", detail: er });
    findings.push({
      id: "banner-employee-home",
      status: eeHome === "absent" ? "FAIL" : "PASS",
      detail: eeHome,
    });
    await employee.goto("/#/employee/dashboard", { waitUntil: "domcontentloaded" });
    const eeDash = await probeHomeTicker(employee, "employee-home-inbox-ticker");
    findings.push({
      id: "banner-employee-dashboard",
      status: eeDash === "absent" ? "FAIL" : "PASS",
      detail: eeDash,
    });
    await assertNoHorizontalOverflow(employer, "/#/employer", probe);
    await assertNoHorizontalOverflow(employee, "/#/employee", probe);
  });

  await test.step("Shift surfaces + dashboard counters", async () => {
    const shiftEr = await inspectRoute(employer, "/#/employer/shift", "shift", "employer-shift");
    const shiftEe = await inspectRoute(employee, "/#/employee/shift/search", "shift", "employee-shift-search");
    findings.push({
      id: "shift-inspect",
      status: shiftEr.critical + shiftEe.critical > 0 ? "FAIL" : "PASS",
      detail: `er crit=${shiftEr.critical} high=${shiftEr.high}; ee crit=${shiftEe.critical} high=${shiftEe.high}; ${shiftEr.messages.slice(0, 5).join(" | ")}`,
    });
    await employer.goto("/#/employer/dashboard", { waitUntil: "domcontentloaded" });
    await employee.goto("/#/employee/dashboard", { waitUntil: "domcontentloaded" });
    await expectShellAlive(employer);
    await expectShellAlive(employee);
    findings.push({ id: "dashboards", status: "PASS", detail: "Employer + employee dashboards remounted" });
  });

  await test.step("Career search / save", async () => {
    const career = await inspectRoute(
      employee,
      "/#/employee/career/search",
      "career",
      "employee-career-search",
    );
    findings.push({
      id: "career-inspect",
      status: career.critical > 0 ? "FAIL" : "PASS",
      detail: `crit=${career.critical} high=${career.high}`,
    });
    const saveReady = await ensureCareerSaveJobVisible(employee);
    const save = employee.getByTestId("career-save-job").first();
    if (saveReady && (await save.isVisible().catch(() => false))) {
      await save.click();
      findings.push({ id: "career-save", status: "PASS", detail: "Save Job control visible and clicked" });
    } else {
      findings.push({ id: "career-save", status: "FAIL", detail: "career-save-job not visible on search feed" });
    }
    await employer.goto("/#/employer/career", { waitUntil: "domcontentloaded" });
    await expectShellAlive(employer);
  });

  await test.step("Planner roster + plans dual-write GET", async () => {
    const planner = await inspectRoute(
      employer,
      "/#/employer/planner/home",
      "planner",
      "employer-planner-home",
    );
    findings.push({
      id: "planner-inspect",
      status: planner.critical > 0 ? "FAIL" : "PASS",
      detail: `crit=${planner.critical} high=${planner.high}`,
    });
    await employer.goto("/#/employer/planner/plans", { waitUntil: "domcontentloaded" });
    const plans = await probePlannerPlansApi(employer);
    findings.push({
      id: "planner-plans-api",
      status: plans.status === 200 || plans.status === 401 || plans.status === 403 ? "PASS" : "FAIL",
      detail: `GET /v1/jobmitra/employer/planner/plans → ${plans.status}`,
    });
    await employer.goto("/#/employer/planner/roster", { waitUntil: "domcontentloaded" });
    await expectShellAlive(employer);
  });

  await test.step("QR + Vault + profile", async () => {
    await employer.goto("/#/employer/labs/qr", { waitUntil: "domcontentloaded" });
    const qrTitle = employer.getByText(/branded QR|Create branded QR/i).first();
    findings.push({
      id: "qr-studio",
      status: (await qrTitle.isVisible().catch(() => false)) ? "PASS" : "WARN",
      detail: "Employer Labs QR studio",
    });
    await employee.goto("/#/employee/vault", { waitUntil: "domcontentloaded" });
    const vault = employee.getByTestId("employee-vault-home");
    findings.push({
      id: "vault-home",
      status: (await vault.isVisible().catch(() => false)) ? "PASS" : "WARN",
      detail: "Employee vault home",
    });
    await employee.goto("/#/employee/settings", { waitUntil: "domcontentloaded" });
    await expectShellAlive(employee);
    await assertNoHorizontalOverflow(employee, "/#/employee/settings", probe);
  });

  const remain = WINDOW_MS - (Date.now() - started);
  if (remain > 2_000) {
    await Promise.all([employer.waitForTimeout(remain), employee.waitForTimeout(remain)]);
  }

  const failed = findings.filter((f) => f.status === "FAIL");
  const report = {
    windowMs: Date.now() - started,
    probe,
    findings,
    failCount: failed.length,
  };
  mkdirSync("test-results/hybrid-5min", { recursive: true });
  writeFileSync(
    path.resolve("test-results/hybrid-5min/ui-report.json"),
    JSON.stringify(report, null, 2),
  );

  expect(probe.pageErrors, `pageerrors: ${probe.pageErrors.join(" | ")}`).toHaveLength(0);
  expect(failed, failed.map((f) => `${f.id}:${f.detail}`).join(" | ")).toHaveLength(0);
});
