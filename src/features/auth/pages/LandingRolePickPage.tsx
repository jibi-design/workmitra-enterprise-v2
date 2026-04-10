/** Job Mitra | LandingRolePickPage.tsx | C:\projects\WorkMitra_Enterprise_v2\src\features\auth\pages\LandingRolePickPage.tsx */
import type { CSSProperties, ReactElement, KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { roleStorage, type AppRole } from "../../../app/storage/roleStorage";

/* ------------------------------------------------ */
/* Brand Logo (temporary code-based, no image file) */
/* ------------------------------------------------ */
function JobMitraLogo(props: { size?: "large" | "small" }) {
  const isLarge = props.size === "large";
  const iconSize = isLarge ? 50 : 24;
  const textSize = isLarge ? 34 : 16;
  const gap = isLarge ? 14 : 6;

  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" aria-hidden="true">
        <rect x="4" y="4" width="40" height="40" rx="14" fill="#07153d" />
        <rect x="5.5" y="5.5" width="37" height="37" rx="12.5" fill="none" stroke="#334a84" strokeWidth="1.5" />

        <path d="M13 16.5L21 36" fill="none" stroke="#3454d1" strokeWidth="7.2" strokeLinecap="round" />
        <path d="M34.5 16.5L26.2 36" fill="none" stroke="#39a844" strokeWidth="7.2" strokeLinecap="round" />
        <path
          d="M21.5 20.5L26.2 36L31.1 20.8"
          fill="none"
          stroke="#39a844"
          strokeWidth="7.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path d="M24 10.5L28.8 17.6L24 24.6L19.2 17.6Z" fill="#b56508" />
        <circle cx="24" cy="17.6" r="1.9" fill="#f8fafc" />

        <path
          d="M16.5 38.3C18.8 40 21.3 41 24 41C26.7 41 29.2 40 31.5 38.3"
          fill="none"
          stroke="#6b7898"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: -0.8,
          }}
        >
          Job
        </span>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 700,
            color: "#1d4ed8",
            letterSpacing: -0.8,
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
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5Z" />
    </svg>
  );
}

