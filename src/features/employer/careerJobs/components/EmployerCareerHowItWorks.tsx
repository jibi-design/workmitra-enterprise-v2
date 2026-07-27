// App name: Job Mitra
// File name: EmployerCareerHowItWorks.tsx

import { CAREER_HOME_HOW_IT_WORKS } from "../helpers/employerCareerHome.helpers";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

export function EmployerCareerHowItWorks() {
  return (
    <section
      className="wm-er-card wm-career-card"
      style={{
        padding: "var(--wm-card-padding)",
        display: "grid",
        gap: "var(--wm-space-14)",
      }}
    >
      <div>
        <div
          style={{ fontWeight: 800, fontSize: 16, color: CAREER_TEXT, letterSpacing: "-0.01em" }}
        >
          Career hiring flow
        </div>
        <div
          style={{
            marginTop: "var(--wm-space-4)",
            fontSize: 12.5,
            fontWeight: 500,
            color: CAREER_MUTED,
            lineHeight: 1.45,
          }}
        >
          Keep long-term hiring separate from Shift Jobs.
        </div>
      </div>

      <div style={{ display: "grid", gap: "var(--wm-space-10)" }}>
        {CAREER_HOME_HOW_IT_WORKS.map((step) => (
          <div
            key={step.n}
            style={{
              display: "grid",
              gridTemplateColumns: "30px 1fr",
              alignItems: "center",
              gap: "var(--wm-space-12)",
              padding: "var(--wm-card-padding-compact)",
              borderRadius: "var(--wm-radius-chip)",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.8)",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--wm-radius-10)",
                flexShrink: 0,
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                color: CAREER_BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12.5,
                fontWeight: 800,
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.9)",
              }}
            >
              {step.n}
            </div>

            <div style={{ fontSize: 13, color: CAREER_TEXT, fontWeight: 700, lineHeight: 1.4 }}>
              {step.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
