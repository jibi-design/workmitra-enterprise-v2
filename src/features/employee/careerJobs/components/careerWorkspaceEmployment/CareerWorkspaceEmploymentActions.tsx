import {
  formatDate,
  getDaysUntilForceComplete,
  getEmployeeActions,
  getStatusLabel,
} from "../../../../../shared/employment/employmentDisplayHelpers";
import type { EmploymentRecord } from "../../../../../shared/employment/employmentTypes";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import {
  CAREER_BLUE,
  CAREER_MUTED,
  CAREER_TEXT,
  DANGER,
  WARNING,
} from "./CareerWorkspaceEmploymentPanels.helpers";

type Props = {
  record: EmploymentRecord;
  actions: ReturnType<typeof getEmployeeActions>;
  onOpenResign: () => void;
  onOpenWithdrawConfirm: (data: ConfirmData) => void;
  onOpenForceConfirm: (data: ConfirmData) => void;
};

export function CareerWorkspaceEmploymentActions({
  record,
  actions,
  onOpenResign,
  onOpenWithdrawConfirm,
  onOpenForceConfirm,
}: Props) {
  if (!actions.canResign && !actions.canWithdraw && !actions.canForceComplete) return null;

  return (
    <div
      style={{
        padding: "13px 16px 15px",
        borderTop: "1px solid rgba(148,163,184,0.14)",
        background: actions.canResign
          ? "linear-gradient(135deg, rgba(255,247,237,0.82), rgba(255,255,255,0.96))"
          : "linear-gradient(135deg, rgba(239,246,255,0.78), rgba(255,255,255,0.96))",
      }}
    >
      {actions.canResign && (
        <div
          style={{
            marginBottom: 11,
            padding: "10px 11px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(220,38,38,0.055)",
            border: "1px solid rgba(220,38,38,0.13)",
          }}
        >
          <div style={{ fontSize: 12.4, fontWeight: 950, color: DANGER }}>Resignation action</div>
          <div
            style={{
              marginTop: 4,
              fontSize: 11.7,
              color: CAREER_MUTED,
              fontWeight: 750,
              lineHeight: 1.45,
            }}
          >
            Use this only when you want to leave this job. Your notice period countdown will start
            after submission.
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "var(--wm-space-10)",
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {actions.canResign && (
          <button
            type="button"
            data-testid="career-resign-job"
            onClick={onOpenResign}
            style={{
              minHeight: 40,
              padding: "0 20px",
              borderRadius: "var(--wm-radius-10)",
              border: "none",
              background: "#dc2626",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Resign job
          </button>
        )}

        {actions.canWithdraw && (
          <button
            type="button"
            onClick={() =>
              onOpenWithdrawConfirm({
                title: "Withdraw resignation?",
                message:
                  "You will return to working status. This is only possible before your employer closes the employment record.",
                tone: "neutral",
                confirmLabel: "Withdraw",
                cancelLabel: "Cancel",
              })
            }
            style={{
              minHeight: 40,
              padding: "0 17px",
              borderRadius: "var(--wm-radius-chip)",
              border: "1px solid rgba(29,78,216,0.24)",
              background: "rgba(29,78,216,0.06)",
              color: CAREER_BLUE,
              fontSize: 13,
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Withdraw resignation
          </button>
        )}

        {actions.canForceComplete && (
          <button
            type="button"
            onClick={() =>
              onOpenForceConfirm({
                title: "Complete employment?",
                message:
                  "Your employer has not closed this record after the notice period. This will mark the employment as completed and unlock ratings. Your employer will be notified.",
                tone: "neutral",
                confirmLabel: "Complete now",
                cancelLabel: "Wait",
              })
            }
            style={{
              minHeight: 40,
              padding: "0 17px",
              borderRadius: "var(--wm-radius-chip)",
              border: "1px solid rgba(180,83,9,0.35)",
              background: "rgba(180,83,9,0.07)",
              color: WARNING,
              fontSize: 13,
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Complete employment
          </button>
        )}

        {!actions.canForceComplete &&
          (record.status === "notice" || record.status === "resigned") &&
          (() => {
            const daysLeft = getDaysUntilForceComplete(record);
            return daysLeft > 0 ? (
              <div
                style={{
                  fontSize: 11,
                  color: CAREER_MUTED,
                  marginTop: 4,
                  width: "100%",
                  textAlign: "right",
                }}
              >
                If employer does not respond after notice period, you can complete this in{" "}
                {daysLeft} day{daysLeft > 1 ? "s" : ""}.
              </div>
            ) : null;
          })()}
      </div>
    </div>
  );
}

export function CareerWorkspaceEmploymentSummary({ record }: { record: EmploymentRecord }) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: record.workDurationDisplay ? "1fr 1fr" : "1fr",
          gap: 9,
          marginTop: 12,
        }}
      >
        {record.joinedAt && (
          <div
            style={{
              padding: "10px 11px",
              borderRadius: "var(--wm-radius-chip)",
              background: "rgba(29,78,216,0.055)",
              border: "1px solid rgba(29,78,216,0.09)",
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>Joined</div>
            <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 950, color: CAREER_TEXT }}>
              {formatDate(record.joinedAt)}
            </div>
          </div>
        )}

        {record.workDurationDisplay && (
          <div
            style={{
              padding: "10px 11px",
              borderRadius: "var(--wm-radius-chip)",
              background: "rgba(15,23,42,0.035)",
              border: "1px solid rgba(15,23,42,0.05)",
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>Duration</div>
            <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 950, color: CAREER_TEXT }}>
              {record.workDurationDisplay}
            </div>
          </div>
        )}
      </div>

      {record.status === "completed" && (
        <div style={{ marginTop: 10, fontSize: 12, color: CAREER_MUTED }}>
          Status: <span style={{ fontWeight: 900 }}>{getStatusLabel(record)}</span>
        </div>
      )}
    </>
  );
}
