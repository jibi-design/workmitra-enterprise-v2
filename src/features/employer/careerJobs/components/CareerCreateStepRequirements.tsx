// src/features/employer/careerJobs/components/CareerCreateStepRequirements.tsx
//
// Step 2 of Career Create wizard.
// Salary, experience, qualifications, skills, description, responsibilities, closing date.

import { useMemo } from "react";

import type { CareerSalaryPeriod } from "../types/careerTypes";

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

function IconSalary() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4Z" />
    </svg>
  );
}

function IconRequirements() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM9.5 16.5 6 13l1.41-1.41L9.5 13.67l5.09-5.09L16 10l-6.5 6.5ZM13 9V3.5L18.5 9H13Z" />
    </svg>
  );
}

function IconDescription() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────── */
/* Helpers                                         */
/* ─────────────────────────────────────────────── */

function toDateStr(epoch: number): string {
  try {
    const d = new Date(epoch);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

function toEpoch(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    return Number.isFinite(d.getTime()) ? d.getTime() : Date.now();
  } catch {
    return Date.now();
  }
}

function todayStr(): string {
  return toDateStr(Date.now());
}

function normalizeTagInput(raw: string, maxItems: number): string[] {
  const items = raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => (x.length > 80 ? x.slice(0, 80) : x));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
    if (out.length >= maxItems) break;
  }
  return out;
}

/* ─────────────────────────────────────────────── */
/* Props                                           */
/* ─────────────────────────────────────────────── */

export type StepRequirementsData = {
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: CareerSalaryPeriod;
  experienceMin: string;
  experienceMax: string;
  qualifications: string;
  skills: string;
  description: string;
  responsibilities: string;
  closingDate: number;
};

type Props = {
  data: StepRequirementsData;
  onChange: (updates: Partial<StepRequirementsData>) => void;
};

/* ─────────────────────────────────────────────── */
/* Component                                       */
/* ─────────────────────────────────────────────── */

export function CareerCreateStepRequirements({ data, onChange }: Props) {
  const qualList = useMemo(
    () => normalizeTagInput(data.qualifications, 15),
    [data.qualifications]
  );
  const skillList = useMemo(
    () => normalizeTagInput(data.skills, 20),
    [data.skills]
  );
  const respList = useMemo(
    () => normalizeTagInput(data.responsibilities, 15),
    [data.responsibilities]
  );
  const descCharCount = data.description.length;

  return (
    <>
      {/* ── Compensation ── */}
      <section className="wm-er-card">
        <SectionHead
          icon={<IconSalary />}
          title="Compensation"
          sub="Salary range and payment period"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="wm-field">
            <div className="wm-label">
              Minimum Salary <span style={{ color: "var(--wm-error)" }}>*</span>
            </div>
            <input
              className="wm-input"
              value={data.salaryMin}
              onChange={(e) => onChange({ salaryMin: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="e.g. 30000"
              maxLength={10}
            />
          </div>
          <div className="wm-field">
            <div className="wm-label">
              Maximum Salary <span style={{ color: "var(--wm-error)" }}>*</span>
            </div>
            <input
              className="wm-input"
              value={data.salaryMax}
              onChange={(e) => onChange({ salaryMax: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="e.g. 50000"
              maxLength={10}
            />
          </div>
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <div className="wm-label">Payment Period</div>
          <select
            className="wm-input"
            value={data.salaryPeriod}
            onChange={(e) => onChange({ salaryPeriod: e.target.value as CareerSalaryPeriod })}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            background: "rgba(55, 48, 163, 0.04)",
            border: "1px solid rgba(55, 48, 163, 0.12)",
            fontSize: 12,
            color: "var(--wm-er-muted)",
          }}
        >
          Applicants will see the salary range. No currency symbol is shown — amounts are displayed as numbers only.
        </div>
      </section>

      {/* ── Experience & Qualifications ── */}
      <section className="wm-er-card" style={{ marginTop: 12 }}>
        <SectionHead
          icon={<IconRequirements />}
          title="Requirements"
          sub="Experience, qualifications, and skills needed"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="wm-field">
            <div className="wm-label">
              Min Experience (years) <span style={{ color: "var(--wm-error)" }}>*</span>
            </div>
            <input
              className="wm-input"
              value={data.experienceMin}
              onChange={(e) => onChange({ experienceMin: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="e.g. 0"
              maxLength={2}
            />
          </div>
          <div className="wm-field">
            <div className="wm-label">Max Experience (years)</div>
            <input
              className="wm-input"
              value={data.experienceMax}
              onChange={(e) => onChange({ experienceMax: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="e.g. 5"
              maxLength={2}
            />
          </div>
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <div className="wm-label">Qualifications (one per line)</div>
          <textarea
            className="wm-input"
            style={{ height: 80, paddingTop: 10, fontFamily: "inherit" }}
            value={data.qualifications}
            onChange={(e) => onChange({ qualifications: e.target.value })}
            placeholder={"e.g.\nBachelor's Degree\nRelevant certification"}
            maxLength={1000}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            {qualList.length} {qualList.length === 1 ? "item" : "items"} (max 15)
          </div>
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <div className="wm-label">Skills Required (one per line)</div>
          <textarea
            className="wm-input"
            style={{ height: 80, paddingTop: 10, fontFamily: "inherit" }}
            value={data.skills}
            onChange={(e) => onChange({ skills: e.target.value })}
            placeholder={"e.g.\nExcel\nProject Management\nCommunication"}
            maxLength={1500}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            {skillList.length} {skillList.length === 1 ? "item" : "items"} (max 20)
          </div>
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <div className="wm-label">Application Deadline</div>
          <input
            className="wm-input"
            type="date"
            value={toDateStr(data.closingDate)}
            min={todayStr()}
            onChange={(e) => onChange({ closingDate: toEpoch(e.target.value) })}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            Applications will not be accepted after this date.
          </div>
        </div>
      </section>

      {/* ── Description & Responsibilities ── */}
      <section className="wm-er-card" style={{ marginTop: 12 }}>
        <SectionHead
          icon={<IconDescription />}
          title="Job Description"
          sub="Describe the role and key responsibilities"
        />

        <div className="wm-field">
          <div className="wm-label">Description</div>
          <textarea
            className="wm-input"
            style={{ height: 100, paddingTop: 10, fontFamily: "inherit" }}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe the role, team, day-to-day work, growth opportunities..."
            maxLength={2000}
          />
          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              fontWeight: 600,
              marginTop: 3,
              color: descCharCount > 1800 ? "var(--wm-warning)" : "var(--wm-er-muted)",
            }}
          >
            {descCharCount}/2000
          </div>
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <div className="wm-label">Key Responsibilities (one per line)</div>
          <textarea
            className="wm-input"
            style={{ height: 100, paddingTop: 10, fontFamily: "inherit" }}
            value={data.responsibilities}
            onChange={(e) => onChange({ responsibilities: e.target.value })}
            placeholder={"e.g.\nManage daily reports\nCoordinate with team leads\nPrepare monthly presentations"}
            maxLength={2000}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            {respList.length} {respList.length === 1 ? "item" : "items"} (max 15)
          </div>
        </div>
      </section>
    </>
  );
}