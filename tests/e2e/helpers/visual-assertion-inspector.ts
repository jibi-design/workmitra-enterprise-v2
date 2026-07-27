/**
 * Job Mitra | visual-assertion-inspector.ts
 * Autonomous Visual Assertion & DOM Inspector (STRICT smash restoration).
 *
 * Domains: Planner | Shift | Career
 * Checks:
 *  1. Debug / placeholder text leaks
 *  2. Concatenated label+description (STRICT string smash → CRITICAL)
 *  3. Raw / unstyled interactive controls
 *  4. Bounding-box geometry (overlap / zero-gap → CRITICAL)
 *  5. 4-state UI signals (loading / empty / active / error)
 *  6. DEV audit sandbox exclusion
 */

import type { Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type InspectorSeverity = "critical" | "high" | "medium" | "low" | "info";

export type InspectorFinding = {
  id: string;
  severity: InspectorSeverity;
  category:
    "debug-text" | "hierarchy" | "geometry" | "four-state" | "a11y" | "domain" | "enterprise";
  message: string;
  evidence: string;
  selector?: string;
};

export type InspectorVerdict = {
  ok: boolean;
  target: string;
  domain: "planner" | "shift" | "career" | "unknown";
  scannedAt: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  findings: InspectorFinding[];
  proofCaptures: string[];
  notes: string[];
};

export type RunInspectorOptions = {
  target: string;
  domain?: InspectorVerdict["domain"];
  /** Expected smash needles (robot self-proof). Defaults to Planner Home smash set. */
  proofMustCapture?: string[];
  reportPath?: string;
};

export const DEFAULT_SMASH_NEEDLES = [
  "Gig HomeKPIs",
  "Browse ProjectsMega",
  "My ApplicationsPlan",
  "WorkspacesConfirmed",
  "EarningsProject",
  "ProfileRequired",
] as const;

const DEBUG_TEXT_PATTERNS: RegExp[] = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bHACK\b/i,
  /\bDEBUG\b/i,
  /\blorem ipsum\b/i,
  /\bplaceholder\b/i,
  /\bcoming soon\b/i,
  /\bnot implemented\b/i,
  /\btest only\b/i,
  /\bwip\b/i,
  /\bHybrid A2\b/,
  /\bP-SEP-\d+\b/,
];

/** Camel-ish smash: Letter immediately followed by uppercase (HomeKPIs, ProjectsMega). */
// Pattern is declared inside probe scopes that need a local copy for worker isolation.

const ENTERPRISE_BTN_HINT =
  /(wm-planner-btn|wm-planner-commandTile|wm-planner-fab|wm-primarybtn|wm-outlineBtn|wm-press|wm-ent-|wm-shift-cta|wm-homeQuickTile|wm-domainHero|wm-iconbtn|wm-avatarBtn|wm-title|wm-nav|wm-tab|wm-bottomNav|wm-shell|wm-helpFaq|wm-helpContact)/i;

const AUDIT_SANDBOX_SEL =
  '[data-audit-sandbox], [data-wm-audit-ignore="true"], .wm-dev-audit-sandbox';

function countBySeverity(findings: InspectorFinding[]): InspectorVerdict["summary"] {
  const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: findings.length };
  for (const f of findings) summary[f.severity] += 1;
  return summary;
}

/**
 * Pure DOM scan — STRICT string smash (original rigorous logic).
 * Contiguous label+description join without separator → CRITICAL (no soft-pass).
 */
