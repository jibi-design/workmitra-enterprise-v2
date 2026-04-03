// src/features/employer/myStaff/components/ExitProcessingModal.tsx
//
// 4-step employer-initiated exit flow.

import { useState } from "react";
import type { CSSProperties } from "react";
import type { StaffExitReason } from "../storage/myStaff.storage";
import { ExitStep1, ExitStep2, ExitStep3, ExitStep4 } from "./ExitProcessingSteps";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  employeeName: string;
  jobTitle: string;
  onComplete: (reason: StaffExitReason, exitedAt: number, rating: number, comment: string) => void;
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function formatDateInput(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------ */
/* Shared Styles                                    */
/* ------------------------------------------------ */
const OVERLAY: CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 16, zIndex: 50,
};

const CARD: CSSProperties = {
  width: "100%", maxWidth: 420, background: "#fff",
  borderRadius: 16, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const CANCEL_BTN: CSSProperties = {
  padding: "10px 18px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.12)",
  background: "transparent", fontWeight: 800, fontSize: 13,
  color: "var(--wm-er-text)", cursor: "pointer",
};

function nextBtnStyle(enabled: boolean): CSSProperties {
  return {
    padding: "10px 18px", borderRadius: 10, border: "none",
    background: enabled ? "#dc2626" : "#e5e7eb",
    color: enabled ? "#fff" : "#9ca3af",
    fontWeight: 900, fontSize: 13, cursor: enabled ? "pointer" : "not-allowed",
  };
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ExitProcessingModal({ employeeName, jobTitle, onComplete, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<StaffExitReason | "">("");
  const [nowMs] = useState(() => Date.now());
  const [dateStr, setDateStr] = useState(() => formatDateInput(Date.now()));
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const todayStr = formatDateInput(nowMs);
  const parsedDate = new Date(dateStr + "T00:00:00").getTime();
  const dateValid = !Number.isNaN(parsedDate);

  return (
    <div role="dialog" aria-modal="true" style={OVERLAY} onClick={onClose}>
      <div style={CARD} onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <ExitStep1
            employeeName={employeeName} jobTitle={jobTitle}
            reason={reason} onReasonChange={setReason}
            onNext={() => { if (reason) setStep(2); }}
            onCancel={onClose}
            cancelBtn={CANCEL_BTN} nextBtn={nextBtnStyle}
          />
        )}

        {step === 2 && (
          <ExitStep2
            employeeName={employeeName} jobTitle={jobTitle}
            dateStr={dateStr} onDateChange={setDateStr}
            todayStr={todayStr} dateValid={dateValid}
            onNext={() => { if (dateValid) setStep(3); }}
            onBack={() => setStep(1)}
            cancelBtn={CANCEL_BTN} nextBtn={nextBtnStyle}
          />
        )}

        {step === 3 && (
          <ExitStep3
            employeeName={employeeName} jobTitle={jobTitle}
            rating={rating} onRatingChange={setRating}
            comment={comment} onCommentChange={setComment}
            onNext={() => { if (rating > 0) setStep(4); }}
            onBack={() => setStep(2)}
            cancelBtn={CANCEL_BTN} nextBtn={nextBtnStyle}
          />
        )}

        {step === 4 && (
          <ExitStep4
            employeeName={employeeName}
            onDone={() => onComplete(reason as StaffExitReason, parsedDate, rating, comment.trim())}
          />
        )}
      </div>
    </div>
  );
}