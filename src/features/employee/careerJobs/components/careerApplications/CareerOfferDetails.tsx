// Split from CareerApplicationCardParts — CareerOfferDetails.

import { DuplicateEmploymentWarning } from "../DuplicateEmploymentWarning";
import type { AppLite } from "../../types/careerApplicationTypes";
import { CAREER_BLUE, CAREER_MUTED } from "./careerApplicationCard.constants";

export function CareerOfferDetails({
  app,
  onAcceptOffer,
  onDeclineOffer,
}: {
  app: AppLite;
  onAcceptOffer?: () => void;
  onDeclineOffer?: () => void;
}) {
  if (app.stage !== "offered" || !app.offerDetails) return null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: "16px",
        borderRadius: "var(--wm-radius-chip)",
        background: "linear-gradient(135deg, #eff6ff, #ffffff)",
        border: "1px solid rgba(29,78,216,0.15)",
      }}
    >
      <DuplicateEmploymentWarning />

      <div style={{ fontSize: "14px", fontWeight: 800, color: CAREER_BLUE, marginBottom: "8px" }}>
        Offer details
      </div>

      <div style={{ fontSize: "13px", color: "#0f172a", lineHeight: 1.6, fontWeight: 700 }}>
        {app.offerDetails.jobTitle} • Salary: {app.offerDetails.salary.toLocaleString()} /{" "}
        {app.offerDetails.salaryPeriod}
        {app.offerDetails.startDate && (
          <span>
            {" "}
            • Start:{" "}
            {new Date(app.offerDetails.startDate).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {app.offerDetails.message && (
        <div
          style={{
            fontSize: "12px",
            color: CAREER_MUTED,
            marginTop: "8px",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          &ldquo;{app.offerDetails.message}&rdquo;
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--wm-space-10)", marginTop: "var(--wm-stack-gap)" }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAcceptOffer?.();
          }}
          className="wm-career-tap wm-primarybtn"
          aria-label={`Accept offer for ${app.offerDetails.jobTitle}`}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: "var(--wm-radius-button)",
            border: "none",
            background: "var(--wm-career-accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Accept Offer
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDeclineOffer?.();
          }}
          className="wm-career-tap"
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: "var(--wm-radius-button)",
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: CAREER_MUTED,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
