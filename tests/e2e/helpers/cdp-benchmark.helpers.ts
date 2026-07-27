/** CDP throttle + FPS/memory helpers for MNC shift benchmarks */

import type { CDPSession, Page } from "@playwright/test";

export type FpsSampleReport = {
  averageFps: number;
  minFps: number;
  droppedFrames: number;
  sampleCount: number;
};

export type HeapReport = {
  usedJsHeapSize: number;
  totalJsHeapSize: number;
};

export async function attachCdp(page: Page): Promise<CDPSession> {
  return page.context().newCDPSession(page);
}

/** Low-end hardware throttle. Default: 2x CPU + Slow 3G (UI-thread FPS gate). */
export async function applyLowEndThrottle(
  cdp: CDPSession,
  options?: { readonly cpuRate?: number; readonly slowNetwork?: boolean },
): Promise<void> {
  const cpuRate = options?.cpuRate ?? 2;
  const slowNetwork = options?.slowNetwork ?? true;

  if (slowNetwork) {
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 400,
      downloadThroughput: (500 * 1024) / 8,
      uploadThroughput: (500 * 1024) / 8,
      connectionType: "cellular3g",
    });
  }
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
}

export async function clearLowEndThrottle(cdp: CDPSession): Promise<void> {
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
}

export async function forceGc(cdp: CDPSession): Promise<void> {
  try {
    await cdp.send("HeapProfiler.collectGarbage");
  } catch {
    // Some Chromium builds omit HeapProfiler — ignore.
  }
}

export async function readJsHeap(page: Page): Promise<HeapReport> {
  return page.evaluate(() => {
    const perf = performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    };
    return {
      usedJsHeapSize: perf.memory?.usedJSHeapSize ?? 0,
      totalJsHeapSize: perf.memory?.totalJSHeapSize ?? 0,
    };
  });
}

/** Sample rAF deltas while `work` runs; drop = frame gap > 33.4ms (~2 frames). */
export async function measureFpsDuring(
  page: Page,
  work: () => Promise<void>,
  sampleMs = 2500,
): Promise<FpsSampleReport> {
  await page.evaluate((ms) => {
    const w = window as Window & {
      __wmFps?: { frames: number[]; running: boolean; start: number };
    };
    w.__wmFps = { frames: [], running: true, start: performance.now() };
    let last = performance.now();
    const tick = (now: number) => {
      const state = w.__wmFps;
      if (!state?.running) return;
      state.frames.push(now - last);
      last = now;
      if (now - state.start < ms) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, sampleMs);

  await work();
  await page.waitForTimeout(Math.min(400, sampleMs / 4));

  return page.evaluate(() => {
    const w = window as Window & {
      __wmFps?: { frames: number[]; running: boolean };
    };
    if (w.__wmFps) w.__wmFps.running = false;
    const frames = w.__wmFps?.frames ?? [];
    const fpsSamples = frames.filter((d) => d > 0 && d < 1000).map((d) => 1000 / d);
    const averageFps =
      fpsSamples.length === 0 ? 0 : fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
    const minFps = fpsSamples.length === 0 ? 0 : Math.min(...fpsSamples);
    const droppedFrames = frames.filter((d) => d > 33.4).length;
    return {
      averageFps,
      minFps,
      droppedFrames,
      sampleCount: fpsSamples.length,
    };
  });
}

export async function rapidScrollElement(page: Page, testId: string, cycles = 12): Promise<void> {
  const locator = page.getByTestId(testId);
  await locator.waitFor({ state: "visible", timeout: 20_000 });
  for (let i = 0; i < cycles; i += 1) {
    await locator.evaluate((el, dir) => {
      el.scrollTop = dir % 2 === 0 ? el.scrollHeight : 0;
    }, i);
    await page.waitForTimeout(40);
  }
}

/** Writes N applied apps for a post. Survives reload when registered AFTER demo seed. */
export async function seedScaleApplications(
  page: Page,
  count: number,
  postId: string,
): Promise<void> {
  const payload = { scale: count, id: postId };

  const writeScaleApps = ({ scale, id }: { scale: number; id: string }) => {
    const apps = Array.from({ length: scale }, (_, i) => ({
      id: `cdp_app_${i}`,
      postId: id,
      status: "applied",
      createdAt: Date.now() - i,
      profileSnapshot: {
        uniqueId: `WMID_CDP_${i}`,
        fullName: `CDP Worker ${i}`,
      },
      mustHaveAnswers: {},
      goodToHaveAnswers: {},
      notes: {},
    }));
    localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify(apps));
    window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
  };

  // Must register after seedEmployerShiftDemo so this write wins on every navigation.
  await page.addInitScript(writeScaleApps, payload);
  await page.evaluate(writeScaleApps, payload);
}
