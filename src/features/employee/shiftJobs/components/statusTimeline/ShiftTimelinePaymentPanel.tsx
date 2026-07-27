// App name: Job Mitra
// File name: ShiftTimelinePaymentPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\ShiftTimelinePaymentPanel.tsx

import {
  PAYMENT_FLOW_STAGES,
  PAYMENT_STAGE_HELPER,
  PAYMENT_STAGE_LABEL,
} from "./shiftTimeline.constants";
import { AMBER_DARK, MUTED, RED } from "./shiftTimeline.styles";
import type { ShiftPaymentStage } from "./shiftTimeline.types";

export type ShiftTimelinePaymentPanelProps = {
  readonly paymentStage: ShiftPaymentStage;
};

export function ShiftTimelinePaymentPanel({ paymentStage }: ShiftTimelinePaymentPanelProps) {
  const activeIndex = PAYMENT_FLOW_STAGES.indexOf(paymentStage);
  const isFailed = paymentStage === "failed";

  return (
    <section
      style={{
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid rgba(217, 119, 6, 0.16)",
        background: "linear-gradient(180deg, rgba(255, 251, 235, 0.76), rgba(255, 255, 255, 0.96))",
        padding: 12,
        display: "grid",
        gap: 10,
      }}
      aria-label="Financial clarity"
    >
      <div style={{ display: "grid", gap: 3 }}>
        <div style={{ fontSize: 12, fontWeight: 950, color: AMBER_DARK }}>Financial clarity</div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 750,
            color: MUTED,
            lineHeight: 1.45,
          }}
        >
          {PAYMENT_STAGE_LABEL[paymentStage]}. {PAYMENT_STAGE_HELPER[paymentStage]}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 6,
        }}
      >
        {PAYMENT_FLOW_STAGES.map((step, index) => (
          <PaymentStepBadge
            key={step}
            label={PAYMENT_STAGE_LABEL[step]}
            isComplete={paymentStage === "paid" || (activeIndex >= 0 && index < activeIndex)}
            isActive={paymentStage === step}
            isFailed={isFailed}
          />
        ))}
      </div>
    </section>
  );
}

function PaymentStepBadge({
  label,
  isComplete,
  isActive,
  isFailed,
}: {
  readonly label: string;
  readonly isComplete: boolean;
  readonly isActive: boolean;
  readonly isFailed: boolean;
}) {
  let border = "1px solid rgba(148, 163, 184, 0.18)";
  let background = "rgba(248, 250, 252, 0.88)";
  let color = MUTED;

  if (isComplete || isActive) {
    border = "1px solid rgba(217, 119, 6, 0.28)";
    background = "rgba(254, 243, 199, 0.82)";
    color = AMBER_DARK;
  }

  if (isFailed) {
    border = "1px solid rgba(220, 38, 38, 0.26)";
    background = "rgba(254, 242, 242, 0.84)";
    color = RED;
  }

  return (
    <div
      style={{
        borderRadius: "var(--wm-radius-button)",
        border,
        background,
        color,
        padding: "8px 6px",
        textAlign: "center",
        fontSize: 10,
        fontWeight: 950,
      }}
    >
      {label}
    </div>
  );
}