export function buildInPageInspectorScript(): string {
  return `(() => {
    const findings = [];
    const push = (f) => findings.push(f);

    const DEBUG_RES = ${JSON.stringify(DEBUG_TEXT_PATTERNS.map((r) => r.source))}.map(
      (s) => new RegExp(s, "i"),
    );
    const CONCAT_SMASH_RE = /[a-z)][A-Z]/;
    const ENTERPRISE_BTN_HINT = ${ENTERPRISE_BTN_HINT.toString()};
    const AUDIT_SANDBOX_SEL = ${JSON.stringify(AUDIT_SANDBOX_SEL)};

    const root =
      document.querySelector(".wm-ee-vPlanner, .wm-er-vPlanner, .wm-ee-vShift, .wm-er-vShift, .wm-ee-vCareer, .wm-er-vCareer, main, #root") ||
      document.body;

    const isSandboxed = (el) =>
      Boolean(el && el.closest && el.closest(AUDIT_SANDBOX_SEL));

    const visible = (el) => {
      if (!(el instanceof Element)) return false;
      if (isSandboxed(el)) return false;
      const st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };

    const pathOf = (el) => {
      if (!(el instanceof Element)) return "";
      const parts = [];
      let cur = el;
      for (let i = 0; i < 4 && cur; i++) {
        const id = cur.id ? "#" + cur.id : "";
        const cls = typeof cur.className === "string" && cur.className.trim()
          ? "." + cur.className.trim().split(/\\s+/).slice(0, 2).join(".")
          : "";
        parts.unshift(cur.tagName.toLowerCase() + id + cls);
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };

    const rectsOverlap = (a, b) =>
      !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);

    /** ORIGINAL STRICT compact: trim each span, drop empties, join with NO separator. */
    const compactSpans = (el) =>
      Array.from(el.querySelectorAll("span"))
        .map((s) => (s.textContent || "").trim())
        .filter(Boolean)
        .join("");

    /**
     * DIV-aware command-tile compact:
     * join __label + optional __sep + __desc (same smash rules as spans).
     * Missing sep → label+desc collide → CRITICAL when camel-smash matches.
     */
    const compactCommandTileText = (el) => {
      const label = el.querySelector(".wm-planner-commandTile__label");
      const desc = el.querySelector(".wm-planner-commandTile__desc");
      if (!label || !desc) return null;
      const sep = el.querySelector(".wm-planner-commandTile__sep");
      const parts = [(label.textContent || "").trim()];
      if (sep) {
        const sepText = (sep.textContent || "").trim();
        if (sepText) parts.push(sepText);
      }
      parts.push((desc.textContent || "").trim());
      return parts.filter(Boolean).join("");
    };

    // --- 1) Debug / placeholder text ---
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = (node.textContent || "").replace(/\\s+/g, " ").trim();
      if (!text || text.length < 3) continue;
      const parent = node.parentElement;
      if (!parent || !visible(parent)) continue;
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
      for (const re of DEBUG_RES) {
        if (re.test(text)) {
          push({
            id: "debug-" + findings.length,
            severity: "high",
            category: "debug-text",
            message: "Developer / debug / placeholder text leaked into UI",
            evidence: text.slice(0, 160),
            selector: pathOf(parent),
          });
          break;
        }
      }
    }

    // --- 2) STRICT hierarchy smash on interactive controls ---
    const controls = root.querySelectorAll("button, a, [role='button']");
    controls.forEach((el, idx) => {
      if (isSandboxed(el) || !visible(el)) return;
      const raw = (el.textContent || "").replace(/\\s+/g, " ").trim();
      const hasInnerSpans = el.querySelectorAll("span").length >= 2;
      if (hasInnerSpans) {
        const compacted = compactSpans(el);
        if (CONCAT_SMASH_RE.test(compacted)) {
          push({
            id: "concat-span-" + idx,
            severity: "critical",
            category: "hierarchy",
            message:
              "Adjacent label/description spans smash into one readable string (missing separator / layout hierarchy)",
            evidence: compacted.slice(0, 120),
            selector: pathOf(el),
          });
        }
      }

      // DIV-aware: __label + __desc (with optional __sep) — never span-blind
      const tileCompact = compactCommandTileText(el);
      if (tileCompact && CONCAT_SMASH_RE.test(tileCompact)) {
        push({
          id: "concat-div-" + idx,
          severity: "critical",
          category: "hierarchy",
          message:
            "Command tile label+description divs smash into one readable string (missing structural separator)",
          evidence: tileCompact.slice(0, 120),
          selector: pathOf(el),
        });
      }

      const cls = typeof el.className === "string" ? el.className : "";
      if (el.tagName === "BUTTON" && !ENTERPRISE_BTN_HINT.test(cls)) {
        const st = window.getComputedStyle(el);
        const looksBare =
          (st.backgroundColor === "rgba(0, 0, 0, 0)" || st.backgroundColor === "transparent") &&
          (st.borderStyle === "none" || st.borderWidth === "0px");
        if (looksBare || !cls.trim()) {
          push({
            id: "bare-btn-" + idx,
            severity: "medium",
            category: "hierarchy",
            message: "Interactive control missing enterprise button/card classes",
            evidence: (raw || el.tagName).slice(0, 80),
            selector: pathOf(el),
          });
        }
      }
    });

    // Command tiles: ALWAYS sample compacted text — smash = CRITICAL (span OR div)
    root.querySelectorAll(".wm-planner-commandTile, [data-testid='planner-command-grid'] button").forEach((el, idx) => {
      if (isSandboxed(el) || !visible(el)) return;
      const spanCompact = compactSpans(el);
      const divCompact = compactCommandTileText(el);
      const compacted = divCompact || spanCompact;
      if (!compacted) return;
      const smashed = CONCAT_SMASH_RE.test(compacted);
      push({
        id: "command-tile-proof-" + idx,
        severity: smashed ? "critical" : "info",
        category: "hierarchy",
        message: smashed
          ? "Command tile text concatenation (label+description)"
          : "Command tile text sampled (separator OK)",
        evidence: compacted.slice(0, 160),
        selector: pathOf(el),
      });

      const labelEl = el.querySelector(".wm-planner-commandTile__label");
      const descEl = el.querySelector(".wm-planner-commandTile__desc");
      if (labelEl && descEl && visible(labelEl) && visible(descEl)) {
        const a = labelEl.getBoundingClientRect();
        const b = descEl.getBoundingClientRect();
        if (rectsOverlap(a, b)) {
          push({
            id: "geom-overlap-cmd-" + idx,
            severity: "critical",
            category: "geometry",
            message: "Command tile label/description boxes visually overlap",
            evidence: compacted.slice(0, 80),
            selector: pathOf(el),
          });
        }
      }
    });

    // --- 3) Orphan long paragraphs ---
    root.querySelectorAll("p").forEach((el, idx) => {
      if (isSandboxed(el) || !visible(el)) return;
      const inCard = el.closest(
        ".wm-planner-card, .wm-domainHero, .wm-homeGlassCard, .wm-homeQuickTile, .wm-ent-card, .wm-ee-card, .wm-er-tile",
      );
      if (!inCard && !el.className) {
        const t = (el.textContent || "").trim();
        if (t.length > 40) {
          push({
            id: "orphan-p-" + idx,
            severity: "low",
            category: "hierarchy",
            message: "Long paragraph outside enterprise card/hero surface",
            evidence: t.slice(0, 120),
            selector: pathOf(el),
          });
        }
      }
    });

    // --- 4) Four-state compliance signals ---
    const bodyText = (root.textContent || "").toLowerCase();
    const hasLoading =
      Boolean(root.querySelector("[aria-busy='true'], .wm-ent-skeleton, [data-testid*='skeleton'], .wm-loading")) ||
      /\\bloading\\b|\\bsearching\\b/.test(bodyText);
    const hasEmpty =
      Boolean(root.querySelector(".wm-planner-empty, [data-testid*='empty'], .wm-ent-empty")) ||
      /no (open )?project|no active|nothing here|all clear|not yet/.test(bodyText);
    const hasError =
      Boolean(root.querySelector("[role='alert'], .wm-error, [data-testid*='error']")) ||
      /something went wrong|unexpected error|failed to/.test(bodyText);
    const hasActive =
      Boolean(root.querySelector(".wm-planner-commandTile, .wm-domainHero, .wm-planner-kpiTile, .wm-planner-megaCard")) ||
      /gig projects|multi-day|browse/.test(bodyText);

    const fourState = { loading: hasLoading, empty: hasEmpty, active: hasActive, error: hasError };
    push({
      id: "four-state-snapshot",
      severity: "info",
      category: "four-state",
      message: "4-state probe snapshot for current view (presence signals only)",
      evidence: JSON.stringify(fourState),
    });

    if (!hasActive) {
      push({
        id: "four-state-active-missing",
        severity: "high",
        category: "four-state",
        message: "Active/content enterprise primitives not detected on target page",
        evidence: "expected DomainHero / command tiles / KPI / mega cards",
      });
    }

    const kpiValues = Array.from(root.querySelectorAll(".wm-planner-kpiValue")).map((el) =>
      (el.textContent || "").trim(),
    );
    const allZero = kpiValues.length > 0 && kpiValues.every((v) => v === "0");
    if (allZero && !hasEmpty) {
      push({
        id: "four-state-empty-weak",
        severity: "medium",
        category: "four-state",
        message: "KPIs are all zero but no dedicated Empty-state enterprise primitive detected",
        evidence: "kpiValues=" + kpiValues.join(","),
      });
    }

    return findings;
  })()`;
}

