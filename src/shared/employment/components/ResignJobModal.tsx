// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ResignJobModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employment\components\ResignJobModal.tsx

import { useCallback, useMemo, useState } from "react";
import { CenterModal } from "../../components/CenterModal";
import type { EmployeeResignReason } from "../employmentTypes";
import { EMPLOYEE_RESIGN_REASONS } from "../employmentTypes";

type ResignJobModalProps = {
  open: boolean;
  companyName: string;
  noticePeriodDays: number;
  onConfirm: (reason: EmployeeResignReason, notes: string) => void;
  onCancel: () => void;
};

const ERROR = "var(--wm-error, #dc2626)";
const TEXT = "var(--wm-text-primary, #111827)";
const MUTED = "var(--wm-text-muted, #64748b)";
const BORDER = "var(--wm-border, #e2e8f0)";
const CARD = "var(--wm-bg-card, #ffffff)";
const WARNING = "#b45309";
const DAY_MS = 86_400_000;
const MAX_RESIGN_NOTES_LENGTH = 240;

function formatDateLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ResignJobModal({
  open,
  companyName,
  noticePeriodDays,
  onConfirm,
  onCancel,
}: ResignJobModalProps) {
  const [reason, setReason] = useState<EmployeeResignReason | "">("");
  const [notes, setNotes] = useState("");

  const [nowMs] = useState(() => Date.now());

  const lastWorkingDate = useMemo(() => {
    if (noticePeriodDays <= 0) return nowMs;
    return nowMs + noticePeriodDays * DAY_MS;
  }, [noticePeriodDays, nowMs]);

  const handleConfirm = useCallback(() => {
    if (!reason) return;
    onConfirm(reason, notes.trim());
  }, [reason, notes, onConfirm]);

  const noticeText =
    noticePeriodDays > 0
      ? `Your notice period is ${noticePeriodDays} day${noticePeriodDays === 1 ? "" : "s"}. You should continue working until the last working date unless both sides agree to close earlier.`
      : "Your employer will be notified and must confirm your resignation.";

  return (
    <CenterModal open={open} onBackdropClose={onCancel} ariaLabel="Resign from job">
      <div
        style={{
          padding: 22,
          borderRadius: 24,
          background:
            "radial-gradient(circle at 96% 0%, rgba(220,38,38,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        }}
      >
        <div
          style={{
            width: "fit-content",
            padding: "5px 10px",
            borderRadius: 999,
            background: "rgba(220,38,38,0.075)",
            border: "1px solid rgba(220,38,38,0.14)",
            color: ERROR,
            fontSize: 10,
            fontWeight: 950,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Employment action
        </div>

        <div
          style={{ marginTop: 10, fontSize: 20, fontWeight: 950, color: ERROR, lineHeight: 1.15 }}
        >
          Resign from job
        </div>

        <div
          style={{ marginTop: 7, fontSize: 13.2, color: MUTED, lineHeight: 1.55, fontWeight: 700 }}
        >
          You are resigning from <strong style={{ color: TEXT }}>{companyName}</strong>. Your notice
          period starts after submission.
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "11px 12px",
            borderRadius: 15,
            background: "rgba(180,83,9,0.07)",
            border: "1px solid rgba(180,83,9,0.18)",
            color: "#92400e",
            fontSize: 12.4,
            lineHeight: 1.5,
            fontWeight: 800,
          }}
        >
          {noticeText}
        </div>

        {noticePeriodDays > 0 && (
          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <div
              style={{
                padding: "10px 11px",
                borderRadius: 14,
                background: "rgba(217,119,6,0.08)",
                border: "1px solid rgba(217,119,6,0.14)",
              }}
            >
              <div style={{ fontSize: 10.5, fontWeight: 950, color: MUTED }}>Notice period</div>
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: WARNING }}>
                {noticePeriodDays} day{noticePeriodDays === 1 ? "" : "s"}
              </div>
            </div>

            <div
              style={{
                padding: "10px 11px",
                borderRadius: 14,
                background: "rgba(15,23,42,0.035)",
                border: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ fontSize: 10.5, fontWeight: 950, color: MUTED }}>
                Expected last working date
              </div>
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: TEXT }}>
                {formatDateLabel(lastWorkingDate)}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <label
            htmlFor="wm-resign-reason"
            style={{
              display: "block",
              fontSize: 12.2,
              fontWeight: 900,
              color: TEXT,
              marginBottom: 7,
            }}
          >
            Reason for leaving <span style={{ color: ERROR }}>*</span>
          </label>

          <select
            id="wm-resign-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value as EmployeeResignReason)}
            style={{
              width: "100%",
              height: 48,
              padding: "0 13px",
              borderRadius: 14,
              border: `1px solid ${reason ? "rgba(29,78,216,0.24)" : BORDER}`,
              fontSize: 13.5,
              fontWeight: 750,
              color: reason ? TEXT : "#94a3b8",
              background: CARD,
              outline: "none",
              boxShadow: reason ? "0 0 0 3px rgba(29,78,216,0.06)" : "none",
            }}
          >
            <option value="" disabled>
              Select a reason
            </option>
            {EMPLOYEE_RESIGN_REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 14 }}>
          <label
            htmlFor="wm-resign-notes"
            style={{
              display: "block",
              fontSize: 12.2,
              fontWeight: 900,
              color: TEXT,
              marginBottom: 7,
            }}
          >
            Additional notes{" "}
            <span style={{ fontSize: 11.2, fontWeight: 700, color: MUTED }}>(optional)</span>
          </label>

          <textarea
            id="wm-resign-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value.slice(0, MAX_RESIGN_NOTES_LENGTH))}
            maxLength={MAX_RESIGN_NOTES_LENGTH}
            placeholder="Add any useful information for your employer"
            rows={4}
            style={{
              width: "100%",
              padding: "12px 13px",
              borderRadius: 15,
              border: `1px solid ${BORDER}`,
              fontSize: 13.4,
              fontWeight: 700,
              color: TEXT,
              background: CARD,
              resize: "vertical",
              lineHeight: 1.45,
              outline: "none",
            }}
          />

          <div
            style={{
              marginTop: 4,
              fontSize: 11.2,
              color: MUTED,
              textAlign: "right",
              fontWeight: 800,
            }}
          >
            {notes.length}/{MAX_RESIGN_NOTES_LENGTH}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "10px 11px",
            borderRadius: 15,
            background: "rgba(248,250,252,0.92)",
            border: "1px solid rgba(148,163,184,0.14)",
            fontSize: 11.5,
            color: MUTED,
            fontWeight: 760,
            lineHeight: 1.45,
          }}
        >
          Your resignation will be recorded in your Career employment history. Your employer should
          close the record on or after the last working date.
        </div>

        <div style={{ marginTop: 17, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={onCancel}
            style={{
              minWidth: 86,
              height: 42,
              borderRadius: 13,
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason}
            style={{
              minWidth: 136,
              height: 42,
              borderRadius: 13,
              border: "none",
              background: !reason ? "rgba(203,213,225,0.95)" : ERROR,
              color: !reason ? "#475569" : "#fff",
              fontWeight: 950,
              fontSize: 13,
              cursor: !reason ? "not-allowed" : "pointer",
              boxShadow: reason ? "0 10px 20px rgba(220,38,38,0.18)" : "none",
            }}
          >
            Submit resignation
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
