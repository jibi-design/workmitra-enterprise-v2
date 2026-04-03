// src/features/employer/careerJobs/components/CareerCreateStepBasic.tsx
//
// Step 1 of Career Create wizard.
// Company, Job Title, Department, Job Type, Work Mode, Location.

import type {
  CareerJobType,
  CareerWorkMode,
} from "../types/careerTypes";

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

function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2Zm-6 0h-4V4h4v2Z" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────── */
/* Props                                           */
/* ─────────────────────────────────────────────── */

export type StepBasicData = {
  companyName: string;
  jobTitle: string;
  department: string;
  jobType: CareerJobType;
  workMode: CareerWorkMode;
  location: string;
};

type Props = {
  data: StepBasicData;
  onChange: (updates: Partial<StepBasicData>) => void;
};

/* ─────────────────────────────────────────────── */
/* Helpers                                         */
/* ─────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────── */
/* Component                                       */
/* ─────────────────────────────────────────────── */

export function CareerCreateStepBasic({ data, onChange }: Props) {
  return (
    <>
      {/* ── Job Details ── */}
      <section className="wm-er-card">
        <SectionHead
          icon={<IconBriefcase />}
          title="Job Details"
          sub="Basic information about the position"
        />

        <div className="wm-field">
          <div className="wm-label">
            Company / Business Name <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="e.g. Greenfield Corp"
            maxLength={100}
          />
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <div className="wm-label">
            Job Title <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            value={data.jobTitle}
            onChange={(e) => onChange({ jobTitle: e.target.value })}
            placeholder="e.g. Senior Accountant, Marketing Executive"
            maxLength={100}
          />
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <div className="wm-label">Department</div>
          <input
            className="wm-input"
            value={data.department}
            onChange={(e) => onChange({ department: e.target.value })}
            placeholder="e.g. Finance, Marketing, Operations"
            maxLength={60}
            list="wm-dept-suggestions"
          />
          <datalist id="wm-dept-suggestions">
            <option value="Finance" />
            <option value="Marketing" />
            <option value="Operations" />
            <option value="Human Resources" />
            <option value="Sales" />
            <option value="Engineering" />
            <option value="Customer Support" />
            <option value="Administration" />
            <option value="Logistics" />
            <option value="Production" />
          </datalist>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <div className="wm-field">
            <div className="wm-label">Job Type <span style={{ color: "var(--wm-error)" }}>*</span></div>
            <select
              className="wm-input"
              value={data.jobType}
              onChange={(e) => onChange({ jobType: e.target.value as CareerJobType })}
            >
              <option value="full-time">{jobTypeLabel("full-time")}</option>
              <option value="part-time">{jobTypeLabel("part-time")}</option>
              <option value="contract">{jobTypeLabel("contract")}</option>
            </select>
          </div>
          <div className="wm-field">
            <div className="wm-label">Work Mode <span style={{ color: "var(--wm-error)" }}>*</span></div>
            <select
              className="wm-input"
              value={data.workMode}
              onChange={(e) => onChange({ workMode: e.target.value as CareerWorkMode })}
            >
              <option value="on-site">{workModeLabel("on-site")}</option>
              <option value="remote">{workModeLabel("remote")}</option>
              <option value="hybrid">{workModeLabel("hybrid")}</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="wm-er-card" style={{ marginTop: 12 }}>
        <SectionHead
          icon={<IconLocation />}
          title="Work Location"
          sub="Where will the employee be based"
        />

        <div className="wm-field">
          <div className="wm-label">
            City / Location <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g. Berlin, London, New York"
            maxLength={100}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            For remote positions, enter the company headquarters or "Remote".
          </div>
        </div>
      </section>
    </>
  );
}