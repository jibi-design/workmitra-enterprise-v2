// src/features/employer/home/components/EmployerHomeSecondaryCards.tsx
// Session 15: Dots grey zero, em dash, CSS vars, useCallback, vault stats prop.

import { useCallback } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { countTotalPendingRatings } from "../../helpers/ratingNudgeHelpers";
import type { DashboardData } from "../helpers/employerHomeDashboard";
import {
  HOME_COLORS,
  CARD_ICON_CONTAINER,
  CARD_TITLE,
  CARD_SUB,
  TAP_TO_MANAGE,
} from "../helpers/employerHomeConstants";
import { IconWorkforce, IconShield, IconChart } from "./employerHomeIcons";

/* ---- Style tokens ---- */
const ZERO_TEXT = "var(--wm-zero-text, #94a3b8)";
const ZERO_CHIP: CSSProperties = {
  color: ZERO_TEXT,
  background: "var(--wm-zero-bg, rgba(100,116,139,0.06))",
};
const ACTION_BTN: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  minWidth: 100,
  padding: "8px 16px",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 8,
  whiteSpace: "nowrap",
  textAlign: "center",
};
const VAULT_ACCENT = "var(--wm-er-accent-hr)";
const INSIGHTS_ACCENT = "var(--wm-insights-accent, #64748b)";
const ROW_BASE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  borderTop: "1px solid rgba(0,0,0,0.06)",
};
const ROW_LABEL: CSSProperties = {
  flex: 1,
  fontSize: 13,
  color: "var(--wm-er-muted)",
  fontWeight: 500,
};

function dotStyle(color: string): CSSProperties {
  return {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    marginRight: 10,
  };
}

function valStyle(isZero: boolean): CSSProperties {
  return {
    fontSize: 14,
    fontWeight: 600,
    color: isZero ? ZERO_TEXT : "var(--wm-er-text)",
  };
}

/* ---- Employer rating helper ---- */
function getEmployerRatingDisplay(): string {
  try {
    const raw = localStorage.getItem("wm_employer_ratings_v1");
    if (!raw) return "\u2014";
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return "\u2014";
    let total = 0;
    let count = 0;
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const r = (item as Record<string, unknown>)["rating"];
      if (typeof r === "number" && r > 0) {
        total += r;
        count++;
      }
    }
    if (count === 0) return "\u2014";
    return `${(total / count).toFixed(1)}\u2605`;
  } catch {
    return "\u2014";
  }
}

/* ------------------------------------------------ */
/* Workforce Card (Phase 2 — preserved)             */
/* ------------------------------------------------ */
export function WorkforceCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employerWorkforceHome);
  }, [nav]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") nav(ROUTE_PATHS.employerWorkforceHome);
  }, [nav]);

  const handleBtn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nav(ROUTE_PATHS.employerWorkforceHome);
  }, [nav]);

  return (
    <section
      className="wm-er-card wm-er-accentCard wm-er-vWorkforce"
      role="button"
      tabIndex={0}
      aria-label="Open Workforce"
      onClick={handleOpen}
      onKeyDown={handleKey}
      style={{ cursor: "pointer" }}
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon"><IconWorkforce /></div>
            <div>
              <div className="wm-er-cardTitle">Workforce</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Manage staff, attendance and permissions.
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtn}
            aria-label="View staff"
            style={ACTION_BTN}
          >
            View Staff
          </button>
        </div>
      </div>
      <div className="wm-er-chips">
        <span className="wm-er-chip" style={data.shiftGroups === 0 ? ZERO_CHIP : undefined}>
          Staff: <span className="n">{data.shiftGroups}</span>
        </span>
        <span className="wm-er-chip" style={data.broadcastMessages === 0 ? ZERO_CHIP : undefined}>
          Alerts: <span className="n">{data.broadcastMessages}</span>
        </span>
        <span className="wm-er-chip" style={data.shiftConfirmed === 0 ? ZERO_CHIP : undefined}>
          Attendance: <span className="n">{data.shiftConfirmed}</span>
        </span>
      </div>
      <div style={TAP_TO_MANAGE("var(--wm-er-accent-workforce)")}>Tap to manage →</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Rating Hint Card                                 */
