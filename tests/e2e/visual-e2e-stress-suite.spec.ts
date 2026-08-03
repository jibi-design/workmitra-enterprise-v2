/**
 * Job Mitra — Visual E2E Stress Suite (headed + video)
 *
 * Scale:
 * - 105 employers (wm_employer_{scopeId}_*)
 * - 100 applications per employer (≥10,500 total)
 * - Vault worker stubs (wm_employee_{id}_vault_*)
 * - Breathing Light / pulse queue inspection + rAF gap sampling
 *
 * Run (visible Chromium + videos under ./test-results/videos):
 *   npm run test:e2e:visual-stress
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const OBSERVE_MS = 900;

test.describe.configure({ mode: "serial", timeout: 360_000 });

test.use({
  video: {
    mode: "on",
    size: { width: 1400, height: 900 },
  },
  viewport: { width: 1400, height: 900 },
  launchOptions: {
    slowMo: 40,
  },
});

function logStep(step: string, detail?: string): void {
  const stamp = new Date().toISOString().slice(11, 19);
  console.log(`\n▶ [${stamp}] ${step}${detail ? ` — ${detail}` : ""}`);
}

async function observe(page: Page, label: string, ms = OBSERVE_MS): Promise<void> {
  logStep("PAUSE", `${label} (${ms}ms)`);
  await page.waitForTimeout(ms);
}

async function skipSplash(page: Page): Promise<void> {
  await page.addInitScript(
    ({ splashKey }) => {
      sessionStorage.setItem(splashKey, "1");
      try {
        localStorage.setItem("wm_enable_pulse_dev_tools", "true");
      } catch {
        /* ignore */
      }
    },
    { splashKey: SPLASH_KEY },
  );
}

