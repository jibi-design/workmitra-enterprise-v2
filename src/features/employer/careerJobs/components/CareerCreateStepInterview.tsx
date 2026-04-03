// src/features/employer/careerJobs/components/CareerCreateStepInterview.tsx
//
// Step 3 of Career Create wizard.
// Interview rounds configuration + final review preview.

import type {
  InterviewMode,
  InterviewRoundConfig,
  CareerJobType,
  CareerWorkMode,
  CareerSalaryPeriod,
} from "../types/careerTypes";

import type { StepBasicData } from "./CareerCreateStepBasic";
import type { StepRequirementsData } from "./CareerCreateStepRequirements";

/* ─────────────────────────────────────────────── */
/* Section Header                                  */
/* ─────────────────────────────────────────────── */

function SectionHead(props: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(55, 48, 163, 0.08)",
            color: "var(--wm-er-accent-career)",
            flexShrink: 0,
          }}
        >
          {props.icon}
        </div>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
          {props.title}
        </div>
      </div>
      {props.sub && (
        <div style={{ marginTop: 4, marginLeft: 42, fontSize: 12, color: "var(--wm-er-muted)" }}>
          {props.sub}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/* Icons                                           */
/* ─────────────────────────────────────────────── */

function IconInterview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    </svg>
  );
}

function IconReview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2ZM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
    </svg>
  );
}

function IconRemove() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13H5v-2h14v2Z" />
    </svg>
  );
}

function IconAdd() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────── */
/* Helpers                                         */
/* ─────────────────────────────────────────────── */

function interviewModeLabel(m: InterviewMode): string {
  if (m === "in-person") return "In-person";
  if (m === "phone") return "Phone";
  return "Video";
}

function jobTypeLabel(t: CareerJobType): string {
  if (t === "full-time") return "Full-time";
  if (t === "part-time") return "Part-time";
  return "Contract";
}

function workModeLabel(m: CareerWorkMode): string {
  if (m === "on-site") return "On-site";
  if (m === "remote") return "Remote";
  return "Hybrid";
}

function salaryPeriodLabel(p: CareerSalaryPeriod): string {
  return p === "monthly" ? "month" : "year";
}

