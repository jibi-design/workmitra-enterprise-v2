/**
 * Job Mitra | visual-inspection-debug-tile.spec.ts
 * Aggressive live-browser vs robot discrepancy diagnostic.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/visual-inspection-debug-tile.spec.ts
 */

import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLANNER_HOME = "/employee/planner/home";
const OUT_DIR = join(process.cwd(), "test-results");
const PNG = join(OUT_DIR, "debug-tile.png");
const REPORT = join(OUT_DIR, "debug-tile-cascade.txt");

test.describe("Discrepancy diagnostic", () => {
  test("URL + cascade + screenshot for command tile", async ({ browser, baseURL }) => {
    test.setTimeout(90_000);
    mkdirSync(OUT_DIR, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await page.addInitScript(
      ({ splashKey }) => {
        sessionStorage.setItem("wm_role_session_v1", "employee");
        sessionStorage.setItem(splashKey, "1");
        localStorage.setItem(
          "wm_employee_profile_v1",
          JSON.stringify({
            uniqueId: "ML-E2E-DEBUG-TILE",
            fullName: "Debug Tile",
            skills: [],
          }),
        );
      },
      { splashKey: SPLASH_KEY },
    );

    const bust = Date.now();
    const targetPath = `/?pw_debug=${bust}#${PLANNER_HOME}`;
    const absoluteUrl = new URL(targetPath, baseURL || "http://localhost:5173").toString();

    await page.goto(absoluteUrl, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });

    await expect(page.getByText("Gig Projects Hub")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".wm-planner-commandTile").first()).toBeVisible();

    // Wait for soft planner theme (Employer-like), not midnight fills
    await page
      .waitForFunction(
        () => {
          const tile = document.querySelector(".wm-planner-commandTile");
          const label = tile?.querySelector(".wm-planner-commandTile__label");
          if (!tile || !label) return false;
          const ts = getComputedStyle(tile);
          const ls = getComputedStyle(label);
          const bg = `${ts.backgroundImage} ${ts.backgroundColor}`;
          const darkMidnight =
            /rgb\(\s*21,\s*94,\s*117\)|rgb\(\s*22,\s*78,\s*99\)|#155e75|#164e63/.test(bg);
          const soft =
            /rgb\(\s*8,\s*145,\s*178/.test(bg) ||
            bg.includes("gradient") ||
            /255,\s*255,\s*255/.test(bg);
          return parseInt(ls.fontWeight, 10) >= 700 && soft && !darkMidnight;
        },
        undefined,
        { timeout: 12_000 },
      )
      .catch(() => undefined);

    const diag = await page.evaluate(() => {
      const tile = document.querySelector(".wm-planner-commandTile") as HTMLElement | null;
      if (!tile) {
        return { error: "no .wm-planner-commandTile found" } as const;
      }

      const label = tile.querySelector(".wm-planner-commandTile__label") as HTMLElement | null;
      const props = [
        "background",
        "background-image",
        "background-color",
        "border",
        "border-top-color",
        "border-top-width",
        "color",
        "font-weight",
        "font-size",
      ] as const;

      type CascadeHit = {
        prop: string;
        value: string;
        winner: string | null;
        href: string | null;
        selectorText: string | null;
        specificity: string | null;
        inline: boolean;
      };

      const cascade: CascadeHit[] = [];

      for (const prop of props) {
        const inline = Boolean(tile.style.getPropertyValue(prop));
        let winner: string | null = null;
        let href: string | null = null;
        let selectorText: string | null = null;
        let specificity: string | null = null;

        // Walk stylesheets for matching rules (best-effort; last match ≈ cascade winner among sheets)
        const matches: Array<{
          href: string | null;
          selectorText: string;
          cssText: string;
          specificity: number;
        }> = [];

        for (const sheet of Array.from(document.styleSheets)) {
          let rules: CSSRuleList | null = null;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          if (!rules) continue;
          const sheetHref = sheet.href;
          const walk = (list: CSSRuleList) => {
            for (const rule of Array.from(list)) {
              if (rule instanceof CSSMediaRule) {
                walk(rule.cssRules);
                continue;
              }
              if (!(rule instanceof CSSStyleRule)) continue;
              if (
                !rule.style.getPropertyValue(prop) &&
                !rule.style.getPropertyValue(prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase()))
              ) {
                // also check camel via style object
                const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
                if (
                  !(rule.style as unknown as Record<string, string>)[camel] &&
                  !rule.cssText.includes(prop)
                )
                  continue;
              }
              try {
                if (tile.matches(rule.selectorText)) {
                  const specs = rule.selectorText.split(",").map((s) => {
                    const sel = s.trim();
                    const ids = (sel.match(/#/g) || []).length;
                    const classes = (sel.match(/\./g) || []).length;
                    const attrs = (sel.match(/\[/g) || []).length;
                    const elements = (sel.match(/^[a-z]+|[ >+][a-z]+/gi) || []).length;
                    return ids * 100 + (classes + attrs) * 10 + elements;
                  });
                  matches.push({
                    href: sheetHref,
                    selectorText: rule.selectorText,
                    cssText: rule.cssText.slice(0, 280),
                    specificity: Math.max(...specs),
                  });
                }
              } catch {
                /* invalid selector for matches() */
              }
            }
          };
          walk(rules);
        }

        matches.sort((a, b) => a.specificity - b.specificity);
        const top = matches[matches.length - 1];
        if (top) {
          winner = top.cssText;
          href = top.href;
          selectorText = top.selectorText;
          specificity = String(top.specificity);
        }

        cascade.push({
          prop,
          value: getComputedStyle(tile).getPropertyValue(prop),
          winner,
          href,
          selectorText,
          specificity,
          inline,
        });
      }

      const labelCs = label ? getComputedStyle(label) : null;
      const tileCs = getComputedStyle(tile);

      return {
        error: null as null,
        locationHref: location.href,
        locationOrigin: location.origin,
        locationPort: location.port,
        title: document.title,
        tileClassName: tile.className,
        tileTag: tile.tagName,
        tileOuterHTML: tile.outerHTML.slice(0, 1200),
        parentOuterHTML:
          (tile.parentElement as HTMLElement | null)?.outerHTML.slice(0, 400) ?? null,
        computed: {
          backgroundImage: tileCs.backgroundImage.slice(0, 200),
          backgroundColor: tileCs.backgroundColor,
          borderTop: `${tileCs.borderTopWidth} ${tileCs.borderTopStyle} ${tileCs.borderTopColor}`,
          color: tileCs.color,
          fontWeight: tileCs.fontWeight,
          labelColor: labelCs?.color ?? null,
          labelFontWeight: labelCs?.fontWeight ?? null,
          labelFontSize: labelCs?.fontSize ?? null,
        },
        looksSoftPlanner:
          !/rgb\(\s*21,\s*94,\s*117\)|rgb\(\s*22,\s*78,\s*99\)/.test(
            `${tileCs.backgroundImage} ${tileCs.backgroundColor}`,
          ) &&
          (/rgb\(\s*8,\s*145,\s*178/.test(tileCs.backgroundColor) ||
            tileCs.backgroundImage.includes("gradient") ||
            /255,\s*255,\s*255/.test(tileCs.backgroundColor)),
        looksGreyUa:
          tileCs.backgroundColor === "rgb(240, 240, 240)" ||
          (tileCs.backgroundImage === "none" && labelCs?.color === "rgb(0, 0, 0)"),
        looksDarkMidnight:
          /rgb\(\s*21,\s*94,\s*117\)|rgb\(\s*22,\s*78,\s*99\)|#155e75|#164e63/.test(
            `${tileCs.backgroundImage} ${tileCs.backgroundColor}`,
          ),
        cascade,
        stylesheets: Array.from(document.styleSheets).map((s, i) => ({
          i,
          href: s.href,
          ruleCount: (() => {
            try {
              return s.cssRules?.length ?? -1;
            } catch {
              return -2;
            }
          })(),
        })),
      };
    });

    // Full-page + tile crop screenshots
    await page.screenshot({ path: PNG, fullPage: false });
    const tile = page.locator(".wm-planner-commandTile").first();
    await tile.screenshot({ path: join(OUT_DIR, "debug-tile-crop.png") });

    const lines: string[] = [];
    lines.push("=== REAL BROWSER VS ROBOT DISCREPANCY DIAGNOSTIC ===");
    lines.push(`playwright.baseURL: ${baseURL}`);
    lines.push(`absoluteUrl requested: ${absoluteUrl}`);
    lines.push(`page.url() after nav: ${page.url()}`);
    lines.push("");
    lines.push(JSON.stringify(diag, null, 2));
    const text = lines.join("\n");
    writeFileSync(REPORT, text, "utf8");
    console.log("\n" + text + "\n");
    console.log(`SCREENSHOT: ${PNG}`);
    console.log(
      `PIXEL VERDICT: ${
        diag && "looksDarkMidnight" in diag && diag.looksDarkMidnight
          ? "DARK MIDNIGHT (BAD)"
          : diag && "looksSoftPlanner" in diag && diag.looksSoftPlanner
            ? "SOFT PLANNER (GOOD)"
            : diag && "looksGreyUa" in diag && diag.looksGreyUa
              ? "GREY UA BUTTONS"
              : "UNKNOWN"
      }`,
    );

    await test.info().attach("debug-tile-cascade.txt", {
      body: Buffer.from(text, "utf8"),
      contentType: "text/plain",
    });
    await test.info().attach("debug-tile.png", {
      path: PNG,
      contentType: "image/png",
    });

    expect(diag && !("error" in diag && diag.error), "tile must exist").toBeTruthy();
    await context.close();
  });
});
