/**
 * Job Mitra | visual-inspection-employer-planner-plans.spec.ts
 * Employer /planner/plans — agency polish, no legacy hero/duplicate empty/IDLE.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/visual-inspection-employer-planner-plans.spec.ts
 */

import { expect, test } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  formatVerdictMarkdown,
  runVisualInspector,
  defaultReportPath,
} from "./helpers/visual-assertion-inspector";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLANS_PATH = "/employer/planner/plans";
const REPORT_JSON = defaultReportPath("employer-planner-plans");
const REPORT_MD = REPORT_JSON.replace(/\.json$/, ".md");
const STYLE_SNAP = join(process.cwd(), "test-results", "employer-plans-style-probe.txt");

test.describe("Employer Planner Plans List Robot", () => {
  test("FINAL — dense hero + unified buckets + no duplicate empty", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await page.addInitScript(
      ({ splashKey }) => {
        sessionStorage.setItem("wm_role_session_v1", "employer");
        sessionStorage.setItem(splashKey, "1");
      },
      { splashKey: SPLASH_KEY },
    );

    const bust = Date.now();
    await page.goto(`/?pw_er_plans=${bust}#${PLANS_PATH}`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/employer\/planner\/plans/);
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await expect(page.getByText("Demand Planner Hub")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".wm-domainHero--agencyDense")).toBeVisible();
    await expect(page.getByTestId("planner-plans-counts")).toBeVisible();

    // Legacy surfaces must be gone
    await expect(page.locator(".wm-planner-hero")).toHaveCount(0);
    await expect(page.getByTestId("planner-plans-empty")).toHaveCount(0);
    await expect(page.getByText(/Every plan status is shown/i)).toHaveCount(0);
    await expect(page.getByText(/^Idle$/i)).toHaveCount(0);
    await expect(page.getByText(/No demand plans yet/i)).toHaveCount(0);

    const probe = await page.evaluate(() => {
      const parseRgb = (c: string) => {
        const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
      };
      const isNearWhite = (c: string) => {
        const rgb = parseRgb(c);
        return Boolean(rgb && rgb.r >= 248 && rgb.g >= 248 && rgb.b >= 248);
      };

      const topbar = document.querySelector(".wm-er-topbarPlanner, .wm-er-topbar");
      const topbarCs = topbar ? getComputedStyle(topbar) : null;

      const values = Array.from(
        document.querySelectorAll(".wm-planner-kpiStrip--counts .wm-planner-kpiValue"),
      ).map((el) => {
        const cs = getComputedStyle(el);
        return {
          text: (el.textContent || "").trim(),
          fontSizePx: +parseFloat(cs.fontSize).toFixed(2),
          fontWeight: parseInt(cs.fontWeight, 10) || 0,
        };
      });

      const buckets = Array.from(
        document.querySelectorAll(".wm-planner-statusBucket[data-empty='true']"),
      ).map((el) => {
        const status = el.getAttribute("data-status") || "?";
        return {
          status,
          compact: Boolean(el.querySelector(".wm-planner-empty--compact")),
          hasIcon: Boolean(el.querySelector(".wm-planner-empty__icon")),
          hasIdle: Boolean(el.querySelector(".wm-planner-empty__idle")),
          hasCreate: Boolean(el.querySelector(".wm-planner-btnPrimary")),
          heightPx: +el.getBoundingClientRect().height.toFixed(1),
        };
      });

      const primary = document.querySelector(".wm-planner-commandTile--primary");
      const primaryBg = primary ? getComputedStyle(primary).backgroundColor : null;

      return {
        topbarWhite: topbarCs ? isNearWhite(topbarCs.backgroundColor) : false,
        topbarBg: topbarCs?.backgroundColor ?? null,
        hasAgencyHero: Boolean(document.querySelector(".wm-domainHero--agencyDense")),
        hasEmployerPanel: Boolean(document.querySelector(".wm-planner-commandPanel--employer")),
        primaryBg,
        values,
        buckets,
        legacyHeroCount: document.querySelectorAll(".wm-planner-hero").length,
        enterpriseEmptyCount: document.querySelectorAll('[data-testid="planner-plans-empty"]')
          .length,
      };
    });

    const styleText = ["=== EMPLOYER PLANS LIST PROBE ===", JSON.stringify(probe, null, 2)].join(
      "\n",
    );
    console.log("\n" + styleText + "\n");
    mkdirSync(dirname(STYLE_SNAP), { recursive: true });
    writeFileSync(STYLE_SNAP, styleText, "utf8");

    await page.screenshot({
      path: join(process.cwd(), "test-results", "employer-planner-plans-full.png"),
      fullPage: true,
    });

    expect(probe.legacyHeroCount).toBe(0);
    expect(probe.enterpriseEmptyCount).toBe(0);
    expect(probe.hasAgencyHero).toBe(true);
    expect(probe.hasEmployerPanel).toBe(true);
    expect(probe.topbarWhite, `topbar ${probe.topbarBg}`).toBe(true);
    expect(probe.primaryBg).toMatch(/rgb\(\s*8,\s*145,\s*178/);
    expect(probe.values.length).toBe(4);
    for (const v of probe.values) {
      expect(v.fontSizePx).toBeLessThanOrEqual(17);
      expect(v.fontWeight).toBeLessThanOrEqual(800);
      expect(v.text.toLowerCase().includes("total")).toBe(false);
    }
    expect(probe.buckets.length).toBe(4);
    for (const b of probe.buckets) {
      expect(b.compact, `${b.status} compact`).toBe(true);
      expect(b.hasIcon, `${b.status} icon`).toBe(true);
      expect(b.hasIdle, `${b.status} must not show Idle`).toBe(false);
      expect(b.heightPx).toBeLessThanOrEqual(120);
    }
    expect(probe.buckets.find((b) => b.status === "draft")?.hasCreate).toBe(true);
    expect(probe.buckets.find((b) => b.status === "active")?.hasCreate).toBe(true);
    expect(probe.buckets.find((b) => b.status === "completed")?.hasCreate).toBe(false);
    expect(probe.buckets.find((b) => b.status === "cancelled")?.hasCreate).toBe(false);

    const verdict = await runVisualInspector(page, {
      target: PLANS_PATH,
      domain: "planner",
      reportPath: REPORT_JSON,
      proofMustCapture: [],
    });
    const md = formatVerdictMarkdown(verdict);
    mkdirSync(dirname(REPORT_MD), { recursive: true });
    writeFileSync(REPORT_MD, md + "\n\n## Plans probe\n\n```\n" + styleText + "\n```\n", "utf8");

    expect(verdict.summary.critical, md).toBe(0);
    expect(verdict.summary.high, md).toBe(0);
    expect(verdict.ok, md).toBe(true);

    await context.close();
  });
});
