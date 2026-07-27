import { useState } from "react";
import {
  salaryPeriodLabel,
  workModeLabel,
  jobTypeLabel,
  formatCareerCreateDate,
} from "../helpers/careerCreateStepInterview.helpers";
import type { InterviewRoundConfig } from "../types/careerTypes";
import type { ScreeningQuestion } from "./CareerCreateScreeningSection";
import type { StepBasicData } from "./CareerCreateStepBasic";
import type { StepRequirementsData } from "./CareerCreateStepRequirements";
import { CareerCreateStepSectionHead, IconReview } from "./CareerCreateStepSectionHead";
import { SUMMARY_BOX_STYLE, PILL_STYLE } from "./CareerCreateFinalReview.styles";
import {
  CARD_STYLE,
  CareerCreatePublishModal,
  ReviewRow,
} from "./CareerCreateFinalReview.modal.parts";

export type CareerCreateFinalReviewProps = {
  basicData: StepBasicData;
  reqData: StepRequirementsData;
  rounds: InterviewRoundConfig[];
  screeningQuestions: ScreeningQuestion[];
  onPublish: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  onCancel?: () => void;
};

function formatSalaryRange(
  min: number,
  max: number,
  period: StepRequirementsData["salaryPeriod"],
): string {
  if (min <= 0 && max <= 0) return "Not specified";
  const safeMax = max > 0 ? max : min;
  const periodLabel = salaryPeriodLabel(period) === "month" ? "Monthly" : "Annual";
  return `${min.toLocaleString()} - ${safeMax.toLocaleString()} (${periodLabel})`;
}

export function CareerCreateFinalReview({
  basicData,
  reqData,
  rounds,
  screeningQuestions,
  onPublish,
  onBack,
  onSaveDraft,
  onCancel,
}: CareerCreateFinalReviewProps) {
  const [showModal, setShowModal] = useState(false);
  const noticePeriod =
    reqData.noticePeriodDays === "custom"
      ? `${reqData.noticePeriodCustomDays} days`
      : `${reqData.noticePeriodDays} days`;

  return (
    <section style={CARD_STYLE}>
      <CareerCreateStepSectionHead
        icon={<IconReview />}
        title="Review & Publish"
        sub="Check the final details before this Career Job becomes visible to applicants."
      />

      <div style={SUMMARY_BOX_STYLE}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: "var(--wm-er-accent-career)",
            textTransform: "uppercase",
          }}
        >
          CAREER JOB SUMMARY
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>{basicData.jobTitle}</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 12 }}>
          {basicData.companyName} • {basicData.department} • {basicData.location}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={PILL_STYLE}>
            <div style={{ fontSize: 9, color: "var(--wm-er-muted)" }}>Job type</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>{jobTypeLabel(basicData.jobType)}</div>
          </div>
          <div style={PILL_STYLE}>
            <div style={{ fontSize: 9, color: "var(--wm-er-muted)" }}>Work mode</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>{workModeLabel(basicData.workMode)}</div>
          </div>
          <div style={PILL_STYLE}>
            <div style={{ fontSize: 9, color: "var(--wm-er-muted)" }}>Salary</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>
              {formatSalaryRange(
                Number(reqData.salaryMin),
                Number(reqData.salaryMax),
                reqData.salaryPeriod,
              )}
            </div>
          </div>
          <div style={PILL_STYLE}>
            <div style={{ fontSize: 9, color: "var(--wm-er-muted)" }}>Notice</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>{noticePeriod}</div>
          </div>
          <div style={{ gridColumn: "span 2", ...PILL_STYLE }}>
            <div style={{ fontSize: 9, color: "var(--wm-er-muted)" }}>Deadline</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>
              {formatCareerCreateDate(reqData.closingDate)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "var(--wm-space-20)", display: "grid", gap: "var(--wm-space-8)" }}>
        <ReviewRow label="Company" value={basicData.companyName} />
        <ReviewRow label="Job title" value={basicData.jobTitle} />
        <ReviewRow label="Department" value={basicData.department || "None specified"} />
        <ReviewRow label="Location" value={basicData.location} />
        <ReviewRow
          label="Experience"
          value={`${reqData.experienceMin || 0} - ${reqData.experienceMax || 0} years`}
        />
        <ReviewRow label="Notice period" value={noticePeriod} />
        <ReviewRow label="Qualifications" value={reqData.qualifications || "None specified"} />
        <ReviewRow label="Skills" value={reqData.skills || "None specified"} />
        <ReviewRow label="Responsibilities" value={reqData.responsibilities || "None specified"} />
        <ReviewRow label="Screening" value={`${screeningQuestions.length} question(s)`} />
        <ReviewRow label="Interviews" value={rounds.map((r) => r.label).join(", ")} />
      </div>

      {screeningQuestions.length > 0 && (
        <div
          style={{
            marginTop: "var(--wm-space-20)",
            padding: 16,
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(37, 99, 235, 0.04)",
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 900, color: "var(--wm-er-muted)", marginBottom: 8 }}
          >
            SCREENING QUESTIONS CANDIDATES MUST ANSWER
          </div>
          {screeningQuestions.map((q, i) => (
            <div key={q.id} style={{ fontSize: 12, fontWeight: 700, padding: "4px 0" }}>
              {i + 1}. {q.text}
            </div>
          ))}
        </div>
      )}

      {!reqData.responsibilities.trim() && (
        <div
          style={{
            marginTop: "var(--wm-space-20)",
            padding: 16,
            borderRadius: "var(--wm-radius-chip)",
            background: "#fef3c7",
            border: "1px solid #fcd34d",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: "#92400e" }}>
            Recommended before publishing
          </div>
          <div style={{ fontSize: 11, color: "#92400e" }}>
            Responsibilities are not added. Adding them helps applicants understand the daily work
            clearly.
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 24,
          gap: "var(--wm-space-10)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--wm-space-8)" }}>
          {onCancel && (
            <button type="button" className="wm-outlineBtn" onClick={onCancel}>
              Cancel
            </button>
          )}
          {onSaveDraft && (
            <button type="button" className="wm-ghostBtn" onClick={onSaveDraft}>
              Save Draft
            </button>
          )}
        </div>
        <div
          style={{ display: "flex", gap: "var(--wm-space-8)", flex: 1, justifyContent: "flex-end" }}
        >
          <button type="button" className="wm-outlineBtn" onClick={onBack}>
            Back
          </button>
          <button type="button" className="wm-primarybtn" onClick={() => setShowModal(true)}>
            Publish Job
          </button>
        </div>
      </div>

      {showModal && (
        <CareerCreatePublishModal onClose={() => setShowModal(false)} onPublish={onPublish} />
      )}
    </section>
  );
}