export async function runVisualInspector(
  page: Page,
  options: RunInspectorOptions,
): Promise<InspectorVerdict> {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(400);

  const raw = (await page.evaluate(buildInPageInspectorScript())) as InspectorFinding[];
  const findings = Array.isArray(raw) ? raw : [];

  const proofMustCapture = options.proofMustCapture ?? [...DEFAULT_SMASH_NEEDLES];

  const notes: string[] = [];
  notes.push(
    "PROTOCOL: DIV-aware smash — spans AND __label/__desc checked; missing structural __sep = CRITICAL.",
  );

  const liveProof = await page.evaluate((needles: string[]) => {
    const found: string[] = [];
    const SANDBOX = '[data-audit-sandbox], [data-wm-audit-ignore="true"], .wm-dev-audit-sandbox';

    const compactTile = (el: Element) => {
      const label = el.querySelector(".wm-planner-commandTile__label");
      const desc = el.querySelector(".wm-planner-commandTile__desc");
      if (label && desc) {
        const sep = el.querySelector(".wm-planner-commandTile__sep");
        const parts = [(label.textContent || "").trim()];
        if (sep) {
          const sepText = (sep.textContent || "").trim();
          if (sepText) parts.push(sepText);
        }
        parts.push((desc.textContent || "").trim());
        return parts.filter(Boolean).join("");
      }
      const spans = Array.from(el.querySelectorAll("span"))
        .map((s) => (s.textContent || "").trim())
        .filter(Boolean);
      return spans.length >= 2 ? spans.join("") : "";
    };

    document.querySelectorAll("button, a, [role='button']").forEach((el) => {
      if (el.closest(SANDBOX)) return;
      const compacted = compactTile(el);
      if (!compacted) return;
      for (const n of needles) {
        if (compacted.includes(n) && !found.includes(n)) found.push(n);
      }
    });
    return found;
  }, proofMustCapture);

  const proofCaptures: string[] = [];
  for (const needle of proofMustCapture) {
    const hit = findings.find((f) => f.evidence.includes(needle)) || liveProof.includes(needle);
    if (hit) proofCaptures.push(typeof hit === "string" ? hit : needle);
  }

  for (const n of liveProof) {
    if (!proofCaptures.includes(n)) {
      findings.push({
        id: `robot-miss-${n}`,
        severity: "critical",
        category: "domain",
        message:
          "Inspector failed to flag a live concatenation that exists in DOM (robot self-fail)",
        evidence: n,
      });
      notes.push(`SELF-FAIL: live DOM has "${n}" but primary scan missed it`);
    }
  }

  for (const n of proofCaptures) {
    notes.push(`PROOF: robot captured "${n}"`);
  }

  if (liveProof.length === 0 && proofMustCapture.length > 0) {
    notes.push(
      "NOTE: Expected smash strings not present in live DOM — UI may have separators masking smash, or UI changed.",
    );
  }

  // Any live smash needle present must force CRITICAL findings even if primary scan under-counted
  for (const n of liveProof) {
    const already = findings.some(
      (f) => f.severity === "critical" && f.category === "hierarchy" && f.evidence.includes(n),
    );
    if (!already) {
      findings.push({
        id: `live-smash-${findings.length}`,
        severity: "critical",
        category: "hierarchy",
        message: "Live DOM smash needle confirmed (strict string probe)",
        evidence: n,
      });
    }
  }

  const blocking = findings.filter((f) => f.severity === "critical" || f.severity === "high");
  const verdict: InspectorVerdict = {
    ok: blocking.length === 0,
    target: options.target,
    domain: options.domain ?? "unknown",
    scannedAt: new Date().toISOString(),
    summary: countBySeverity(findings),
    findings,
    proofCaptures,
    notes,
  };

  if (options.reportPath) {
    mkdirSync(dirname(options.reportPath), { recursive: true });
    writeFileSync(options.reportPath, JSON.stringify(verdict, null, 2), "utf8");
  }

  return verdict;
}

