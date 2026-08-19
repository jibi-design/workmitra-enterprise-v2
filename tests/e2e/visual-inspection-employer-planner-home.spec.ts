/**
 * Job Mitra | visual-inspection-employer-planner-home.spec.ts
 * Employer Demand Planner home — smash + color match + compact empty audit.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/visual-inspection-employer-planner-home.spec.ts
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
const PLANNER_HOME = "/employer/planner/home";
const REPORT_JSON = defaultReportPath("employer-planner-home");
const REPORT_MD = REPORT_JSON.replace(/\.json$/, ".md");
const STYLE_SNAP = join(process.cwd(), "test-results", "employer-command-grid-style-probe.txt");

const EMPLOYER_SMASH_NEEDLES = [
  "New Plan3-step",
  "All PlansDrafts",
  "ApplicationsPlan",
  "RosterConfirmed",
] as const;

/** Empty draft/active buckets must stay compact on mobile viewport. */
const MAX_EMPTY_BUCKET_HEIGHT_PX = 120;

test.describe("Employer Planner Visual Inspection Robot", () => {
  test("FINAL — command color match + compact empty + smash", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    await page.addInitScript(
      ({ splashKey }) => {
        sessionStorage.setItem("wm_role_session_v1", "employer");
        sessionStorage.setItem(splashKey, "1");
      },
      { splashKey: SPLASH_KEY },
    );

    const bust = Date.now();
    await page.goto(`/?pw_er_final=${bust}#${PLANNER_HOME}`, { waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/employer\/planner\/home/);
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await expect(page.getByText("Demand Planner Hub")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".wm-planner-commandTile").first()).toBeVisible();

    await page.waitForFunction(
      () => {
        const primary = document.querySelector(".wm-planner-commandTile--primary");
        if (!primary) return false;
        const bg = getComputedStyle(primary).backgroundColor;
        return /rgb\(\s*8,\s*145,\s*178/.test(bg);
      },
      undefined,
      { timeout: 15_000 },
    );

    const deepProbe = await page.evaluate(() => {
      const parseRgb = (c: string) => {
        const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
      };
      const isNearWhite = (c: string) => {
        const rgb = parseRgb(c);
        if (!rgb) return false;
        return rgb.r >= 248 && rgb.g >= 248 && rgb.b >= 248;
      };
      const hasShiftGreen = (s: string) =>
        /rgb\(\s*22,\s*163,\s*74\)|rgba\(\s*22,\s*163,\s*74|#16a34a|240,\s*253,\s*250/.test(s);

      const tiles = Array.from(document.querySelectorAll(".wm-planner-commandTile"));
      const tileProbe = tiles.map((tile, idx) => {
        const label = tile.querySelector(".wm-planner-commandTile__label");
        const sep = tile.querySelector(".wm-planner-commandTile__sep");
        const desc = tile.querySelector(".wm-planner-commandTile__desc");
        const ts = getComputedStyle(tile);
        const ls = label ? getComputedStyle(label) : null;
        const isPrimary = tile.classList.contains("wm-planner-commandTile--primary");
        const bgCol = ts.backgroundColor || "";
        const bgImg = ts.backgroundImage || "";
        const softPrimary = isPrimary && /rgb\(\s*8,\s*145,\s*178/.test(bgCol);
        const softFilled =
          !isPrimary && (bgImg.includes("gradient") || /rgba?\(\s*8,\s*145,\s*178/.test(bgImg));
        const labelIsWhite = ls ? /rgb\(\s*255,\s*255,\s*255/.test(ls.color) : false;
        const labelIsTeal = ls ? /rgb\(\s*(8|14),\s*(116|145),\s*(144|178)/.test(ls.color) : false;

        return {
          idx,
          title: (label?.textContent || "").trim(),
          isPrimary,
          hasLabel: Boolean(label),
          hasSep: Boolean(sep),
          hasDesc: Boolean(desc),
          tileBgColor: bgCol,
          tileBgImage: bgImg !== "none" ? "gradient-or-image" : "none",
          labelColor: ls?.color ?? null,
          softPrimary,
          softFilled,
          labelIsWhite,
          labelIsTeal,
          colorMatchOk: isPrimary
            ? softPrimary && labelIsWhite
            : softFilled && labelIsTeal && !labelIsWhite,
        };
      });

      const topbar = document.querySelector(".wm-er-topbar, .wm-er-topbarPlanner");
      const topbarCs = topbar ? getComputedStyle(topbar) : null;
      const topbarBg = topbarCs ? `${topbarCs.backgroundImage} ${topbarCs.backgroundColor}` : "";
      const topbarProbe = {
        exists: Boolean(topbar),
        className: topbar?.className ?? null,
        backgroundColor: topbarCs?.backgroundColor ?? null,
        backgroundImage: topbarCs?.backgroundImage ?? null,
        isSolidWhite: topbarCs ? isNearWhite(topbarCs.backgroundColor) : false,
        hasShiftGreenMix: hasShiftGreen(topbarBg),
      };

      const kpiTiles = Array.from(
        document.querySelectorAll(".wm-planner-kpiStrip--agency .wm-planner-kpiTile"),
      ).map((el) => {
        const cs = getComputedStyle(el);
        const valueEl = el.querySelector(".wm-planner-kpiValue");
        const vs = valueEl ? getComputedStyle(valueEl) : null;
        const bg = `${cs.backgroundImage} ${cs.backgroundColor}`;
        const accent = getComputedStyle(el, "::before").width;
        return {
          hasTealWash: /8,\s*145,\s*178|207,\s*250,\s*254|236,\s*254,\s*255/.test(bg),
          border: cs.borderTopColor,
          hasAccentBar: parseFloat(accent) >= 1.5,
          isFill: el.classList.contains("wm-planner-kpiTile--fill"),
          valueFontSizePx: vs ? +parseFloat(vs.fontSize).toFixed(2) : null,
          valueFontWeight: vs ? parseInt(vs.fontWeight, 10) || 0 : null,
          valueText: (valueEl?.textContent || "").trim(),
        };
      });

      const fillMeter = document.querySelector(".wm-planner-kpiMeter");
      const fillProbe = {
        hasMeter: Boolean(fillMeter),
        hasFillTile: Boolean(document.querySelector(".wm-planner-kpiTile--fill")),
        hasAgencyStrip: Boolean(document.querySelector(".wm-planner-kpiStrip--agency")),
        hasDenseHero: Boolean(document.querySelector(".wm-domainHero--agencyDense")),
      };

      const emptyBuckets = Array.from(
        document.querySelectorAll(".wm-planner-statusBucket[data-empty='true']"),
      ).map((el) => {
        const box = el.getBoundingClientRect();
        const status = el.getAttribute("data-testid")?.replace("planner-status-bucket-", "") ?? "?";
        const compact = Boolean(el.querySelector(".wm-planner-empty--compact"));
        const slim = Boolean(el.querySelector(".wm-planner-empty--slim"));
        const hasIcon = Boolean(el.querySelector(".wm-planner-empty__icon"));
        const hasIdle = Boolean(el.querySelector(".wm-planner-empty__idle"));
        const hasCreate = Boolean(el.querySelector(".wm-planner-btnPrimary"));
        return {
          status,
          heightPx: +box.height.toFixed(1),
          compact,
          slim,
          hasIcon,
          hasIdle,
          hasCreate,
          className: el.className,
        };
      });

      const lastBucket = document.querySelector(
        "[data-testid='planner-status-bucket-cancelled']",
      ) as HTMLElement | null;
      const bottomNav = document.querySelector(
        ".wm-bottomNav, nav[aria-label*='Bottom'], [data-testid='employer-bottom-nav']",
      ) as HTMLElement | null;
      const container = document.querySelector(".pb-safe-nav") as HTMLElement | null;
      const containerPb = container ? getComputedStyle(container).paddingBottom : null;

      // Scroll to end so last card is in view, then measure clearance vs nav
      window.scrollTo(0, document.documentElement.scrollHeight);
      const lastBox = lastBucket?.getBoundingClientRect();
      const navBox = bottomNav?.getBoundingClientRect();
      const clearance = {
        containerPaddingBottom: containerPb,
        lastBucketBottom: lastBox ? +lastBox.bottom.toFixed(1) : null,
        navTop: navBox ? +navBox.top.toFixed(1) : null,
        lastClearsNav: lastBox && navBox ? lastBox.bottom <= navBox.top - 4 : containerPb != null,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      };

      const panel = document.querySelector(".wm-planner-commandPanel--employer");

      return {
        tileProbe,
        topbarProbe,
        kpiTiles,
        fillProbe,
        emptyBuckets,
        clearance,
        hasEmployerPanel: Boolean(panel),
        panelBorder: panel ? getComputedStyle(panel).borderTopColor : null,
        primaryRgb: parseRgb(
          getComputedStyle(document.querySelector(".wm-planner-commandTile--primary") as Element)
            .backgroundColor,
        ),
      };
    });

    const styleText = [
      "=== EMPLOYER PLANNER HOME STYLE PROBE ===",
      JSON.stringify(deepProbe, null, 2),
    ].join("\n");
    console.log("\n" + styleText + "\n");
    mkdirSync(dirname(STYLE_SNAP), { recursive: true });
    writeFileSync(STYLE_SNAP, styleText, "utf8");
    await test.info().attach("employer-command-grid-style-probe.txt", {
      body: Buffer.from(styleText, "utf8"),
      contentType: "text/plain",
    });

    await page.locator('[data-testid="planner-employer-command-grid"]').screenshot({
      path: join(process.cwd(), "test-results", "employer-planner-command-audit.png"),
    });
    await page.screenshot({
      path: join(process.cwd(), "test-results", "employer-planner-home-full.png"),
      fullPage: true,
    });

    expect(deepProbe.hasEmployerPanel).toBe(true);
    expect(deepProbe.tileProbe.length).toBe(4);

    expect(deepProbe.topbarProbe.exists, "employer topbar missing").toBe(true);
    expect(deepProbe.topbarProbe.hasShiftGreenMix, "topbar must not mix Shift green/mint").toBe(
      false,
    );
    expect(deepProbe.topbarProbe.isSolidWhite, "topbar must be solid white").toBe(true);

    for (const t of deepProbe.tileProbe) {
      expect(t.hasLabel, `${t.title}: label`).toBe(true);
      expect(t.hasSep, `${t.title}: sep`).toBe(true);
      expect(t.hasDesc, `${t.title}: desc`).toBe(true);
      expect(t.colorMatchOk, `${t.title}: color match failed ${JSON.stringify(t)}`).toBe(true);
    }

    for (const kpi of deepProbe.kpiTiles) {
      expect(kpi.hasTealWash, `KPI missing teal wash`).toBe(true);
      expect(kpi.hasAccentBar, `KPI missing premium accent bar`).toBe(true);
      expect(
        kpi.valueFontSizePx ?? 99,
        `KPI value too large: ${kpi.valueFontSizePx}`,
      ).toBeLessThanOrEqual(17);
      expect(kpi.valueFontWeight ?? 0, `KPI value too heavy`).toBeLessThanOrEqual(800);
      expect(kpi.valueText.includes("total"), `budget must not say "total": ${kpi.valueText}`).toBe(
        false,
      );
    }
    expect(deepProbe.fillProbe.hasMeter, "Fill meter missing").toBe(true);
    expect(deepProbe.fillProbe.hasFillTile, "Fill tile missing").toBe(true);
    expect(deepProbe.fillProbe.hasAgencyStrip, "agency metrics strip missing").toBe(true);
    expect(deepProbe.fillProbe.hasDenseHero, "agency dense hero missing").toBe(true);

    expect(deepProbe.emptyBuckets.length).toBe(4);
    for (const b of deepProbe.emptyBuckets) {
      expect(b.compact, `${b.status}: must use compact chrome`).toBe(true);
      expect(b.slim, `${b.status}: must not use slim legacy empty`).toBe(false);
      expect(b.hasIcon, `${b.status}: missing empty icon`).toBe(true);
      expect(b.heightPx, `${b.status} empty too tall: ${b.heightPx}`).toBeLessThanOrEqual(
        MAX_EMPTY_BUCKET_HEIGHT_PX,
      );
    }
    expect(deepProbe.emptyBuckets.find((b) => b.status === "draft")?.hasCreate).toBe(true);
    expect(deepProbe.emptyBuckets.find((b) => b.status === "active")?.hasCreate).toBe(true);
    expect(deepProbe.emptyBuckets.find((b) => b.status === "completed")?.hasIdle).toBe(false);
    expect(deepProbe.emptyBuckets.find((b) => b.status === "cancelled")?.hasIdle).toBe(false);
    expect(deepProbe.emptyBuckets.find((b) => b.status === "completed")?.hasCreate).toBe(false);
    expect(deepProbe.emptyBuckets.find((b) => b.status === "cancelled")?.hasCreate).toBe(false);

    const draft = deepProbe.emptyBuckets.find((b) => b.status === "draft");
    const active = deepProbe.emptyBuckets.find((b) => b.status === "active");

    const pad = parseFloat(deepProbe.clearance.containerPaddingBottom || "0");
    expect(
      pad,
      `bottom pad too small: ${deepProbe.clearance.containerPaddingBottom}`,
    ).toBeGreaterThanOrEqual(120);
    if (deepProbe.clearance.navTop != null && deepProbe.clearance.lastBucketBottom != null) {
      expect(
        deepProbe.clearance.lastClearsNav,
        `last card under nav: lastBottom=${deepProbe.clearance.lastBucketBottom} navTop=${deepProbe.clearance.navTop}`,
      ).toBe(true);
    }

    const verdict = await runVisualInspector(page, {
      target: PLANNER_HOME,
      domain: "planner",
      reportPath: REPORT_JSON,
      proofMustCapture: [],
    });

    const md = formatVerdictMarkdown(verdict);
    const reportBody =
      md +
      "\n\n## Employer style probe\n\n```\n" +
      styleText +
      "\n```\n\n## Mobile empty height gate\n\n" +
      `- max empty draft/active height: ${MAX_EMPTY_BUCKET_HEIGHT_PX}px\n` +
      `- draft: ${draft?.heightPx}px compact=${draft?.compact}\n` +
      `- active: ${active?.heightPx}px compact=${active?.compact}\n`;

    mkdirSync(dirname(REPORT_MD), { recursive: true });
    writeFileSync(REPORT_MD, reportBody, "utf8");

    await test.info().attach("visual-inspection-verdict.json", {
      body: Buffer.from(JSON.stringify({ verdict, deepProbe }, null, 2), "utf8"),
      contentType: "application/json",
    });
    await test.info().attach("visual-inspection-verdict.md", {
      body: Buffer.from(reportBody, "utf8"),
      contentType: "text/markdown",
    });

    for (const banned of EMPLOYER_SMASH_NEEDLES) {
      expect(verdict.proofCaptures).not.toContain(banned);
    }

    expect(verdict.summary.critical, md).toBe(0);
    expect(verdict.summary.high, md).toBe(0);
    expect(verdict.ok, md).toBe(true);

    test.info().annotations.push({
      type: "inspection-verdict",
      description: `EMPLOYER PASS — ${verdict.summary.critical}c/${verdict.summary.high}h | tiles=${deepProbe.tileProbe.length} emptyDraft=${draft?.heightPx}px`,
    });

    await context.close();
  });
});
