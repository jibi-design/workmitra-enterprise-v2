/** Current event PIN + reveal + reset + set new PIN. */

import { Eye, EyeOff } from "lucide-react";
import { VaultStyleOtpDigits } from "../../../shared/components/otp/VaultStyleOtpDigits";
import { normalizeGatePinInput } from "../helpers/mitraLabsGate.helpers";

type Props = {
  readonly eventName: string;
  readonly activePin: string;
  readonly pinVisible: boolean;
  readonly draftPin: string;
  readonly error: string | null;
  readonly busy: boolean;
  readonly onToggleVisible: () => void;
  readonly onDraftChange: (value: string) => void;
  readonly onReset: () => void;
};

export function EventDayGatePinPanel({
  eventName,
  activePin,
  pinVisible,
  draftPin,
  error,
  busy,
  onToggleVisible,
  onDraftChange,
  onReset,
}: Props) {
  return (
    <>
      <div className="wm-mlEntModal__status" data-testid="employer-gate-pin-current">
        <div className="wm-mlEntModal__statusLabel">Current PIN · {eventName}</div>
        <div className="wm-mlEntModal__pinRow">
          <div className="wm-mlEntModal__statusDigits" aria-live="polite">
            {Array.from({ length: 4 }, (_, index) => (
              <span
                key={index}
                className={`wm-mlEntModal__statusDigit${
                  pinVisible ? "" : " wm-mlEntModal__statusDigit--masked"
                }`}
              >
                {pinVisible ? (activePin[index] ?? "•") : "•"}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="wm-mlEntModal__pinReveal"
            onClick={onToggleVisible}
            aria-pressed={pinVisible}
            aria-label={pinVisible ? "Hide gate PIN" : "Show gate PIN"}
            data-testid="employer-gate-pin-reveal"
          >
            {pinVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>
        <p className="wm-mlEntModal__statusHint">
          Masked by default. This PIN is only for this venue, event, and date.
        </p>
        <button
          type="button"
          className="wm-outlineBtn wm-mlEntModal__btnFull"
          onClick={onReset}
          disabled={busy}
          data-testid="employer-gate-pin-reset"
        >
          Reset this event PIN
        </button>
      </div>

      <div className="wm-mlEntModal__section">
        <div className="wm-mlEntModal__sectionLabel">Set a new PIN</div>
        <div className="wm-mlEntModal__otp">
          <VaultStyleOtpDigits
            length={4}
            value={draftPin}
            onChange={(value) => onDraftChange(normalizeGatePinInput(value))}
            error={Boolean(error)}
            labelPrefix="Gate PIN digit"
            testId="employer-gate-pin-input"
            autoFocus
          />
        </div>
        <p className="wm-mlEntModal__inputHelp">
          Saving here does not change PIN folders for other venues or dates.
        </p>
      </div>

      {error ? (
        <div className="wm-ent-error wm-mlEntModal__error" role="alert">
          <div className="wm-ent-error__subtitle">{error}</div>
        </div>
      ) : null}
    </>
  );
}