export function formatVerdictMarkdown(v: InspectorVerdict): string {
  const lines: string[] = [];
  lines.push(`# Robotic Inspection Verdict`);
  lines.push("");
  lines.push(`- Target: \`${v.target}\``);
  lines.push(`- Domain: **${v.domain}**`);
  lines.push(`- Scanned: ${v.scannedAt}`);
  lines.push(
    `- Result: **${v.ok ? "PASS" : "FAIL"}** (${v.summary.critical} critical / ${v.summary.high} high / ${v.summary.medium} medium / ${v.summary.low} low / ${v.summary.info} info)`,
  );
  lines.push(
    `- Proof captures: ${v.proofCaptures.length ? v.proofCaptures.map((p) => `\`${p}\``).join(", ") : "_none_"}`,
  );
  lines.push("");
  if (v.notes.length) {
    lines.push(`## Notes`);
    for (const n of v.notes) lines.push(`- ${n}`);
    lines.push("");
  }
  lines.push(`## Findings`);
  if (!v.findings.length) {
    lines.push("_No findings._");
  } else {
    for (const f of v.findings) {
      lines.push(
        `- **[${f.severity.toUpperCase()}/${f.category}]** ${f.message} — \`${f.evidence.replace(/`/g, "'")}\`${f.selector ? ` @ \`${f.selector}\`` : ""}`,
      );
    }
  }
  return lines.join("\n");
}

export function defaultReportPath(slug: string): string {
  return join(process.cwd(), "test-results", `visual-inspection-${slug}.json`);
}
