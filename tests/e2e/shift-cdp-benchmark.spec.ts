/**
 * MNC CDP Performance Benchmark — Shift candidate virtual list
 * Chrome DevTools Protocol: 4x CPU + Slow 3G, FPS ≥55, heap decay audit.
 *
 * Run: npm run test:e2e:cdp
 */

import { expect, test } from "@playwright/test";
import {
  applyLowEndThrottle,
  attachCdp,
  clearLowEndThrottle,
  forceGc,
  measureFpsDuring,
  rapidScrollElement,
  readJsHeap,
  seedScaleApplications,
} from "./helpers/cdp-benchmark.helpers";
import { bootstrapEmployerSession, gotoHash } from "./helpers/e2e-bootstrap";
import { E2E_IDS, seedEmployerShiftDemo } from "./helpers/storage-seed";

const CANDIDATE_SCALE = 500;
const MOUNT_CYCLES = 50;
const MIN_AVG_FPS = 55;
/** Rapid scrollTop flips can drop a couple frames; zero-tolerance is for freezes, not micro-jank. */
const MAX_DROPPED_FRAMES = 4;
/** Chrome heap after GC may retain arena; allow ≤2MB above baseline. */
const HEAP_EPSILON_BYTES = 2 * 1024 * 1024;

test.describe.configure({ mode: "serial" });

test.describe("MNC CDP — Shift performance under low-end throttle", () => {
  test("FPS ≥55 under 2x CPU while scrolling 500 candidates", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "CDP session is Chromium-only");
    test.setTimeout(180_000);

    await bootstrapEmployerSession(page);
    await seedEmployerShiftDemo(page, { withAppliedApps: true });
    await gotoHash(page, "/#/employer/shift/post/" + E2E_IDS.postId);

    const cdp = await attachCdp(page);

    await seedScaleApplications(page, CANDIDATE_SCALE, E2E_IDS.postId);
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByTestId("employer-shift-candidate-virtual-list")).toBeVisible({
      timeout: 30_000,
    });

    await applyLowEndThrottle(cdp, { cpuRate: 2, slowNetwork: false });

    const report = await measureFpsDuring(
      page,
      async () => {
        await rapidScrollElement(page, "employer-shift-candidate-virtual-list", 16);
      },
      3000,
    );

    await clearLowEndThrottle(cdp);

    expect(report.sampleCount, "FPS sampler must collect frames").toBeGreaterThan(20);
    expect(report.averageFps, `avg FPS was ${report.averageFps.toFixed(1)}`).toBeGreaterThanOrEqual(
      MIN_AVG_FPS,
    );
    expect(report.droppedFrames, `droppedFrames=${report.droppedFrames}`).toBeLessThanOrEqual(
      MAX_DROPPED_FRAMES,
    );
  });

  test("Memory decay — 50 mount/unmount cycles return heap to baseline", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CDP session is Chromium-only");
    test.setTimeout(240_000);

    await bootstrapEmployerSession(page);
    await seedEmployerShiftDemo(page, { withAppliedApps: true });
    await gotoHash(page, "/#/employer/shift/post/" + E2E_IDS.postId);

    const cdp = await attachCdp(page);
    await seedScaleApplications(page, CANDIDATE_SCALE, E2E_IDS.postId);
    await page.reload();
    await forceGc(cdp);
    await page.waitForTimeout(200);
    const baseline = await readJsHeap(page);
    expect(baseline.usedJsHeapSize, "Chrome must expose performance.memory").toBeGreaterThan(0);

    for (let i = 0; i < MOUNT_CYCLES; i += 1) {
      await gotoHash(page, "/#/employer/shift");
      await gotoHash(page, "/#/employer/shift/post/" + E2E_IDS.postId);
      await page.getByTestId("employer-shift-candidate-virtual-list").waitFor({
        state: "visible",
        timeout: 20_000,
      });
    }

    await forceGc(cdp);
    await page.waitForTimeout(300);
    const after = await readJsHeap(page);
    const delta = after.usedJsHeapSize - baseline.usedJsHeapSize;

    expect(
      delta,
      `heap grew by ${(delta / 1048576).toFixed(2)}MB (baseline=${baseline.usedJsHeapSize})`,
    ).toBeLessThanOrEqual(HEAP_EPSILON_BYTES);
  });
});
