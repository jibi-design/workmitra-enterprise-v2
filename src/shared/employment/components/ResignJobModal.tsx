// ResignJobModal.tsx — facade

import { useCallback, useMemo, useState } from "react";
import { CenterModal } from "../../components/CenterModal";
import type { EmployeeResignReason } from "../employmentTypes";
import { RESIGN_ERROR, RESIGN_MUTED, RESIGN_TEXT } from "./ResignJobModal.styles";
import { ResignFormFields, ResignNoticeSummary } from "./ResignJobModal.parts";

type ResignJobModalProps = {
  open: boolean;
  companyName: string;
  noticePeriodDays: number;
  onConfirm: (reason: EmployeeResignReason, notes: string) => void;
  onCancel: () => void;
};

const DAY_MS = 86_400_000;

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
            color: RESIGN_ERROR,
            fontSize: 10,
            fontWeight: 950,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Employment action
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 20,
            fontWeight: 950,
            color: RESIGN_ERROR,
            lineHeight: 1.15,
          }}
        >
          Resign from job
        </div>

        <div
          style={{
            marginTop: 7,
            fontSize: 13.2,
            color: RESIGN_MUTED,
            lineHeight: 1.55,
            fontWeight: 700,
          }}
        >
          You are resigning from <strong style={{ color: RESIGN_TEXT }}>{companyName}</strong>. Your
          notice period starts after submission.
        </div>

        <ResignNoticeSummary
          noticePeriodDays={noticePeriodDays}
          lastWorkingDate={lastWorkingDate}
        />

        <ResignFormFields
          reason={reason}
          notes={notes}
          onReasonChange={setReason}
          onNotesChange={setNotes}
        />

        <div
          style={{
            marginTop: 16,
            padding: "10px 11px",
            borderRadius: 15,
            background: "rgba(248,250,252,0.92)",
            border: "1px solid rgba(148,163,184,0.14)",
            fontSize: 11.5,
            color: RESIGN_MUTED,
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
              background: !reason ? "rgba(203,213,225,0.95)" : RESIGN_ERROR,
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
