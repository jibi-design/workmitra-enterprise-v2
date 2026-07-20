// App name: Job Mitra
// Platform Lock — contact always masked; in-app Workspace chat only.

import type { CSSProperties } from "react";
import type { ApplicantStatus } from "../../shiftJobs/storage/employerShift.storage";
import {
  SHIFT_CONTACT_MASKED_MESSAGE,
  SHIFT_CONTACT_PLATFORM_LOCK_MESSAGE,
} from "../helpers/shiftPrivacyHelpers";

type Props = {
  applicantStatus: ApplicantStatus;
  compact?: boolean;
};

const STRIP_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "9px 11px",
  borderRadius: 12,
  background: "rgba(248,250,252,0.98)",
  border: "1px solid rgba(226,232,240,0.95)",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  lineHeight: 1.45,
};

export function ShiftContactPlatformLockStrip({ applicantStatus, compact = false }: Props) {
  const confirmed = applicantStatus === "confirmed";

  return (
    <div style={STRIP_STYLE} data-testid="shift-contact-platform-lock">
      <div style={{ fontWeight: 900, marginBottom: compact ? 0 : 4, color: "var(--wm-er-text)" }}>
        {confirmed ? "In-app contact only" : "Contact protected"}
      </div>

      {!compact && (
        <div style={{ marginBottom: 6 }}>
          {confirmed ? SHIFT_CONTACT_PLATFORM_LOCK_MESSAGE : SHIFT_CONTACT_MASKED_MESSAGE}
        </div>
      )}

      <div style={{ fontFamily: "monospace", letterSpacing: 0.35 }}>
        Phone: •••• •••• · Email: ••••@••••
      </div>
    </div>
  );
}
