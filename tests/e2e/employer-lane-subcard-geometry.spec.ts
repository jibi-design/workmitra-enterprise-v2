/**
 * Job Mitra | employer-lane-subcard-geometry.spec.ts
 * High-volume sub-card list + preview badges at 390px.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/employer-lane-subcard-geometry.spec.ts
 */

import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HARNESS = "/dev/lane-subcard-geometry";
const OUT = join(process.cwd(), "test-results", "lane-subcard-geometry.json");

test.describe("Employer lane sub-card geometry", () => {
  test("high-volume mock: list layout, no overflow, badges clear, text clamped", async ({
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

    const url = new URL(`/?pw_lane=${Date.now()}#${HARNESS}`, baseURL || "http://localhost:5173");
    await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("lane-subcard-geometry-harness")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("employer-preview-shift-open")).toBeVisible();
    await expect(page.getByTestId("employer-preview-career-match")).toBeVisible();
    await expect(page.getByText("Preview: 95% Match")).toBeVisible();
    await expect(page.getByText("Preview: 52 workers")).toBeVisible();
    await expect(page.getByText("+ Post")).toHaveCount(0);
    await expect(page.getByText("+ Create")).toHaveCount(0);
    await expect(page.getByText("Quick post")).toHaveCount(0);

    const report = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".wm-erDashPreviewCard")] as HTMLElement[];
      const bentos = [...document.querySelectorAll(".wm-erDashBento--triple")] as HTMLElement[];
      const doc = document.documentElement;
      const padBreaks: string[] = [];
      const hOverflow: string[] = [];
      const badgeHits: string[] = [];
      const blurbLines: number[] = [];

      for (const card of cards) {
        const cs = getComputedStyle(card);
        const box = card.getBoundingClientRect();
        const padL = parseFloat(cs.paddingLeft) || 0;
        const padR = parseFloat(cs.paddingRight) || 0;
        const inner = card.querySelector(".wm-erDashPreviewCard__copy") as HTMLElement | null;
        const badge = card.querySelector(".wm-erDashPreviewCard__badge") as HTMLElement | null;
        const blurb = card.querySelector(".wm-erDashPreviewCard__blurb") as HTMLElement | null;
        const testId = card.getAttribute("data-testid") || "card";
        if (card.scrollWidth > card.clientWidth + 1) hOverflow.push(testId);
        if (inner) {
          const ib = inner.getBoundingClientRect();
          if (ib.left < box.left + padL - 1 || ib.right > box.right - padR + 1) {
            padBreaks.push(testId);
          }
        }
        if (inner && badge) {
          const a = inner.getBoundingClientRect();
          const b = badge.getBoundingClientRect();
          const overlap =
            a.left < b.right - 1 &&
            a.right > b.left + 1 &&
            a.top < b.bottom - 1 &&
            a.bottom > b.top + 1;
          if (overlap) badgeHits.push(testId);
        }
        if (blurb) {
          const lh = parseFloat(getComputedStyle(blurb).lineHeight) || 16;
          blurbLines.push(Math.round((blurb.getBoundingClientRect().height / lh) * 100) / 100);
        }
      }

      return {
        cardCount: cards.length,
        bentoCount: bentos.length,
        columns: bentos.map((el) => getComputedStyle(el).gridTemplateColumns),
        pxTracks: bentos.map(
          (el) => (getComputedStyle(el).gridTemplateColumns.match(/px/g) || []).length,
        ),
        viewportWidth: window.innerWidth,
        documentScrollWidth: doc.scrollWidth,
        hOverflow,
        padBreaks,
        badgeHits,
        blurbLines,
        maxBlurbLines: Math.max(0, ...blurbLines),
        hasPostCreate: /Quick post|\+ Post|\+ Create/.test(document.body.innerText),
      };
    });

    mkdirSync(join(process.cwd(), "test-results"), { recursive: true });
    writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");

    expect(report.cardCount).toBe(9);
    expect(report.bentoCount).toBe(3);
    expect(report.pxTracks.every((n) => n <= 1)).toBe(true);
    expect(report.documentScrollWidth).toBeLessThanOrEqual(report.viewportWidth + 1);
    expect(report.hOverflow).toEqual([]);
    expect(report.padBreaks).toEqual([]);
    expect(report.badgeHits).toEqual([]);
    expect(report.maxBlurbLines).toBeLessThanOrEqual(2.15);
    expect(report.hasPostCreate).toBe(false);

    await context.close();
  });
});
