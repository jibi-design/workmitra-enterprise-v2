import type { CareerDuplicateWarning } from "../helpers/careerCreateHelpers";
import {
  formatCareerJobType,
  formatCareerSalaryDisplay,
  formatCareerWorkMode,
} from "../helpers/careerCreateHelpers";
import type { CareerSalaryPeriod, CareerWorkMode } from "../types/careerTypes";
import {
  BTN_ROW,
  CAREER_BLUE,
  DUPLICATE_BOX,
  DETAIL_BOX,
  DETAIL_GRID,
  DETAIL_LABEL,
  DETAIL_VALUE,
  ICON_WRAP,
  SUMMARY_CARD,
  WARNING_BOX,
  cap,
} from "./CareerCreateConfirmModal.styles";

export function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div style={DETAIL_BOX}>
      <div style={DETAIL_LABEL}>{label}</div>
      <div style={DETAIL_VALUE}>{value || "Not provided"}</div>
    </div>
  );
}

type ConfirmBodyProps = {
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

export function CareerCreateConfirmBody({
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
}: ConfirmBodyProps) {
  const hasDuplicates = duplicateWarnings.length > 0;
  const salaryDisplay = formatCareerSalaryDisplay(salaryMin, salaryMax, salaryPeriod);
  const locationDisplay = workMode === "remote" ? "Remote / Anywhere" : cap(location);

  return (
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
          <div style={{ fontSize: 14, fontWeight: 900, color: CAREER_BLUE, whiteSpace: "nowrap" }}>
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
                  borderRadius: "var(--wm-radius-10)",
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
              Responsibilities are not added. Adding them helps applicants understand the daily work
              clearly.
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
        <button type="button" className="wm-outlineBtn" onClick={onCancel}>
          Review Again
        </button>
        <button
          type="button"
          className={hasDuplicates ? "wm-dangerBtn" : "wm-primarybtn"}
          onClick={onConfirm}
        >
          {hasDuplicates ? "Publish Anyway" : "Publish Job"}
        </button>
      </div>
    </div>
  );
}
