/**
 * Job Mitra | employer-capability-ribbon-geometry.spec.ts
 * Fixed ribbon height + high-volume mock at 390px.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/employer-capability-ribbon-geometry.spec.ts
 */

import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HARNESS = "/dev/cap-ribbon-geometry";
const TILE_H = 116;
const OUT = join(process.cwd(), "test-results", "cap-ribbon-geometry.json");

test.describe("Employer capability ribbon geometry", () => {
  test("high-volume mock: equal heights, 2-line clamp, no 390px overflow", async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      sessionStorage.setItem("wm_splash_intro_played_v1", "1");
    });

    const url = new URL(`/?pw_cap=${Date.now()}#${HARNESS}`, baseURL || "http://localhost:5173");
    await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("cap-ribbon-geometry-harness")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("employer-capability-ribbon")).toBeVisible();
    await expect(page.getByTestId("employer-cap-shift")).toBeVisible();

    await page.waitForFunction(
      (h) => {
        const tile = document.querySelector(".wm-erDashCapTile");
        return tile != null && Math.round(tile.getBoundingClientRect().height) === h;
      },
      TILE_H,
      { timeout: 15_000 },
    );

    const report = await page.evaluate((expectedH) => {
      const tiles = [...document.querySelectorAll(".wm-erDashCapTile")] as HTMLElement[];
      const heights = tiles.map((el) => Math.round(el.getBoundingClientRect().height * 100) / 100);
      const unique = [...new Set(heights.map((h) => Math.round(h)))];
      const status = tiles.map((tile) => {
        const el = (tile.querySelector(".wm-erDashCapTile__alert") ??
          tile.querySelector(".wm-erDashCapTile__hint")) as HTMLElement | null;
        if (!el) return { ok: false, lines: 0, clamp: "" };
        const cs = getComputedStyle(el);
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
        const lines = lh > 0 ? el.getBoundingClientRect().height / lh : 99;
        return {
          ok: lines <= 2.15,
          lines: Math.round(lines * 100) / 100,
          clamp: cs.webkitLineClamp || cs.getPropertyValue("line-clamp"),
          overflow: cs.overflow,
        };
      });
      const doc = document.documentElement;
      const ribbon = document.querySelector(".wm-erDashCapRibbon") as HTMLElement | null;
      const overlaps = [];
      for (let i = 0; i < tiles.length; i += 1) {
        const a = tiles[i].getBoundingClientRect();
        for (let j = i + 1; j < tiles.length; j += 1) {
          const b = tiles[j].getBoundingClientRect();
          const hit =
            a.left < b.right - 0.5 &&
            a.right > b.left + 0.5 &&
            a.top < b.bottom - 0.5 &&
            a.bottom > b.top + 0.5;
          if (hit) overlaps.push(`${i}-${j}`);
        }
      }
      return {
        tileCount: tiles.length,
        heights,
        uniqueRoundedHeights: unique,
        heightDelta: Math.max(...heights) - Math.min(...heights),
        expectedH,
        status,
        viewportWidth: window.innerWidth,
        documentScrollWidth: doc.scrollWidth,
        ribbonScrollWidth: ribbon?.scrollWidth ?? 0,
        ribbonClientWidth: ribbon?.clientWidth ?? 0,
        bodyOverflowX: getComputedStyle(document.body).overflowX,
        overlaps,
      };
    }, TILE_H);

    mkdirSync(join(process.cwd(), "test-results"), { recursive: true });
    writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");

    expect(report.tileCount).toBe(6);
    expect(report.uniqueRoundedHeights).toEqual([TILE_H]);
    expect(report.heightDelta).toBeLessThanOrEqual(0.5);
    expect(report.overlaps).toEqual([]);
    expect(report.documentScrollWidth).toBeLessThanOrEqual(report.viewportWidth + 1);
    expect(report.ribbonScrollWidth).toBeLessThanOrEqual(report.ribbonClientWidth + 1);
    for (const row of report.status) {
      expect(String(row.clamp)).toBe("2");
      expect(row.lines).toBeLessThanOrEqual(2.15);
      expect(row.overflow).toBe("hidden");
    }

    await context.close();
  });
});
