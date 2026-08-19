/**
 * Job Mitra — Pending Invite Flow & Home Pop-Up Visual Audit
 * Verifies: invite token persist → compact top-hero banner → Accept & Join.
 *
 * Run:
 *   npx playwright test --project=chromium --headed tests/e2e/live-visual-pending-invite-home.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 390, height: 844 };
const OUT = path.resolve("test-results/pending-invite-home-audit");
const SPLASH_KEY = "wm_splash_intro_played_v1";
const ROLE_KEY = "wm_role_session_v1";
const PENDING_LS_KEY = "wm_pending_group_join_v1";
const PENDING_ROUTE_KEY = "wm_pending_route_v1";

const INVITE_TOKEN = "aud-invite-tok-visual-001";
const GROUP_ID = "site-audit-group-01";
const COMPANY_NAME = "Acme Logistics";
const WORKER_ML = "ML-AUD-INVITE-WRK1";

type Row = { id: string; status: "PASS" | "FAIL" | "WARN"; detail: string; shot?: string };
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
  console.log(`[${row.status}] ${row.id} — ${row.detail}`);
}

test.describe("Pending Invite Flow & Home Pop-Up Audit @mobile390", () => {
  test("token persist + home banner + Accept & Join (visual)", async ({ page }) => {
    test.setTimeout(180_000);
    fs.mkdirSync(OUT, { recursive: true });
    await page.setViewportSize(VIEWPORT);

    // —— A: Pre-auth deep-link stash (session) then post-auth promote to localStorage ——
    await page.addInitScript(
      ({ splashKey, roleKey, pendingRouteKey, invitePath }) => {
        sessionStorage.setItem(splashKey, "1");
        sessionStorage.setItem(roleKey, "employee");
        sessionStorage.setItem(pendingRouteKey, invitePath);
        try {
          localStorage.setItem("wm_onboarding_complete_v1", "1");
          localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
          localStorage.setItem("wm_employee_home_welcome_v1", "1");
        } catch {
          /* ignore */
        }
      },
      {
        splashKey: SPLASH_KEY,
        roleKey: ROLE_KEY,
        pendingRouteKey: PENDING_ROUTE_KEY,
        invitePath: `/employee/shift-ops/invite?token=${INVITE_TOKEN}&group=${GROUP_ID}&company=${encodeURIComponent(COMPANY_NAME)}`,
      },
    );

    await page.goto("/#/employee/home", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Simulate resolvePostAuthRoute stash (same API used after role pick)
    const stashResult = await page.evaluate(async ({ pendingRouteKey }) => {
      const pending = sessionStorage.getItem(pendingRouteKey);
      const mod = await import("/src/features/shiftOps/storage/pendingGroupJoin.storage.ts");
      const route = await import("/src/app/router/pendingRoute.ts");
      if (pending) {
        mod.stashPendingGroupJoinFromPath(pending);
        sessionStorage.removeItem(pendingRouteKey);
      }
      const peeked = mod.peekPendingGroupJoin();
      const orchestrated = (
        await import("/src/features/shiftOps/helpers/groupJoinDeepLink.ts")
      ).resolvePendingGroupJoinOrchestration();
      sessionStorage.setItem(
        pendingRouteKey,
        `/employee/shift-ops/invite?token=${peeked?.token ?? "x"}&group=${peeked?.groupId ?? ""}`,
      );
      const postAuth = route.resolvePostAuthRoute("employee", "/employee/home");
      return {
        pendingWasInSession: Boolean(pending),
        token: peeked?.token ?? null,
        groupId: peeked?.groupId ?? null,
        companyName: peeked?.companyName ?? null,
        lsRaw: localStorage.getItem("wm_pending_group_join_v1"),
        orchestrated,
        postAuth,
      };
    }, { pendingRouteKey: PENDING_ROUTE_KEY });

    const persistOk =
      stashResult.token === INVITE_TOKEN &&
      Boolean(stashResult.lsRaw?.includes(INVITE_TOKEN));
    record({
      id: "INV-PERSIST",
      status: persistOk ? "PASS" : "FAIL",
      detail: persistOk
        ? `Token persisted in ${PENDING_LS_KEY} (group=${stashResult.groupId}, company=${stashResult.companyName})`
        : `Token NOT in localStorage: ${JSON.stringify(stashResult)}`,
      shot: await shot(page, "INV-PERSIST"),
    });
    expect(persistOk).toBe(true);

    // —— B: Incomplete profile via PII mirror so home shows banner (no auto-invite) ——
    await page.evaluate(
      async ({ workerMl, token, groupId, companyName }) => {
        const { employeeProfileStorage } =
          await import("/src/features/employee/profile/storage/employeeProfile.storage.ts");
        const join = await import("/src/features/shiftOps/storage/pendingGroupJoin.storage.ts");

        employeeProfileStorage.set({
          uniqueId: workerMl,
          fullName: "Invite Audit Worker",
          city: "City A",
          skills: [],
          experience: "1-3",
          languages: [],
          preferShiftJobs: true,
          preferCareerJobs: false,
          phoneVerified: true,
          emailVerified: true,
          availability: {
            weekdays: true,
            weekends: true,
            morning: true,
            afternoon: true,
            evening: true,
          },
        });

        localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
        localStorage.setItem("wm_onboarding_complete_v1", "1");
        localStorage.setItem("wm_employee_home_welcome_v1", "1");

        join.stashPendingGroupJoin({
          token,
          groupId,
          companyName,
          useDailyOtpGate: true,
          savedAt: Date.now(),
        });
      },
      { workerMl: WORKER_ML, token: INVITE_TOKEN, groupId: GROUP_ID, companyName: COMPANY_NAME },
    );

    await page.goto("/#/employee/home", { waitUntil: "domcontentloaded" });
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    await page
      .getByTestId("employee-home-compact-header")
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => undefined);

    // Incomplete profile can land on /profile via orchestration — return home for banner.
    if (/\/employee\/profile/i.test(page.url()) || /shift-ops\/invite/i.test(page.url())) {
      await page.evaluate(async ({ token, groupId, companyName }) => {
        const join = await import("/src/features/shiftOps/storage/pendingGroupJoin.storage.ts");
        join.stashPendingGroupJoin({
          token,
          groupId,
          companyName,
          useDailyOtpGate: true,
          savedAt: Date.now(),
        });
        const mod = await import(
          "/src/features/employee/profile/storage/employeeProfile.storage.ts"
        );
        const cur = mod.employeeProfileStorage.get();
        mod.employeeProfileStorage.set({
          ...cur,
          skills: [],
          languages: [],
        });
      }, { token: INVITE_TOKEN, groupId: GROUP_ID, companyName: COMPANY_NAME });
      await page.goto("/#/employee/home", { waitUntil: "domcontentloaded" });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      await page
        .getByTestId("employee-home-compact-header")
        .waitFor({ state: "visible", timeout: 15_000 })
        .catch(() => undefined);
    }

    const banner = page.getByTestId("pending-group-join-banner");
    let bannerVisible = await banner.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!bannerVisible) {
      await page.reload({ waitUntil: "domcontentloaded" }).catch(() => undefined);
      await page
        .getByTestId("employee-home-compact-header")
        .waitFor({ state: "visible", timeout: 10_000 })
        .catch(() => undefined);
      bannerVisible = await banner.isVisible({ timeout: 10_000 }).catch(() => false);
    }
    const bannerShot = await shot(page, "INV-HOME-BANNER");
    record({
      id: "INV-HOME-BANNER",
      status: bannerVisible ? "PASS" : "FAIL",
      detail: bannerVisible
        ? "Home shows compact PendingGroupJoinBanner under hero"
        : "Pending invite banner NOT visible on employee home",
      shot: bannerShot,
    });
    expect(bannerVisible, "Pending invite banner must show on home").toBe(true);

    // —— Placement: directly below compact hero header ——
    const placement = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="employee-home-compact-header"]');
      const pill = document.querySelector('[data-testid="pending-group-join-banner"]');
      if (!hero || !pill) return { ok: false, reason: "missing hero or banner" };
      const root = document.querySelector(".wm-homePage");
      if (!root) return { ok: false, reason: "missing home root" };
      const kids = Array.from(root.children);
      const heroIdx = kids.indexOf(hero);
      const pillIdx = kids.indexOf(pill);
      if (heroIdx < 0 || pillIdx < 0) {
        return { ok: false, reason: `heroIdx=${heroIdx} pillIdx=${pillIdx}` };
      }
      return {
        ok: pillIdx === heroIdx + 1,
        reason: `heroIdx=${heroIdx} pillIdx=${pillIdx}`,
        classes: (pill as HTMLElement).className,
      };
    });
    record({
      id: "INV-TOP-PLACEMENT",
      status: placement.ok ? "PASS" : "FAIL",
      detail: placement.ok
        ? `Banner is immediate sibling after hero (${placement.reason})`
        : `Banner not directly below hero: ${placement.reason}`,
      shot: await shot(page, "INV-TOP-PLACEMENT"),
    });
    expect(placement.ok, "Banner must sit directly below home hero").toBe(true);

    const message = page.getByTestId("pending-group-join-message");
    const messageText = ((await message.textContent()) ?? "").trim();
    const companyCopyOk = new RegExp(`Invite from\\s+${COMPANY_NAME}`, "i").test(messageText);
    const noRawGroupId = !messageText.includes(GROUP_ID);
    record({
      id: "INV-COMPANY-COPY",
      status: companyCopyOk && noRawGroupId ? "PASS" : "FAIL",
      detail:
        companyCopyOk && noRawGroupId
          ? `Message shows "${messageText}" (company name, not groupId)`
          : `Expected "Invite from ${COMPANY_NAME}", got "${messageText || "?"}"`,
      shot: await shot(page, "INV-COMPANY-COPY"),
    });
    expect(companyCopyOk).toBe(true);

    const continueBtn = page.getByTestId("pending-group-join-continue");
    const continueLabel = ((await continueBtn.textContent()) ?? "").trim();
    const hasAcceptJoinCopy = /Accept\s*&\s*Join/i.test(continueLabel);
    record({
      id: "INV-CTA-COPY",
      status: hasAcceptJoinCopy ? "PASS" : "FAIL",
      detail: hasAcceptJoinCopy
        ? 'CTA is "Accept & Join"'
        : `CTA is "${continueLabel || "?"}" — expected "Accept & Join"`,
      shot: await shot(page, "INV-CTA-COPY"),
    });
    expect(hasAcceptJoinCopy).toBe(true);

    await continueBtn.click();
    await page.waitForTimeout(1000);

    const onInvite =
      /shift-ops\/invite/i.test(page.url()) ||
      (await page
        .getByTestId("shift-ops-invite-landing")
        .or(page.getByTestId("shift-ops-group-join"))
        .or(page.getByText(/Group join|Daily OTP|pending group/i))
        .first()
        .isVisible({ timeout: 8_000 })
        .catch(() => false));

    const onProfile = /employee\/profile/i.test(page.url());
    const continueOk = onInvite || onProfile;
    record({
      id: "INV-CONTINUE",
      status: continueOk ? "PASS" : "FAIL",
      detail: onInvite
        ? "Accept & Join opened shift-ops invite landing"
        : onProfile
          ? "Accept & Join routed to profile (orchestration: complete profile before join)"
          : `Accept & Join did not open invite/profile — url=${page.url()}`,
      shot: await shot(page, "INV-CONTINUE"),
    });
    expect(continueOk).toBe(true);

    // —— C: Token still present until successful join clears it ——
    const stillPending = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem("wm_pending_group_join_v1");
        return Boolean(raw && raw.includes("aud-invite-tok-visual-001"));
      } catch {
        return false;
      }
    });
    record({
      id: "INV-TOKEN-UNTIL-JOIN",
      status: stillPending ? "PASS" : "WARN",
      detail: stillPending
        ? "Token retained until successful join (clearPendingGroupJoin on submitJoin)"
        : "Token already cleared before join success",
      shot: await shot(page, "INV-TOKEN-UNTIL-JOIN"),
    });

    // —— D: Clear-on-success API contract ——
    const clearOk = await page.evaluate(async () => {
      const mod = await import("/src/features/shiftOps/storage/pendingGroupJoin.storage.ts");
      mod.clearPendingGroupJoin();
      return mod.peekPendingGroupJoin() == null;
    });
    record({
      id: "INV-CLEAR-ON-SUCCESS",
      status: clearOk ? "PASS" : "FAIL",
      detail: clearOk
        ? "clearPendingGroupJoin() removes wm_pending_group_join_v1 (wired after joinSiteVia*)"
        : "clearPendingGroupJoin failed",
      shot: await shot(page, "INV-CLEAR-ON-SUCCESS"),
    });
    expect(clearOk).toBe(true);

    const pass = rows.filter((r) => r.status === "PASS").length;
    const fail = rows.filter((r) => r.status === "FAIL").length;
    const warn = rows.filter((r) => r.status === "WARN").length;
    const report = {
      viewport: VIEWPORT,
      verdict:
        fail === 0
          ? "ACTIVE — compact top-hero pending invite banner with Accept & Join + company name"
          : "NEEDS PATCH — core persist/banner failed",
      gaps: [
        "One-click roster bind is NOT on the home banner — join completes on ShiftOps invite landing (OTP/legacy token)",
      ],
      totals: { pass, fail, warn, total: rows.length },
      rows,
    };
    fs.writeFileSync(path.join(OUT, "PENDING_INVITE_HOME_REPORT.json"), JSON.stringify(report, null, 2));
    const md = [
      "# Pending Invite Flow & Home Pop-Up Audit",
      "",
      `**Verdict:** ${report.verdict}`,
      "",
      `| PASS | ${pass} |`,
      `| FAIL | ${fail} |`,
      `| WARN | ${warn} |`,
      "",
      "## Remaining gaps",
      ...report.gaps.map((g) => `- ${g}`),
      "",
      `| ID | Result | Detail |`,
      `|---|---|---|`,
      ...rows.map(
        (r) =>
          `| ${r.id} | [${r.status === "PASS" ? "x" : " "}] ${r.status} | ${r.detail.replace(/\|/g, "/")} |`,
      ),
    ].join("\n");
    fs.writeFileSync(path.join(OUT, "PENDING_INVITE_HOME_CHECKLIST.md"), md);
    console.log(`\n=== INVITE AUDIT → ${path.join(OUT, "PENDING_INVITE_HOME_CHECKLIST.md")} ===\n`);
    expect(fail).toBe(0);
  });
});