function RoleIconEmployer(): ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 21V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12H3Zm2-2h14V9H5v10Zm3-12V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h-2V5h-4v2H8Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function onCardKeyDown(e: KeyboardEvent<HTMLButtonElement>, action: () => void) {
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

const SUPPORT_EMAIL = "support@mitralabs.app";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function LandingRolePickPage() {
  const nav = useNavigate();
  const storedRole = roleStorage.get();
  const [existing, setExisting] = useState<AppRole | null>(storedRole);
  const [selectedRole, setSelectedRole] = useState<AppRole>(storedRole ?? "employee");
  const isNavigatingRef = useRef(false);

  const roleCards: RoleCard[] = useMemo(
    () => [
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
    ],
    [],
  );

  function goTo(role: AppRole) {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    roleStorage.set(role);
    setExisting(role);
    nav(routeForRole(role), { replace: true });
    queueMicrotask(() => {
      isNavigatingRef.current = false;
    });
  }

  const selectedCard = roleCards.find((card) => card.role === selectedRole) ?? roleCards[0];

  return (
    <div
      className="wm-container"
      style={{
        minHeight: "100vh",
        paddingTop: 16,
        paddingBottom: 16,
        background:
          "radial-gradient(circle at top, rgba(219, 234, 254, 0.65) 0%, rgba(255, 255, 255, 0.96) 14%, #f8fafc 52%)",
      }}
    >
      <div
        style={{
          width: "min(100%, 760px)",
          minHeight: "calc(100vh - 32px)",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 38px",
              borderRadius: 24,
              background: "rgba(255, 255, 255, 0.98)",
              boxShadow: "0 14px 34px rgba(15, 23, 42, 0.10), 0 3px 10px rgba(15, 23, 42, 0.05)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            <JobMitraLogo size="large" />
          </div>

          <h1
            style={{
              maxWidth: 460,
              marginTop: 14,
              fontSize: "clamp(1.55rem, 3vw, 1.95rem)",
              fontWeight: 700,
              color: "var(--wm-er-text)",
              lineHeight: 1.16,
              letterSpacing: "-0.02em",
            }}
          >
            Choose your workspace
          </h1>

          <p
            style={{
              maxWidth: 450,
              fontSize: 14,
              color: "var(--wm-er-muted)",
              lineHeight: 1.55,
            }}
          >
            Select the workspace that matches how you use the platform today.
          </p>
        </div>

        {existing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid var(--wm-er-divider)",
              background: "rgba(255, 255, 255, 0.96)",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
          >
            <button className="wm-primarybtn" type="button" onClick={() => goTo(existing)}>
              Continue previous workspace
            </button>
            <button
              type="button"
              onClick={() => {
                roleStorage.clear();
                setExisting(null);
              }}
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
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "var(--wm-er-muted)",
                fontWeight: 700,
              }}
            >
              Current workspace: {existing}
            </span>
          </div>
        )}

        <section
          aria-labelledby="role-heading"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 18,
            borderRadius: 26,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            background: "rgba(255, 255, 255, 0.96)",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Get started
            </div>
            <h2
              id="role-heading"
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--wm-er-text)",
                letterSpacing: "-0.02em",
              }}
            >
              I am a...
            </h2>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {roleCards.map(({ role, title, desc, accent, Icon }) => {
              const isSelected = selectedRole === role;

              const cardStyle: CSSProperties = {
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                gap: 10,
                width: "100%",
                minHeight: 148,
                padding: "22px 16px 18px",
                borderRadius: 20,
                border: isSelected ? `1px solid ${accent}66` : "1px solid rgba(15, 23, 42, 0.08)",
                background: isSelected
                  ? `linear-gradient(180deg, ${accent}12 0%, rgba(255,255,255,1) 100%)`
                  : "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,250,251,0.96) 100%)",
                boxShadow: isSelected
                  ? `0 0 0 3px ${accent}18, 0 14px 28px rgba(15, 23, 42, 0.08)`
                  : "0 3px 10px rgba(15, 23, 42, 0.04)",
                cursor: "pointer",
              };

              const iconWrapStyle: CSSProperties = {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 58,
                height: 58,
                borderRadius: 999,
                background: `${accent}16`,
                color: accent,
                flexShrink: 0,
              };

              const badgeStyle: CSSProperties = {
                position: "absolute",
                top: 10,
                right: 10,
                padding: "3px 8px",
                borderRadius: 999,
                background: accent,
                color: "#ffffff",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              };

              return (
                <button
                  key={role}
                  type="button"
                  style={cardStyle}
                  onClick={() => setSelectedRole(role)}
                  onKeyDown={(e) => onCardKeyDown(e, () => setSelectedRole(role))}
                  aria-pressed={isSelected}
                >
                  {isSelected ? <span style={badgeStyle}>Selected</span> : null}

                  <span style={iconWrapStyle} aria-hidden="true">
                    <Icon />
                  </span>

                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--wm-er-text)",
                      lineHeight: 1.35,
                    }}
                  >
                    {title}
                  </span>

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--wm-er-muted)",
                      lineHeight: 1.58,
                    }}
                  >
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          className="wm-primarybtn"
          onClick={() => goTo(selectedRole)}
          style={{
            width: "100%",
            minHeight: 56,
            borderRadius: 18,
            fontSize: 17,
            fontWeight: 700,
            boxShadow: "0 14px 28px rgba(29, 78, 216, 0.18), 0 6px 16px rgba(15, 23, 42, 0.08)",
          }}
        >
          Continue as {selectedCard.title}
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 4,
            color: "var(--wm-er-muted)",
          }}
        >
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{ padding: "10px 8px", fontSize: 12, color: "var(--wm-er-muted)" }}
          >
            Support
          </a>
          <span style={{ opacity: 0.55, fontSize: 12, lineHeight: "36px" }}>{"\u00B7"}</span>
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer"
            style={{ padding: "10px 8px", fontSize: 12, color: "var(--wm-er-muted)" }}
          >
            Privacy
          </a>
          <span style={{ opacity: 0.55, fontSize: 12, lineHeight: "36px" }}>{"\u00B7"}</span>
          <span style={{ padding: "10px 8px", fontSize: 12, color: "var(--wm-er-muted)" }}>
            English
          </span>
        </div>
      </div>
    </div>
  );
}