function formatDate(epoch: number): string {
  try {
    return new Date(epoch).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function normalizeTagInput(raw: string, maxItems: number): string[] {
  return raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

/* ─────────────────────────────────────────────── */
/* Props                                           */
/* ─────────────────────────────────────────────── */

export type StepInterviewData = {
  roundConfigs: InterviewRoundConfig[];
};

type Props = {
  data: StepInterviewData;
  onChange: (updates: Partial<StepInterviewData>) => void;
  basicData: StepBasicData;
  reqData: StepRequirementsData;
};

/* ─────────────────────────────────────────────── */
/* Review Row                                      */
/* ─────────────────────────────────────────────── */

function ReviewRow(props: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        paddingTop: 8,
        paddingBottom: 8,
        borderBottom: "1px solid var(--wm-er-divider)",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", flexShrink: 0 }}>
        {props.label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: props.muted ? "var(--wm-er-muted)" : "var(--wm-er-text)",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {props.value || "—"}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/* Component                                       */
/* ─────────────────────────────────────────────── */

export function CareerCreateStepInterview({ data, onChange, basicData, reqData }: Props) {
  const rounds = data.roundConfigs;

  function addRound() {
    if (rounds.length >= 10) return;
    const next: InterviewRoundConfig = {
      round: rounds.length + 1,
      label: `Round ${rounds.length + 1}`,
      mode: "in-person",
    };
    onChange({ roundConfigs: [...rounds, next] });
  }

  function removeLastRound() {
    if (rounds.length <= 1) return;
    onChange({ roundConfigs: rounds.slice(0, -1) });
  }

  function updateRound(index: number, updates: Partial<InterviewRoundConfig>) {
    const next = rounds.map((r, i) =>
      i === index ? { ...r, ...updates } : r
    );
    onChange({ roundConfigs: next });
  }

  // Preview data
  const salaryMin = Number(reqData.salaryMin) || 0;
  const salaryMax = Number(reqData.salaryMax) || 0;
  const expMin = Number(reqData.experienceMin) || 0;
  const expMax = Number(reqData.experienceMax) || 0;
  const qualList = normalizeTagInput(reqData.qualifications, 15);
  const skillList = normalizeTagInput(reqData.skills, 20);
  const respList = normalizeTagInput(reqData.responsibilities, 15);

  return (
    <>
      {/* ── Interview Rounds ── */}
      <section className="wm-er-card">
        <SectionHead
          icon={<IconInterview />}
          title="Interview Setup"
          sub="Configure interview rounds for this position"
        />

        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            background: "rgba(55, 48, 163, 0.04)",
            border: "1px solid rgba(55, 48, 163, 0.12)",
            fontSize: 12,
            color: "var(--wm-er-muted)",
          }}
        >
          Each candidate will go through these rounds in order. You can schedule and track results for each round separately.
        </div>

        {rounds.map((round, idx) => (
          <div
            key={round.round}
            style={{
              padding: "12px 14px",
              borderRadius: "var(--wm-radius-10)",
              border: "1px solid var(--wm-er-border)",
              background: "#fafbfc",
              marginBottom: idx < rounds.length - 1 ? 8 : 0,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--wm-er-accent-career)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Round {round.round}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="wm-field">
                <div className="wm-label">Round Name</div>
                <input
                  className="wm-input"
                  value={round.label}
                  onChange={(e) => updateRound(idx, { label: e.target.value })}
                  placeholder={`e.g. Screening`}
                  maxLength={40}
                />
              </div>
              <div className="wm-field">
                <div className="wm-label">Interview Mode</div>
                <select
                  className="wm-input"
                  value={round.mode}
                  onChange={(e) => updateRound(idx, { mode: e.target.value as InterviewMode })}
                >
                  <option value="in-person">{interviewModeLabel("in-person")}</option>
                  <option value="phone">{interviewModeLabel("phone")}</option>
                  <option value="video">{interviewModeLabel("video")}</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={addRound}
            disabled={rounds.length >= 10}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}
          >
            <IconAdd /> Add Round
          </button>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={removeLastRound}
            disabled={rounds.length <= 1}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}
          >
            <IconRemove /> Remove Last
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 11, color: "var(--wm-er-muted)" }}>
          {rounds.length} {rounds.length === 1 ? "round" : "rounds"} configured (max 10)
        </div>
      </section>

      {/* ── Final Review ── */}
      <section className="wm-er-card" style={{ marginTop: 12 }}>
        <SectionHead
          icon={<IconReview />}
          title="Review Before Creating"
          sub="Verify all details are correct"
        />

        <div>
          <ReviewRow label="Company" value={basicData.companyName} />
          <ReviewRow label="Job Title" value={basicData.jobTitle} />
          <ReviewRow label="Department" value={basicData.department || "Not specified"} muted={!basicData.department} />
          <ReviewRow label="Job Type" value={jobTypeLabel(basicData.jobType)} />
          <ReviewRow label="Work Mode" value={workModeLabel(basicData.workMode)} />
          <ReviewRow label="Location" value={basicData.location} />
          <ReviewRow
            label="Salary"
            value={
              salaryMin > 0 || salaryMax > 0
                ? `${salaryMin} - ${salaryMax} / ${salaryPeriodLabel(reqData.salaryPeriod)}`
                : "Not specified"
            }
            muted={salaryMin === 0 && salaryMax === 0}
          />
          <ReviewRow
            label="Experience"
            value={
              expMin > 0 || expMax > 0
                ? `${expMin} - ${expMax} years`
                : "Fresher / Any"
            }
            muted={expMin === 0 && expMax === 0}
          />
          <ReviewRow
            label="Qualifications"
            value={qualList.length > 0 ? qualList.join(", ") : "None specified"}
            muted={qualList.length === 0}
          />
          <ReviewRow
            label="Skills"
            value={skillList.length > 0 ? skillList.join(", ") : "None specified"}
            muted={skillList.length === 0}
          />
          <ReviewRow
            label="Responsibilities"
            value={respList.length > 0 ? `${respList.length} items` : "None specified"}
            muted={respList.length === 0}
          />
          <ReviewRow label="Deadline" value={formatDate(reqData.closingDate)} />
          <ReviewRow
            label="Interview Rounds"
            value={rounds.map((r) => `${r.label} (${interviewModeLabel(r.mode)})`).join(" → ")}
          />
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            background: "rgba(22, 163, 74, 0.06)",
            border: "1px solid rgba(22, 163, 74, 0.15)",
            fontSize: 12,
            color: "var(--wm-er-text)",
          }}
        >
          <span style={{ fontWeight: 800 }}>Ready to post?</span>{" "}
          Once created, the job will be visible to applicants immediately if status is set to Active.
          You can pause or close it anytime from the dashboard.
        </div>
      </section>
    </>
  );
}