/** Shift PIN unlock panel for the live gate scanner. */

import { VaultStyleOtpDigits } from "../../../shared/components/otp/VaultStyleOtpDigits";
import { normalizeGatePinInput } from "../helpers/mitraLabsGate.helpers";

type Props = {
  readonly pin: string;
  readonly error: string | null;
  readonly busy: boolean;
  readonly onPinChange: (value: string) => void;
  readonly onUnlock: () => void;
};

export function EventDayGateScannerUnlock({ pin, error, busy, onPinChange, onUnlock }: Props) {
  const canUnlock = /^\d{4}$/.test(pin) && !busy;
  return (
    <div className="wm-mlEntModal__section" data-testid="scanner-shift-unlock">
      <div className="wm-mlEntModal__sectionLabel">Shift unlock</div>
      <p className="wm-mlEntModal__inputHelp">
        Enter the venue gate PIN once to start this shift. Guest codes are not PINs.
      </p>
      <div className="wm-mlEntModal__otp">
        <VaultStyleOtpDigits
          length={4}
          value={pin}
          onChange={(value) => onPinChange(normalizeGatePinInput(value))}
          error={Boolean(error)}
          labelPrefix="Shift PIN digit"
          testId="scanner-shift-pin"
          autoFocus
        />
      </div>
      {error ? (
        <div className="wm-ent-error wm-mlEntModal__error" role="alert">
          <div className="wm-ent-error__subtitle">{error}</div>
        </div>
      ) : null}
      <button
        type="button"
        className="wm-primarybtn wm-mlEntModal__btnPrimary wm-mlEntModal__btnFull"
        onClick={onUnlock}
        disabled={!canUnlock}
        data-testid="scanner-shift-unlock-btn"
      >
        {busy ? "Unlocking…" : "Unlock scanner"}
      </button>
    </div>
  );
}