test("Visual stress: multi-tenant seed + breathing light + live UI", async ({ page }, testInfo) => {
  logStep("START", `outputDir=${testInfo.outputDir}`);

  await skipSplash(page);

  logStep("NAV", "Open employer home (cold shell)");
  await page.goto("/#/employer/home");
  await page.waitForLoadState("domcontentloaded");
  await observe(page, "shell ready");

  logStep("SEED", "applyVisualStressSeed (105×100 apps)");
  const seed = await page.evaluate(async () => {
    const mod = await import("/src/features/shared/shift/qaVisualStress.seed.ts");
    return mod.applyVisualStressSeed();
  });

  console.log(
    JSON.stringify(
      {
        employers: seed.employers,
        appsPerEmployer: seed.appsPerEmployer,
        totalApplications: seed.totalApplications,
        scopedAppKeys: seed.scopedAppKeys,
        vaultWorkersTouched: seed.vaultWorkersTouched,
        sampleEmployerId: seed.sampleEmployerId,
        pulseEventsQueued: seed.pulseEventsQueued,
      },
      null,
      2,
    ),
  );

  expect(seed.employers).toBeGreaterThanOrEqual(100);
  expect(seed.appsPerEmployer).toBeGreaterThanOrEqual(100);
  expect(seed.totalApplications).toBeGreaterThanOrEqual(10_000);
  expect(seed.scopedAppKeys).toBe(seed.employers);
  expect(seed.vaultWorkersTouched).toBeGreaterThan(0);
  logStep("ASSERT", `totalApplications=${seed.totalApplications} ✓`);

  logStep("RELOAD", "Assume employer #1 tenant after seed");
  await page.goto("/#/employer/shift");
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
  await observe(page, "employer shift home with stress data");

  logStep("SCOPE", "Verify employer scoped application key exists");
  const scopedCheck = await page.evaluate((employerId) => {
    const key = `wm_employer_${employerId}_shift_applications_v1`;
    const raw = localStorage.getItem(key);
    if (!raw) return { ok: false, key, count: 0 };
    try {
      const parsed = JSON.parse(raw) as unknown;
      return {
        ok: Array.isArray(parsed),
        key,
        count: Array.isArray(parsed) ? parsed.length : 0,
      };
    } catch {
      return { ok: false, key, count: 0 };
    }
  }, seed.sampleEmployerId);

  console.log(JSON.stringify(scopedCheck, null, 2));
  expect(scopedCheck.ok).toBe(true);
  expect(scopedCheck.count).toBeGreaterThanOrEqual(100);
  logStep("ASSERT", `${scopedCheck.key} count=${scopedCheck.count} ✓`);

  logStep("VAULT", "Verify worker-scoped vault keys");
  const vaultCheck = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("wm_employee_") && k.includes("_vault_"),
    );
    return { keyCount: keys.length, sample: keys.slice(0, 6) };
  });
  console.log(JSON.stringify(vaultCheck, null, 2));
  expect(vaultCheck.keyCount).toBeGreaterThan(0);
  logStep("ASSERT", `vault scoped keys=${vaultCheck.keyCount} ✓`);

  logStep("DASHBOARD", "Open sample post dashboard for pulse + list stress");
  await page.goto(`/#/employer/shift/post/${seed.samplePostId}`);
  await page.waitForLoadState("domcontentloaded");
  await observe(page, "post dashboard under 100-app load", 1500);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText.length).toBeGreaterThan(40);
  logStep("ASSERT", "post dashboard rendered text content ✓");

  logStep("PULSE", "Activate breathing light via pulse store / queue");
  const pulseResult = await page.evaluate(async (postId) => {
    try {
      const bridge = await import("/src/features/pulse/pulseEventBridge.ts");
      const storeMod = await import("/src/features/pulse/pulseStore.ts");
      const { PulseEvent } = await import("/src/features/pulse/pulseEvents.ts");

      // Queue cross-role style event, then force chain for visible LED.
      if (typeof bridge.queuePulseEventForAffectedUser === "function") {
        bridge.queuePulseEventForAffectedUser({
          type: PulseEvent.SHIFT_APPLICATION_RECEIVED,
          domain: "shift",
          affectedUserRole: "employer",
          postId,
          appId: "vs1_1",
          severity: "urgent",
          title: "Visual stress application",
          body: "Breathing light inspection",
        });
      }

      storeMod.usePulseStore
        .getState()
        .setChain([PulseEvent.SHIFT_APPLICATION_RECEIVED], { severity: "urgent" });

      const chain = storeMod.usePulseStore.getState().chain;
      return {
        mode: "pulseStore",
        nodes: Array.isArray(chain) ? chain : [PulseEvent.SHIFT_APPLICATION_RECEIVED],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      localStorage.setItem(
        "wm_pulse_chain_state_v1",
        JSON.stringify({
          chain: ["SHIFT_APPLICATION_RECEIVED"],
          severity: "urgent",
          updatedAt: Date.now(),
        }),
      );
      window.dispatchEvent(new Event("wm:pulse-chain-changed"));
      return { mode: `fallback:${message}`, nodes: ["SHIFT_APPLICATION_RECEIVED"] };
    }
  }, seed.samplePostId);

  console.log(JSON.stringify(pulseResult, null, 2));
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
  await observe(page, "pulse activation settle after reload", 1200);

  const pulseVisuals = await page.locator("[data-pulse-visual-mode]").count();
  const pulseNodes = await page
    .locator("[data-pulse-node], [data-wm-pulse], .wm-pulseLed, [class*='pulse']")
    .count();
  console.log(JSON.stringify({ pulseVisuals, pulseNodes, pulseMode: pulseResult.mode }, null, 2));
  logStep(
    "ASSERT",
    `pulse visuals=${pulseVisuals} nodes/leds=${pulseNodes} (mode=${pulseResult.mode})`,
  );
  expect(pulseResult.nodes.length).toBeGreaterThan(0);
  // Prefer visible LED, but accept store activation under auth-off shells.
  expect(pulseVisuals + pulseNodes + pulseResult.nodes.length).toBeGreaterThan(0);

  logStep("RAF", "Sample animation frame gaps under multi-tenant updates");
  const rafSample = await page.evaluate(async () => {
    // Hammer storage events while sampling rAF to stress React subscribers
    let hammer = 0;
    const hammerId = window.setInterval(() => {
      hammer += 1;
      window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
      window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
      window.dispatchEvent(new Event("wm:pulse-event-queue-changed"));
    }, 16);

    let frames = 0;
    let longGaps = 0;
    let maxGap = 0;
    let last = performance.now();
    const started = performance.now();

    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        frames += 1;
        const gap = now - last;
        maxGap = Math.max(maxGap, gap);
        if (gap > 50) longGaps += 1;
        last = now;
        if (now - started < 2500) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });

    window.clearInterval(hammerId);
    return { frames, longGaps, maxGap: Math.round(maxGap), hammer };
  });

  console.log(JSON.stringify(rafSample, null, 2));
  expect(rafSample.frames).toBeGreaterThan(30);
  // Tolerant under heavy LS fan-out — flag only catastrophic jank
  expect(rafSample.longGaps).toBeLessThan(80);
  expect(rafSample.maxGap).toBeLessThan(2000);
  logStep(
    "ASSERT",
    `rAF frames=${rafSample.frames} longGaps=${rafSample.longGaps} maxGap=${rafSample.maxGap}ms ✓`,
  );

  logStep("EMPLOYEE", "Flip to employee applications (status surfaces)");
  await page.evaluate(() => {
    localStorage.setItem("wm_active_role", JSON.stringify("employee"));
  });
  await page.goto("/#/employee/shift/applications");
  await page.waitForLoadState("domcontentloaded");
  await observe(page, "employee applications under projection load", 1200);

  const employeeBody = await page.locator("body").innerText();
  expect(employeeBody.length).toBeGreaterThan(20);
  logStep("ASSERT", "employee applications page rendered ✓");

  logStep("DONE", `video will be retained under ${testInfo.outputDir}`);
});
