/** Upfront auth warning — create/apply intent only; no inline login form. */

import { CenterModal } from "../components/CenterModal";
import type { IntentPacket } from "./intentPacket";
import { isEmployerCreateIntent } from "./guestIntentKinds";

type Props = {
  readonly open: boolean;
  readonly intent: IntentPacket | null;
  readonly onPrimary: () => void;
  readonly onSkip: () => void;
};

export function GuestIntentWarningModal({ open, intent, onPrimary, onSkip }: Props) {
  const employer = intent ? isEmployerCreateIntent(intent.action) : false;
  const title = employer ? "Profile Required for Live Publishing" : "Profile Required to Proceed";
  const message = employer
    ? "You can explore and test the form in preview mode, but you will need a verified Employer Profile to publish live."
    : "You need an active candidate profile to apply or claim schedules.";
  const primaryLabel = employer ? "Create Profile / Sign In" : "Sign In / Register";
  const skipLabel = employer ? "Skip & Continue Preview" : "Skip & Continue Browsing";

  return (
    <CenterModal open={open} onBackdropClose={onSkip} ariaLabel={title} maxWidth={440}>
      <div className="wm-auth-panel" data-testid="guest-intent-warning" style={{ boxShadow: "none", margin: 0 }}>
        <h2 className="wm-auth-hero__title" style={{ fontSize: 22, marginBottom: 8 }}>
          {title}
        </h2>
        <p className="wm-auth-hero__sub" style={{ marginBottom: 18, lineHeight: 1.5 }}>
          {message}
        </p>
        <button type="button" className="wm-press-btn wm-auth-submit" onClick={onPrimary}>
          {primaryLabel}
        </button>
        <button
          type="button"
          className="wm-outlineBtn"
          onClick={onSkip}
          style={{ width: "100%", marginTop: 10 }}
        >
          {skipLabel}
        </button>
      </div>
    </CenterModal>
  );
}
