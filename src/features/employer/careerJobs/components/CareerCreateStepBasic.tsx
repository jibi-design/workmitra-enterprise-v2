// App name: Job Mitra
// File name: CareerCreateStepBasic.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateStepBasic.tsx

import type { CSSProperties, ReactNode } from "react";
import type { CareerJobType, CareerWorkMode } from "../types/careerTypes";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

function SectionHead({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            color: CAREER_BLUE,
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 4px 10px rgba(37,99,235,0.06), inset 0 1px 2px rgba(255,255,255,0.9)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 15.5,
              color: CAREER_TEXT,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
          {sub && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12.5,
                color: CAREER_MUTED,
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PremiumCard({ children, marginTop }: { children: ReactNode; marginTop?: number }) {
  return (
    <section
      style={{
        marginTop: marginTop ?? 0,
        padding: 20,
        borderRadius: 24,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
        boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
      }}
    >
      {children}
    </section>
  );
}

// ULTRA PREMIUM INPUT STYLE
const PREMIUM_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "rgba(255, 255, 255, 0.8)",
  padding: "0 14px",
  color: CAREER_TEXT,
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
  outline: "none",
  transition: "all var(--wm-motion-fast) var(--wm-motion-spring)",
};

const PREMIUM_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: CAREER_MUTED,
  marginBottom: 6,
  display: "block",
};

function removeAutocompleteDuplicate(previousValue: string, nextValue: string): string {
  const previous = previousValue.trim();
  const next = nextValue.trim();
  if (previous.length < 2 || next.length <= previous.length) return nextValue;
  const previousLower = previous.toLowerCase();
  const nextLower = next.toLowerCase();
  if (!nextLower.startsWith(previousLower)) return nextValue;
  const appended = next.slice(previous.length);
  const appendedLower = appended.toLowerCase();
  if (appendedLower.startsWith(previousLower)) return appended;
  return nextValue;
}

function normalizeTextInput(previousValue: string, nextValue: string): string {
  return capitalizeFirstLetter(removeAutocompleteDuplicate(previousValue, nextValue));
}

function capitalizeFirstLetter(value: string): string {
  const firstLetterIndex = value.search(/[A-Za-z]/);
  if (firstLetterIndex === -1) return value;
  return `${value.slice(0, firstLetterIndex)}${value.charAt(firstLetterIndex).toUpperCase()}${value.slice(
    firstLetterIndex + 1,
  )}`;
}

function IconBriefcase() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

function IconLocation() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

export type StepBasicData = {
  companyName: string;
  jobTitle: string;
  department: string;
  jobType: CareerJobType;
  workMode: CareerWorkMode;
  location: string;
  vacancies: string; // NEW FIELD ADDED
  probationPeriod: string; // NEW FIELD ADDED
};

type Props = {
  data: StepBasicData;
  onChange: (updates: Partial<StepBasicData>) => void;
};

function jobTypeLabel(type: CareerJobType): string {
  if (type === "full-time") return "Full-time";
  if (type === "part-time") return "Part-time";
  return "Contract";
}

function workModeLabel(mode: CareerWorkMode): string {
  if (mode === "on-site") return "On-site";
  if (mode === "remote") return "Remote";
  return "Hybrid";
}

export function CareerCreateStepBasic({ data, onChange }: Props) {
  return (
    <>
      <PremiumCard>
        <SectionHead
          icon={<IconBriefcase />}
          title="Job details"
          sub="Basic information about the position."
        />

        <div style={{ marginBottom: 16 }}>
          <label style={PREMIUM_LABEL_STYLE}>
            Company Name <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            style={PREMIUM_INPUT_STYLE}
            value={data.companyName}
            onChange={(event) =>
              onChange({ companyName: normalizeTextInput(data.companyName, event.target.value) })
            }
            placeholder="e.g. Greenfield Corp"
            maxLength={100}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={PREMIUM_LABEL_STYLE}>
            Job Title <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            style={PREMIUM_INPUT_STYLE}
            value={data.jobTitle}
            onChange={(event) =>
              onChange({ jobTitle: normalizeTextInput(data.jobTitle, event.target.value) })
            }
            placeholder="e.g. Senior Accountant, Marketing Executive"
            maxLength={100}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={PREMIUM_LABEL_STYLE}>Department</label>
          <input
            style={PREMIUM_INPUT_STYLE}
            value={data.department}
            onChange={(event) =>
              onChange({ department: normalizeTextInput(data.department, event.target.value) })
            }
            placeholder="e.g. Finance, Marketing, Operations"
            maxLength={60}
            list="wm-dept-suggestions"
            autoComplete="off"
            spellCheck={false}
          />
          <datalist id="wm-dept-suggestions">
            <option value="Finance" />
            <option value="Marketing" />
            <option value="Operations" />
            <option value="Human Resources" />
            <option value="Sales" />
            <option value="Engineering" />
          </datalist>
        </div>

        {/* ROW 1: Job Type & Vacancies */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={PREMIUM_LABEL_STYLE}>
              Job Type <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              style={PREMIUM_INPUT_STYLE}
              value={data.jobType}
              onChange={(event) => onChange({ jobType: event.target.value as CareerJobType })}
            >
              <option value="full-time">{jobTypeLabel("full-time")}</option>
              <option value="part-time">{jobTypeLabel("part-time")}</option>
              <option value="contract">{jobTypeLabel("contract")}</option>
            </select>
          </div>

          <div>
            <label style={PREMIUM_LABEL_STYLE}>
              No. of Vacancies <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              style={PREMIUM_INPUT_STYLE}
              type="number"
              min="1"
              max="500"
              step="1"
              inputMode="numeric"
              value={data.vacancies}
              onChange={(event) => onChange({ vacancies: event.target.value })}
              placeholder="e.g. 1, 5, 10"
            />
          </div>
        </div>

        {/* ROW 2: Work Mode & Probation Period */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={PREMIUM_LABEL_STYLE}>
              Work Mode <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              style={PREMIUM_INPUT_STYLE}
              value={data.workMode}
              onChange={(event) => {
                const newMode = event.target.value as CareerWorkMode;
                onChange({
                  workMode: newMode,
                  location: newMode === "remote" ? "" : data.location,
                });
              }}
            >
              <option value="on-site">{workModeLabel("on-site")}</option>
              <option value="remote">{workModeLabel("remote")}</option>
              <option value="hybrid">{workModeLabel("hybrid")}</option>
            </select>
          </div>

          <div>
            <label style={PREMIUM_LABEL_STYLE}>Probation Period</label>
            <select
              style={PREMIUM_INPUT_STYLE}
              value={data.probationPeriod}
              onChange={(event) => onChange({ probationPeriod: event.target.value })}
            >
              <option value="none">No Probation</option>
              <option value="1_month">1 Month</option>
              <option value="3_months">3 Months</option>
              <option value="6_months">6 Months</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      <PremiumCard marginTop={16}>
        <SectionHead
          icon={<IconLocation />}
          title="Work location"
          sub="Where the employee will be based."
        />

        <div>
          <label style={PREMIUM_LABEL_STYLE}>
            Work City {data.workMode !== "remote" && <span style={{ color: "#dc2626" }}>*</span>}
          </label>
          <input
            style={PREMIUM_INPUT_STYLE}
            value={data.workMode === "remote" ? "Remote / Anywhere" : data.location}
            onChange={(event) =>
              onChange({ location: normalizeTextInput(data.location, event.target.value) })
            }
            placeholder="e.g. Berlin, London, New York"
            maxLength={100}
            disabled={data.workMode === "remote"}
            autoComplete="off"
            spellCheck={false}
          />
          <div
            style={{
              marginTop: 6,
              fontSize: 11.5,
              color: CAREER_MUTED,
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {data.workMode === "remote"
              ? "Location is optional for remote work mode."
              : "Enter the city or area where the office is located."}
          </div>
        </div>
      </PremiumCard>
    </>
  );
}
