/** Public pass verify — gate PIN modal for check-in. */

import { KeyRound } from "lucide-react";
import { useEffect, useRef } from "react";
import { VaultStyleOtpDigits } from "../../../shared/components/otp/VaultStyleOtpDigits";
import { normalizeGatePinInput } from "../helpers/mitraLabsGate.helpers";
import { MitraLabsEventDayModalShell } from "./MitraLabsEventDayModalShell";

type Props = {
  readonly open: boolean;
  readonly pin: string;
  readonly error: string | null;
  readonly busy: boolean;
  readonly onPinChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onClose: () => void;
};

export function PublicPassGatePinModal({
  open,
  pin,
  error,
  busy,
  onPinChange,
  onSubmit,
  onClose,
}: Props) {
  const focusOnce = useRef(false);

  useEffect(() => {
    if (!open) {
      focusOnce.current = false;
      return;
    }
    if (focusOnce.current) return;
    focusOnce.current = true;
    const first = document.querySelector<HTMLInputElement>(
      '[data-testid="pass-gate-pin-input"] input',
    );
    first?.focus();
  }, [open]);

  return (
    <MitraLabsEventDayModalShell
      open={open}
      onClose={onClose}
      ariaLabel="Security gate PIN"
      eyebrow="Door check-in"
      title="Enter gate PIN"
      subtitle="Scanning alone does not check anyone in. Door staff must confirm the PIN."
      icon={KeyRound}
      tone="pin"
      testId="pass-gate-pin-modal"
      footer={
        <>
          <button type="button" className="wm-outlineBtn wm-mlEntModal__btnSecondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="wm-primarybtn wm-mlEntModal__btnPrimary"
            disabled={busy || pin.length !== 4}
            onClick={onSubmit}
            data-testid="pass-gate-pin-submit"
          >
            Confirm check-in
          </button>
        </>
      }
    >
      <div className="wm-mlEntModal__section">
        <div className="wm-mlEntModal__sectionLabel">Gate PIN</div>
        <div className="wm-mlEntModal__otp">
          <VaultStyleOtpDigits
            length={4}
            value={pin}
            onChange={(value) => onPinChange(normalizeGatePinInput(value))}
            error={Boolean(error)}
            disabled={busy}
            labelPrefix="Gate PIN digit"
            testId="pass-gate-pin-input"
          />
        </div>
      </div>

      {error ? (
        <div className="wm-ent-error wm-mlEntModal__error" role="alert">
          <div className="wm-ent-error__subtitle">{error}</div>
        </div>
      ) : null}
    </MitraLabsEventDayModalShell>
  );
}
