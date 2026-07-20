// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffHeroCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffHeroCard.tsx

import type { StatusMeta } from "../../helpers/staffDetailHelpers";
import type { StaffRecord } from "../../storage/myStaff.storage";
import { IconPerson } from "../staffDetailComponents";

type HeroCardProps = {
  record: StaffRecord;
  sm: StatusMeta;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export function HeroCard({ record, sm }: HeroCardProps) {
  const statusColor = record.status === "exited" ? "#64748b" : CAREER_BLUE_DEEP;
  const departmentLabel = record.departmentName || record.category || "";

  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div
        className="wm-er-card"
        style={{
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(29,78,216,0.20)",
          borderRadius: 28,
          padding: 17,
          background:
            "radial-gradient(circle at 92% 4%, rgba(29,78,216,0.16), transparent 33%), linear-gradient(135deg, rgba(255,255,255,1), rgba(239,246,255,0.92))",
          boxShadow: "0 22px 48px rgba(15,23,42,0.11)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -48,
            top: -52,
            width: 138,
            height: 138,
            borderRadius: "50%",
            background: "rgba(29,78,216,0.08)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(180deg, rgba(29,78,216,0.16), rgba(30,58,138,0.07))",
              color: CAREER_BLUE,
              border: "1px solid rgba(29,78,216,0.18)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.84), 0 14px 28px rgba(29,78,216,0.12)",
              flexShrink: 0,
            }}
          >
            <IconPerson />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: "fit-content",
                maxWidth: "100%",
                padding: "4px 9px",
                borderRadius: 999,
                background: "rgba(29,78,216,0.09)",
                border: "1px solid rgba(29,78,216,0.14)",
                color: CAREER_BLUE_DEEP,
                fontSize: 9.5,
                fontWeight: 950,
                letterSpacing: 0.55,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Career Employment Workspace
            </div>

            <div
              style={{
                marginTop: 8,
                fontWeight: 1000,
                fontSize: 19,
                color: CAREER_TEXT,
                lineHeight: 1.15,
              }}
            >
              {record.employeeName}
            </div>

            <div
              style={{
                fontWeight: 780,
                fontSize: 12.5,
                color: CAREER_MUTED,
                marginTop: 4,
                lineHeight: 1.35,
              }}
            >
              {record.jobTitle}
              {departmentLabel ? ` - ${departmentLabel}` : ""}
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 7,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 950,
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: "rgba(29,78,216,0.09)",
                  color: statusColor,
                  border: "1px solid rgba(29,78,216,0.16)",
                  whiteSpace: "nowrap",
                }}
              >
                {sm.label}
              </span>

              {record.departmentName && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 950,
                    padding: "4px 9px",
                    borderRadius: 999,
                    background: "rgba(29,78,216,0.075)",
                    color: CAREER_BLUE_DEEP,
                    border: "1px solid rgba(29,78,216,0.14)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {record.departmentName}
                </span>
              )}

              {record.addMethod === "via_app" && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 950,
                    padding: "4px 9px",
                    borderRadius: 999,
                    background: "rgba(55,48,163,0.075)",
                    color: CAREER_BLUE_DEEP,
                    border: "1px solid rgba(55,48,163,0.16)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Via App
                </span>
              )}

              {record.employeeConfirmed && record.status !== "joining_pending" && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 950,
                    padding: "4px 9px",
                    borderRadius: 999,
                    background: "rgba(29,78,216,0.075)",
                    color: CAREER_BLUE_DEEP,
                    border: "1px solid rgba(29,78,216,0.14)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Joined Confirmed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
