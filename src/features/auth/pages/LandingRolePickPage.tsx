// src/features/auth/pages/LandingRolePickPage.tsx
import type { CSSProperties, ReactElement, KeyboardEvent, MouseEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { roleStorage, type AppRole } from "../../../app/storage/roleStorage";

/* ------------------------------------------------ */
/* Brand Logo (code-based, no image files)          */
/* ------------------------------------------------ */
function WorkMitraLogo(props: { size?: "large" | "small" }) {
  const isLarge = props.size === "large";
  const iconH = isLarge ? 40 : 24;
  const textSize = isLarge ? 26 : 16;
  const gap = isLarge ? 10 : 6;

  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {/* Three-person icon mark */}
      <svg width={iconH} height={iconH} viewBox="0 0 48 48" aria-hidden="true">
        {/* Left figure (green) */}
        <circle cx="14" cy="14" r="5" fill="#16a34a" />
        <path d="M6 34c0-5 4-8 8-8s8 3 8 8" fill="#16a34a" opacity="0.85" />
        {/* Center figure (blue) */}
        <circle cx="24" cy="11" r="5.5" fill="#2563eb" />
        <path d="M15 32c0-5.5 4-9 9-9s9 3.5 9 9" fill="#2563eb" opacity="0.85" />
        {/* Right figure (amber) */}
        <circle cx="34" cy="14" r="5" fill="#d97706" />
        <path d="M26 34c0-5 4-8 8-8s8 3 8 8" fill="#d97706" opacity="0.85" />
      </svg>

      {/* Brand name */}
      <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 900,
            color: "#166534",
            letterSpacing: -0.5,
          }}
        >
          Work
        </span>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 900,
            color: "#d97706",
            letterSpacing: -0.5,
          }}
        >
          Mitra
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* SVG Icons                                        */
/* ------------------------------------------------ */
function RoleIconEmployee(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5Z" />
    </svg>
  );
}

function RoleIconEmployer(): ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 21V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12H3Zm2-2h14V9H5v10Zm3-12V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h-2V5h-4v2H8Z" />
    </svg>
  );
}



/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function onCardKeyDown(e: KeyboardEvent<HTMLDivElement>, action: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    action();
  }
}

function routeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

type RoleCard = {
  role: AppRole;
  title: string;
  desc: string;
  accent: string;
  Icon: () => ReactElement;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function LandingRolePickPage() {
  const nav = useNavigate();
  const [existing, setExisting] = useState<AppRole | null>(() => roleStorage.get());
  const isNavigatingRef = useRef(false);

  const roleCards: RoleCard[] = useMemo(() => [
    {
      role: "employee" as const,
      title: "Employee",
      desc: "Find shifts, apply jobs, and track work.",
      accent: "#0284c7",
      Icon: RoleIconEmployee,
    },
    {
      role: "employer" as const,
      title: "Employer",
      desc: "Post jobs, manage hiring, and workforce ops.",
      accent: "#7c3aed",
      Icon: RoleIconEmployer,
    },
    /* Admin hidden — internal only, not for public launch */
  ], []);

  function goTo(role: AppRole) {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    roleStorage.set(role);
    setExisting(role);
    nav(routeForRole(role), { replace: true });
    queueMicrotask(() => { isNavigatingRef.current = false; });
  }

  function onOpenButtonClick(e: MouseEvent, role: AppRole) {
    e.stopPropagation();
    e.preventDefault();
    goTo(role);
  }

  return (
    <div className="wm-container" style={{ paddingTop: 32 }}>
      {/* ============================================= */}
      {/* Brand Logo (signboard feel, code-based)       */}
      {/* ============================================= */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 28px",
            borderRadius: 20,
            background: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 4px 24px rgba(22, 101, 52, 0.08), 0 0 40px rgba(22, 101, 52, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(22, 101, 52, 0.06)",
          }}
        >
          <WorkMitraLogo size="large" />
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
            Choose your workspace
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
            Workspaces are isolated and access-controlled.
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* Continue session                              */}
      {/* ============================================= */}
      {existing && (
        <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <button className="wm-primarybtn" type="button" onClick={() => goTo(existing)}>
            Continue
          </button>
          <button
            type="button"
            onClick={() => { roleStorage.clear(); setExisting(null); }}
            style={{
              border: 0,
              background: "transparent",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--wm-er-muted)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Clear
          </button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 800 }}>
            Current: {existing}
          </span>
        </div>
      )}

      {/* ============================================= */}
      {/* Role Cards                                    */}
      {/* ============================================= */}
      <div style={{ display: "grid", gap: 12 }}>
        {roleCards.map(({ role, title, desc, accent, Icon }) => {
          const cardStyle: CSSProperties = {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "16px 16px",
            borderRadius: 16,
            border: "1px solid var(--wm-er-divider)",
            background: "#fff",
            borderLeft: `4px solid ${accent}`,
            cursor: "pointer",
          };

          const iconWrapStyle: CSSProperties = {
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}18`,
            color: accent,
            flexShrink: 0,
          };

          const btnStyle: CSSProperties = {
            height: 36,
            padding: "0 18px",
            borderRadius: 10,
            border: "none",
            background: accent,
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          };

          return (
            <div
              key={role}
              style={cardStyle}
              role="button"
              tabIndex={0}
              onClick={() => goTo(role)}
              onKeyDown={(e) => onCardKeyDown(e, () => goTo(role))}
              aria-label={`Open ${title}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={iconWrapStyle} aria-hidden="true">
                  <Icon />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>{desc}</div>
                </div>
              </div>
              <button style={btnStyle} type="button" onClick={(e) => onOpenButtonClick(e, role)}>
                Open
              </button>
            </div>
          );
        })}
      </div>

      {/* ============================================= */}
      {/* Footer                                        */}
      {/* ============================================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginTop: 22,
          color: "var(--wm-er-muted)",
        }}
      >
        <a href="#" style={{ padding: "10px 8px", fontSize: 12, color: "var(--wm-er-muted)" }} onClick={(e) => e.preventDefault()}>
          Support
        </a>
        <span style={{ opacity: 0.55, fontSize: 12, lineHeight: "36px" }}>{"\u00B7"}</span>
        <a href="#" style={{ padding: "10px 8px", fontSize: 12, color: "var(--wm-er-muted)" }} onClick={(e) => e.preventDefault()}>
          Privacy
        </a>
        <span style={{ opacity: 0.55, fontSize: 12, lineHeight: "36px" }}>{"\u00B7"}</span>
        <a href="#" style={{ padding: "10px 8px", fontSize: 12, color: "var(--wm-er-muted)" }} onClick={(e) => e.preventDefault()}>
          Language
        </a>
      </div>
    </div>
  );
}
