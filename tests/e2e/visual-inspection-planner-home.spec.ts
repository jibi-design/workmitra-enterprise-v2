/**
 * Job Mitra | visual-inspection-planner-home.spec.ts
 * FINAL visual audit — geometry + computed-style verification (Planner Gig Home).
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/visual-inspection-planner-home.spec.ts
 */

import { expect, test } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  DEFAULT_SMASH_NEEDLES,
  defaultReportPath,
  formatVerdictMarkdown,
  runVisualInspector,
} from "./helpers/visual-assertion-inspector";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLANNER_HOME = "/employee/planner/home";
const REPORT_JSON = defaultReportPath("planner-home");
const REPORT_MD = REPORT_JSON.replace(/\.json$/, ".md");
const DOM_SNAP = join(process.cwd(), "test-results", "command-grid-dom-snapshot.txt");
const STYLE_SNAP = join(process.cwd(), "test-results", "command-grid-style-probe.txt");

test.describe("Autonomous Visual Inspection Robot", () => {
  test("FINAL — geometry + striking style compliance", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.addInitScript(
      ({ splashKey }) => {
        sessionStorage.setItem("wm_role_session_v1", "employee");
        sessionStorage.setItem(splashKey, "1");
        localStorage.setItem(
          "wm_employee_profile_v1",
          JSON.stringify({
            uniqueId: "ML-E2E-VISUAL-ROBOT",
            fullName: "Visual Robot",
            skills: [],
          }),
        );
      },
      { splashKey: SPLASH_KEY },
    );

    const bust = Date.now();
    await page.goto(`/?pw_final=${bust}#${PLANNER_HOME}`, { waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/employee\/planner\/home/);
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await expect(page.getByText("Gig Projects Hub")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".wm-planner-commandTile").first()).toBeVisible();

    // Wait until soft planner theme is applied (not UA defaults, not midnight teal)
    await page.waitForFunction(
      () => {
        const label = document.querySelector(".wm-planner-commandTile__label");
        const tile = document.querySelector(".wm-planner-commandTile");
        if (!label || !tile) return false;
        const ls = getComputedStyle(label);
        const ts = getComputedStyle(tile);
        const weight = parseInt(ls.fontWeight, 10) || 0;
        const size = parseFloat(ls.fontSize);
        const bgImg = ts.backgroundImage || "";
        const bgCol = ts.backgroundColor || "";
        const darkMidnight =
          bgImg.includes("rgb(21, 94, 117)") ||
          bgImg.includes("rgb(22, 78, 99)") ||
          bgImg.includes("#155e75") ||
          bgImg.includes("#164e63");
        const softPrimary =
          tile.classList.contains("wm-planner-commandTile--primary") &&
          (/rgb\(\s*8,\s*145,\s*178/.test(bgCol) || /rgb\(\s*8,\s*145,\s*178/.test(bgImg));
        const softFilled =
          bgImg.includes("gradient") ||
          /rgba?\(\s*8,\s*145,\s*178/.test(bgImg) ||
          /rgba?\(\s*103,\s*232,\s*249/.test(bgImg) ||
          /rgba?\(\s*207,\s*250,\s*254/.test(bgImg) ||
          /rgba?\(\s*255,\s*255,\s*255/.test(bgCol);
        return weight >= 700 && size >= 12.5 && !darkMidnight && (softPrimary || softFilled);
      },
      undefined,
      { timeout: 15_000 },
    );

    // Force CSS stylesheet cache-bust check: shift-planner rules must be present
    const cssProbe = await page.evaluate(async () => {
      const sheets = Array.from(document.styleSheets);
      let hit = false;
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            const text = String((rule as CSSStyleRule).cssText || "");
            if (
              text.includes(".wm-planner-commandTile__label") &&
              (text.includes("13px") || text.includes("font-weight: 800"))
            ) {
              hit = true;
              break;
            }
          }
        } catch {
          /* cross-origin sheet */
        }
        if (hit) break;
      }
      return { labelRulePresent: hit, href: location.href, sheetCount: sheets.length };
    });

    const deepProbe = await page.evaluate(() => {
      const overlap = (a: DOMRect, b: DOMRect) =>
        !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);

      const parseRgb = (c: string) => {
        const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
      };
      const luminance = (rgb: { r: number; g: number; b: number }) => {
        const lin = (v: number) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
      };
      const contrastRatio = (fg: string, bg: string) => {
        const a = parseRgb(fg);
        const b = parseRgb(bg);
        if (!a || !b) return null;
        const L1 = luminance(a);
        const L2 = luminance(b);
        const hi = Math.max(L1, L2);
        const lo = Math.min(L1, L2);
        return (hi + 0.05) / (lo + 0.05);
      };

      const tiles = Array.from(document.querySelectorAll(".wm-planner-commandTile"));
      return tiles.map((tile, idx) => {
        const label = tile.querySelector(".wm-planner-commandTile__label");
        const sep = tile.querySelector(".wm-planner-commandTile__sep");
        const desc = tile.querySelector(".wm-planner-commandTile__desc");
        const ts = window.getComputedStyle(tile);
        const ls = label ? window.getComputedStyle(label) : null;
        const ds = desc ? window.getComputedStyle(desc) : null;
        const ss = sep ? window.getComputedStyle(sep) : null;
        const lr = label?.getBoundingClientRect();
        const dr = desc?.getBoundingClientRect();
        const sr = sep?.getBoundingClientRect();
        const fontWeight = ls ? parseInt(ls.fontWeight, 10) || 0 : 0;
        const fontSize = ls ? parseFloat(ls.fontSize) : 0;
        const descMarginTop = ds ? parseFloat(ds.marginTop) : 0;
        const descFontSize = ds ? parseFloat(ds.fontSize) : 0;
        const sepText = (sep?.textContent || "").trim();
        const hasSepDot = /[·•|]/.test(sepText) || sepText.length > 0;
        const labelDescOverlap = lr && dr ? overlap(lr, dr) : true;
        const gapLabelDesc = lr && dr ? +(dr.top - lr.bottom).toFixed(2) : null;
        const contrast = ls && ts ? contrastRatio(ls.color, ts.backgroundColor) : null;
        const bgImg = ts.backgroundImage || "";
        const bgCol = ts.backgroundColor || "";
        const isPrimary = tile.classList.contains("wm-planner-commandTile--primary");
        const darkMidnight =
          bgImg.includes("rgb(21, 94, 117)") ||
          bgImg.includes("rgb(22, 78, 99)") ||
          bgImg.includes("#155e75") ||
          bgImg.includes("#164e63");
        const softFilled =
          bgImg.includes("gradient") ||
          /rgba?\(\s*8,\s*145,\s*178/.test(bgImg) ||
          /rgba?\(\s*103,\s*232,\s*249/.test(bgImg) ||
          /rgba?\(\s*207,\s*250,\s*254/.test(bgImg) ||
          /rgba?\(\s*255,\s*255,\s*255/.test(bgCol);
        const softPrimary =
          isPrimary &&
          (/rgb\(\s*8,\s*145,\s*178/.test(bgCol) || /rgb\(\s*8,\s*145,\s*178/.test(bgImg));
        const tileBox = tile.getBoundingClientRect();
        const labelIsWhite = ls ? /rgb\(\s*255,\s*255,\s*255/.test(ls.color) : false;
        const labelIsTealOrDark = ls
          ? /rgb\(\s*(15|23|30),\s*(23|41|58)/.test(ls.color) ||
            /rgb\(\s*(8|14),\s*(116|145),\s*(144|178)/.test(ls.color) ||
            ls.color.includes("rgb(0, 0, 0)")
          : false;

        return {
          idx,
          title: (label?.textContent || "").trim(),
          isPrimary,
          hasLabel: Boolean(label),
          hasSep: Boolean(sep),
          hasDesc: Boolean(desc),
          sepText,
          hasSepDot,
          labelDescOverlap,
          gapLabelDescPx: gapLabelDesc,
          labelFontWeight: fontWeight,
          labelFontSizePx: +fontSize.toFixed(2),
          labelColor: ls?.color ?? null,
          labelDisplay: ls?.display ?? null,
          descFontSizePx: +descFontSize.toFixed(2),
          descMarginTopPx: +descMarginTop.toFixed(2),
          descColor: ds?.color ?? null,
          descOpacity: ds ? Number(ds.opacity) : null,
          sepHeightPx: sr ? +sr.height.toFixed(2) : null,
          sepDisplay: ss?.display ?? null,
          tileWidthPx: +tileBox.width.toFixed(2),
          tileHeightPx: +tileBox.height.toFixed(2),
          tileBorderWidth: ts.borderTopWidth,
          tileBorderColor: ts.borderTopColor,
          tileBgImage: bgImg !== "none" ? "gradient-or-image" : "none",
          tileBgColor: bgCol,
          darkMidnight,
          softFilled,
          softPrimary,
          contrastRatio: contrast ? +contrast.toFixed(2) : null,
          softThemeHeuristic:
            fontWeight >= 700 &&
            fontSize >= 12.5 &&
            Boolean(label) &&
            Boolean(desc) &&
            Boolean(sep) &&
            hasSepDot &&
            !labelDescOverlap &&
            !darkMidnight &&
            (isPrimary
              ? softPrimary && labelIsWhite
              : softFilled && (labelIsTealOrDark || !labelIsWhite)),
        };
      });
    });

    const styleLines: string[] = [];
    styleLines.push("=== FINAL GEOMETRY & COMPUTED STYLE PROBE ===");
    styleLines.push(`cssProbe: ${JSON.stringify(cssProbe)}`);
    styleLines.push(`tileCount: ${deepProbe.length}`);
    for (const t of deepProbe) {
      styleLines.push("");
      styleLines.push(`--- tile[${t.idx}] ${t.title || "(untitled)"} ---`);
      styleLines.push(JSON.stringify(t, null, 2));
    }
    const styleText = styleLines.join("\n");
    console.log("\n" + styleText + "\n");
    mkdirSync(dirname(STYLE_SNAP), { recursive: true });
    writeFileSync(STYLE_SNAP, styleText, "utf8");
    writeFileSync(DOM_SNAP, styleText, "utf8");
    await test.info().attach("command-grid-style-probe.txt", {
      body: Buffer.from(styleText, "utf8"),
      contentType: "text/plain",
    });

    expect(deepProbe.length, "expected 6 command tiles").toBeGreaterThanOrEqual(6);

    for (const t of deepProbe) {
      expect(t.hasLabel, `${t.title}: missing __label`).toBe(true);
      expect(t.hasSep, `${t.title}: missing __sep`).toBe(true);
      expect(t.hasDesc, `${t.title}: missing __desc`).toBe(true);
      expect(t.hasSepDot, `${t.title}: separator text missing`).toBe(true);
      expect(t.labelDescOverlap, `${t.title}: label/desc overlap`).toBe(false);
      expect(
        t.labelFontWeight,
        `${t.title}: font-weight ${t.labelFontWeight}`,
      ).toBeGreaterThanOrEqual(700);
      expect(
        t.labelFontSizePx,
        `${t.title}: font-size ${t.labelFontSizePx}`,
      ).toBeGreaterThanOrEqual(12.5);
      expect(
        t.descMarginTopPx + (t.gapLabelDescPx ?? 0),
        `${t.title}: spacing`,
      ).toBeGreaterThanOrEqual(4);
      expect(t.darkMidnight, `${t.title}: must not use midnight teal fill`).toBe(false);
      expect(t.softThemeHeuristic, `${t.title}: soft theme heuristic failed`).toBe(true);
    }

    await expect(
      page.getByRole("button", { name: /Gig Home\. KPIs, preview, command center/i }),
    ).toBeVisible();

    const verdict = await runVisualInspector(page, {
      target: PLANNER_HOME,
      domain: "planner",
      reportPath: REPORT_JSON,
      proofMustCapture: [],
    });

    const md = formatVerdictMarkdown(verdict);
    mkdirSync(dirname(REPORT_MD), { recursive: true });
    writeFileSync(REPORT_MD, md + "\n\n## Style probe\n\n```\n" + styleText + "\n```\n", "utf8");

    await test.info().attach("visual-inspection-verdict.json", {
      body: Buffer.from(JSON.stringify({ verdict, deepProbe, cssProbe }, null, 2), "utf8"),
      contentType: "application/json",
    });
    await test.info().attach("visual-inspection-verdict.md", {
      body: Buffer.from(md, "utf8"),
      contentType: "text/markdown",
    });

    for (const banned of DEFAULT_SMASH_NEEDLES) {
      expect(verdict.proofCaptures).not.toContain(banned);
    }

    expect(verdict.summary.critical, md).toBe(0);
    expect(verdict.summary.high, md).toBe(0);
    expect(verdict.ok, md).toBe(true);

    test.info().annotations.push({
      type: "inspection-verdict",
      description: `FINAL PASS — ${verdict.summary.critical}c/${verdict.summary.high}h/${verdict.summary.medium}m | softTheme tiles=${deepProbe.length}`,
    });

    await context.close();
  });
});
