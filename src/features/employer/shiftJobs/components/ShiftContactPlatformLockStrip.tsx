// App name: Job Mitra
// Platform Lock — contact always masked; in-app Workspace chat only.
// Ultra-Enterprise U5 — TrustStrip chrome

import type { ApplicantStatus } from "../../shiftJobs/storage/employerShift.storage";
import {
  SHIFT_CONTACT_MASKED_MESSAGE,
  SHIFT_CONTACT_PLATFORM_LOCK_MESSAGE,
} from "../helpers/shiftPrivacyHelpers";
import { TrustStrip } from "../../../../shared/components/enterprise";

type Props = {
  applicantStatus: ApplicantStatus;
  compact?: boolean;
};

export function ShiftContactPlatformLockStrip({ applicantStatus, compact = false }: Props) {
  const confirmed = applicantStatus === "confirmed";

  return (
    <div data-testid="shift-contact-platform-lock">
      <TrustStrip
        kind="lock"
        tone="neutral"
        title={confirmed ? "In-app contact only" : "Contact protected"}
        message={
          compact
            ? undefined
            : confirmed
              ? SHIFT_CONTACT_PLATFORM_LOCK_MESSAGE
              : SHIFT_CONTACT_MASKED_MESSAGE
        }
        badgeLabel="Locked"
      />
      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: 0.35,
          color: "#64748b",
        }}
      >
        Phone: •••• •••• · Email: ••••@••••
      </div>
    </div>
  );
}
