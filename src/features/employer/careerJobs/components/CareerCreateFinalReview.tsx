// App name: Job Mitra
// File name: CareerCreateFinalReview.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateFinalReview.tsx

import { useState, type CSSProperties } from "react";
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

type CareerCreateFinalReviewProps = {
  basicData: StepBasicData;
  reqData: StepRequirementsData;
  rounds: InterviewRoundConfig[];
  screeningQuestions: ScreeningQuestion[];
  onPublish: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  onCancel?: () => void;
};

// PREMIUM STYLES
const CARD_STYLE: CSSProperties = {
  marginTop: 16,
  padding: 20,
  borderRadius: 24,
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

const SUMMARY_BOX_STYLE: CSSProperties = {
  marginTop: 20,
  padding: 16,
  borderRadius: 20,
  background: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
};

const PILL_STYLE: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 12,
  background: "rgba(248, 250, 252, 0.8)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const MODAL_OVERLAY_STYLE: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15, 23, 42, 0.35)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const MODAL_STYLE: CSSProperties = {
  width: "90%",
  maxWidth: 440,
  padding: 24,
  borderRadius: 28,
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.9))",
  boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.15)",
  backdropFilter: "blur(24px)",
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

      {/* Summary Box */}
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

      {/* Details Grid */}
      <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
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

      {/* Screening questions */}
      {screeningQuestions.length > 0 && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
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

      {/* Warning */}
      {!reqData.responsibilities.trim() && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
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

      {/* Action Buttons Footer Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 24,
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "11px 16px",
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 800,
                background: "#fff",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              Cancel
            </button>
          )}
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              style={{
                padding: "11px 16px",
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 800,
                background: "#fff",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                color: "var(--wm-er-text)",
              }}
            >
              Save Draft
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "11px 20px",
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 800,
              background: "#fff",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              color: "var(--wm-er-text)",
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              padding: "11px 24px",
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 900,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(37,99,235,0.16)",
            }}
          >
            Publish Job
          </button>
        </div>
      </div>

      {/* Final Approval Modal Popup */}
      {showModal && (
        <div style={MODAL_OVERLAY_STYLE}>
          <div style={MODAL_STYLE}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 950,
                color: "var(--wm-er-accent-career)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Final Approval Required
            </div>
            <div
              style={{ fontSize: 18, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 8 }}
            >
              Publish this Career Job?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--wm-er-muted)",
                lineHeight: 1.5,
                marginBottom: 20,
              }}
            >
              Please review all information carefully. Once published, the job post will be live and
              open for applications.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 14,
                  fontSize: 12.5,
                  fontWeight: 800,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  color: "var(--wm-er-text)",
                }}
              >
                Review Again
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onPublish();
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 14,
                  fontSize: 12.5,
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(37,99,235,0.16)",
                }}
              >
                Publish Job
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        paddingBottom: 8,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, textAlign: "right" }}>{value}</div>
    </div>
  );
}
