// App name: Job Mitra
// File name: EmploymentHeroCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\EmploymentHeroCard.tsx

import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { statusMeta } from "../helpers/employmentDetailHelpers";

const CONSOLE_BLUE = "var(--wm-er-accent-console, #0369a1)";
const CONSOLE_BLUE_DEEP = "#075985";
const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";

function IconBriefcase() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z"
      />
    </svg>
  );
}

type Props = {
  record: EmploymentRecord;
};

export function EmploymentHeroCard({ record }: Props) {
  const sm = statusMeta(record.status);

  return (
    <div
      className="wm-ee-card"
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(3,105,161,0.2)",
        borderRadius: 26,
        padding: "18px 17px",
        background:
          "radial-gradient(circle at 94% 0%, rgba(3,105,161,0.18), transparent 36%), linear-gradient(135deg, rgba(255,255,255,1), rgba(240,249,255,0.94))",
        boxShadow: "0 18px 38px rgba(15,23,42,0.095)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: CONSOLE_BLUE,
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 15, paddingLeft: 5 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(3,105,161,0.09)",
            color: CONSOLE_BLUE,
            border: "1px solid rgba(3,105,161,0.16)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 12px 24px rgba(3,105,161,0.1)",
            flexShrink: 0,
          }}
        >
          <IconBriefcase />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: "fit-content",
              maxWidth: "100%",
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(3,105,161,0.085)",
              border: "1px solid rgba(3,105,161,0.14)",
              color: CONSOLE_BLUE_DEEP,
              fontSize: 10,
              fontWeight: 950,
              letterSpacing: 0.55,
              textTransform: "uppercase",
            }}
          >
            Employment Record
          </div>

          <div
            style={{ marginTop: 9, fontWeight: 1000, fontSize: 19, color: TEXT, lineHeight: 1.18 }}
          >
            {record.jobTitle}
          </div>

          <div
            style={{ fontWeight: 780, fontSize: 12.8, color: MUTED, marginTop: 5, lineHeight: 1.4 }}
          >
            {record.companyName}
            {record.department ? ` - ${record.department}` : ""}
          </div>

          <div
            style={{
              marginTop: 11,
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
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(3,105,161,0.08)",
                color: CONSOLE_BLUE_DEEP,
                border: "1px solid rgba(3,105,161,0.16)",
              }}
            >
              {sm.label}
            </span>

            {record.verified && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 950,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(3,105,161,0.07)",
                  color: CONSOLE_BLUE_DEEP,
                  border: "1px solid rgba(3,105,161,0.14)",
                }}
              >
                Verified
              </span>
            )}

            {record.hireMethod === "via_app" && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 950,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(29,78,216,0.07)",
                  color: "#1e40af",
                  border: "1px solid rgba(29,78,216,0.14)",
                }}
              >
                Via App
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
