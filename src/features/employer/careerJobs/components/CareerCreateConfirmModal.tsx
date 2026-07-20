// App name: Job Mitra
// File name: CareerCreateConfirmModal.tsx
// Employee-facing preview before publishing a Career Job post.

import type { CSSProperties } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { CareerDuplicateWarning } from "../helpers/careerCreateHelpers";
import {
  formatCareerJobType,
  formatCareerSalaryDisplay,
  formatCareerWorkMode,
} from "../helpers/careerCreateHelpers";
import type { CareerSalaryPeriod, CareerWorkMode } from "../types/careerTypes";

type Props = {
  open: boolean;
  jobTitle: string;
  companyName: string;
  department: string;
  jobType: string;
  workMode: CareerWorkMode;
  location: string;
  vacancies: number;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: CareerSalaryPeriod;
  noticePeriodText: string;
  interviewRounds: number;
  skillsCount: number;
  qualificationsCount: number;
  responsibilitiesCount: number;
  screeningQuestionCount: number;
  duplicateWarnings: CareerDuplicateWarning[];
  onConfirm: () => void;
  onCancel: () => void;
};

function cap(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const CAREER_BLUE = "#2563eb";

const ICON_WRAP: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(37,99,235,0.1)",
  color: CAREER_BLUE,
  flexShrink: 0,
};

const SUMMARY_CARD: CSSProperties = {
  marginTop: 16,
  background: "linear-gradient(180deg, rgba(239,246,255,0.78), rgba(255,255,255,0.98))",
  border: "1px solid rgba(37,99,235,0.18)",
  borderRadius: 16,
  padding: 14,
};

const DETAIL_GRID: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const DETAIL_BOX: CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(226,232,240,0.95)",
  background: "#fff",
  padding: "10px 12px",
};

const DETAIL_LABEL: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  color: "var(--wm-er-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.45,
};

const DETAIL_VALUE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  lineHeight: 1.35,
};

const WARNING_BOX: CSSProperties = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(217,119,6,0.07)",
  border: "1px solid rgba(217,119,6,0.2)",
};

const DUPLICATE_BOX: CSSProperties = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(220,38,38,0.06)",
  border: "1px solid rgba(220,38,38,0.22)",
};

const BTN_ROW: CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const BTN_BASE: CSSProperties = {
  padding: "12px 0",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  textAlign: "center",
};

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div style={DETAIL_BOX}>
      <div style={DETAIL_LABEL}>{label}</div>
      <div style={DETAIL_VALUE}>{value || "Not provided"}</div>
    </div>
  );
}

export function CareerCreateConfirmModal({
  open,
  jobTitle,
  companyName,
  department,
  jobType,
  workMode,
  location,
  vacancies,
  salaryMin,
  salaryMax,
  salaryPeriod,
  noticePeriodText,
  interviewRounds,
  skillsCount,
  qualificationsCount,
  responsibilitiesCount,
  screeningQuestionCount,
  duplicateWarnings,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const hasDuplicates = duplicateWarnings.length > 0;
  const salaryDisplay = formatCareerSalaryDisplay(salaryMin, salaryMax, salaryPeriod);
  const locationDisplay = workMode === "remote" ? "Remote / Anywhere" : cap(location);

  return (
    <CenterModal
      open={open}
      onBackdropClose={onCancel}
      ariaLabel="Review career job before publishing"
      maxWidth={460}
    >
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={ICON_WRAP}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
              Preview before publish
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              Review the career job details before applicants can see this post.
            </div>
          </div>
        </div>

        <div style={SUMMARY_CARD}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--wm-er-text)" }}>
                {cap(jobTitle)}
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3 }}>
                {cap(companyName)} · {department.trim() || "Department"}
              </div>
            </div>
            <div
              style={{ fontSize: 14, fontWeight: 900, color: CAREER_BLUE, whiteSpace: "nowrap" }}
            >
              {salaryDisplay}
            </div>
          </div>

          <div style={DETAIL_GRID}>
            <ReviewField
              label="Vacancies"
              value={`${vacancies} opening${vacancies !== 1 ? "s" : ""}`}
            />
            <ReviewField
              label="Job type"
              value={formatCareerJobType(jobType as "full-time" | "part-time" | "contract")}
            />
            <ReviewField label="Work mode" value={formatCareerWorkMode(workMode)} />
            <ReviewField label="Location" value={locationDisplay} />
            <ReviewField label="Notice period" value={noticePeriodText} />
            <ReviewField
              label="Interviews"
              value={`${interviewRounds} round${interviewRounds !== 1 ? "s" : ""}`}
            />
          </div>

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span className="wm-chip">Skills: {skillsCount}</span>
            <span className="wm-chip">Qualifications: {qualificationsCount}</span>
            <span className="wm-chip">Responsibilities: {responsibilitiesCount}</span>
            <span className="wm-chip">Screening: {screeningQuestionCount}</span>
          </div>
        </div>

        {hasDuplicates && (
          <div style={DUPLICATE_BOX}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0, marginTop: 1 }}
                aria-hidden="true"
              >
                <path fill="#dc2626" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
              </svg>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#991b1b" }}>
                  Possible duplicate career job found
                </div>
                <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.5, marginTop: 4 }}>
                  Please review before publishing. You can still continue if this is intentional.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {duplicateWarnings.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: "#fff",
                    border: "1px solid rgba(220,38,38,0.14)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>
                    {item.jobTitle} · {item.companyName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                    {item.department} · {item.location} · {formatCareerJobType(item.jobType)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {responsibilitiesCount === 0 && (
          <div style={{ ...WARNING_BOX, marginTop: hasDuplicates ? 10 : 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0, marginTop: 1 }}
                aria-hidden="true"
              >
                <path fill="#d97706" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
              </svg>
              <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
                Responsibilities are not added. Adding them helps applicants understand the daily
                work clearly.
              </div>
            </div>
          </div>
        )}

        <div style={WARNING_BOX}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              style={{ flexShrink: 0, marginTop: 1 }}
              aria-hidden="true"
            >
              <path fill="#d97706" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
            </svg>
            <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
              This career job will be visible to applicants immediately after publishing.
            </div>
          </div>
        </div>

        <div style={BTN_ROW}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              ...BTN_BASE,
              border: "1.5px solid #d1d5db",
              background: "#fff",
              color: "var(--wm-er-text)",
            }}
          >
            Review Again
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              ...BTN_BASE,
              border: "none",
              background: hasDuplicates ? "#b45309" : CAREER_BLUE,
              color: "#fff",
            }}
          >
            {hasDuplicates ? "Publish Anyway" : "Publish Job"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