/* ------------------------------------------------ */
export function RatingHintCard() {
  const pendingTotal = countTotalPendingRatings();
  if (pendingTotal === 0) return null;

  return (
    <section className="wm-er-card" style={{ borderLeft: `4px solid ${HOME_COLORS.rating}` }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            ...CARD_ICON_CONTAINER,
            background: HOME_COLORS.ratingBg,
            color: HOME_COLORS.rating,
            fontSize: 18,
          }}
        >
          ★
        </div>
        <div>
          <div style={CARD_TITLE}>
            {pendingTotal} worker{pendingTotal !== 1 ? "s" : ""} awaiting your rating
          </div>
          <div style={{ ...CARD_SUB, lineHeight: 1.5 }}>
            Companies that rate workers get priority access to top-rated talent.
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Work Vault Card (Purple) — with stats pill       */
/* ------------------------------------------------ */
type WorkVaultCardProps = {
  /** Number of employee verifications completed (computed in parent page) */
  verificationCount?: number;
};

export function WorkVaultCard({ verificationCount = 0 }: WorkVaultCardProps) {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employerVaultLookup);
  }, [nav]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") nav(ROUTE_PATHS.employerVaultLookup);
  }, [nav]);

  const handleBtn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nav(ROUTE_PATHS.employerVaultLookup);
  }, [nav]);

  return (
    <section
      className="wm-er-card wm-er-accentCard"
      role="button"
      tabIndex={0}
      aria-label="Open Work Vault"
      onClick={handleOpen}
      onKeyDown={handleKey}
      style={{
        cursor: "pointer",
        "--wm-er-accent": VAULT_ACCENT,
        "--wm-er-wash": "rgba(124,58,237,0.04)",
      } as CSSProperties}
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon"><IconShield /></div>
            <div>
              <div className="wm-er-cardTitle">Work Vault</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Verify employee documents securely.
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtn}
            aria-label="Verify employee documents"
            style={{ ...ACTION_BTN, background: VAULT_ACCENT }}
          >
            Verify
          </button>
        </div>
      </div>

      {/* Stats pill row */}
      <div className="wm-er-chips">
        <span className="wm-er-chip" style={verificationCount === 0 ? ZERO_CHIP : undefined}>
          Verified: <span className="n">{verificationCount}</span>
        </span>
      </div>

      <div style={TAP_TO_MANAGE(VAULT_ACCENT)}>Tap to manage →</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Insights Card (Grey) — Tappable Rows             */
/* Session 15: Dots grey when zero, em dash rating  */
/* ------------------------------------------------ */
export function InsightsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  const ratingDisplay = getEmployerRatingDisplay();
  const isRatingZero = ratingDisplay === "\u2014";

  const handleCardClick = useCallback(() => {
    nav(ROUTE_PATHS.employerShiftHome);
  }, [nav]);

  const handleCardKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") nav(ROUTE_PATHS.employerShiftHome);
  }, [nav]);

  const handleBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nav(ROUTE_PATHS.employerShiftHome);
  }, [nav]);

  const handleShiftRow = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nav(ROUTE_PATHS.employerShiftHome);
  }, [nav]);

  const handleShiftRowKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      nav(ROUTE_PATHS.employerShiftHome);
    }
  }, [nav]);

  const handleCareerRow = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nav(ROUTE_PATHS.employerCareerHome);
  }, [nav]);

  const handleCareerRowKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      nav(ROUTE_PATHS.employerCareerHome);
    }
  }, [nav]);

  return (
    <section
      className="wm-er-card wm-er-accentCard"
      role="button"
      tabIndex={0}
      aria-label="Open Insights"
      onClick={handleCardClick}
      onKeyDown={handleCardKey}
      style={{
        cursor: "pointer",
        "--wm-er-accent": INSIGHTS_ACCENT,
        "--wm-er-wash": "rgba(100,116,139,0.04)",
      } as CSSProperties}
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon"><IconChart /></div>
            <div>
              <div className="wm-er-cardTitle">Insights</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Track your hiring and activity.
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtnClick}
            aria-label="View history"
            style={{ ...ACTION_BTN, background: INSIGHTS_ACCENT }}
          >
            View History
          </button>
        </div>
      </div>

      <div>
        {/* Total shifts posted */}
        <div
          style={{ ...ROW_BASE, cursor: "pointer" }}
          role="button"
          tabIndex={0}
          onClick={handleShiftRow}
          onKeyDown={handleShiftRowKey}
        >
          <div style={dotStyle(data.shiftTotalPosts === 0 ? ZERO_TEXT : "var(--wm-er-accent-shift)")} />
          <span style={ROW_LABEL}>Total shifts posted</span>
          <span style={valStyle(data.shiftTotalPosts === 0)}>{data.shiftTotalPosts}</span>
        </div>

        {/* Workers hired */}
        <div
          style={{ ...ROW_BASE, cursor: "pointer" }}
          role="button"
          tabIndex={0}
          onClick={handleCareerRow}
          onKeyDown={handleCareerRowKey}
        >
          <div style={dotStyle(data.careerHired === 0 ? ZERO_TEXT : "var(--wm-er-accent-career)")} />
          <span style={ROW_LABEL}>Workers hired</span>
          <span style={valStyle(data.careerHired === 0)}>{data.careerHired}</span>
        </div>

        {/* Your rating */}
        <div style={ROW_BASE}>
          <div style={dotStyle(isRatingZero ? ZERO_TEXT : HOME_COLORS.rating)} />
          <span style={ROW_LABEL}>Your rating</span>
          <span style={valStyle(isRatingZero)}>{ratingDisplay}</span>
        </div>
      </div>

      <div style={{ padding: "10px 16px 14px", fontSize: 12, fontWeight: 600, color: INSIGHTS_ACCENT, textAlign: "center" }}>
        Tap to manage →
      </div>
    </section>
  );
}