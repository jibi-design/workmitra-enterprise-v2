/** Event Day — 4-card workflow navigation grid. */

import { Camera, KeyRound, QrCode, Ticket } from "lucide-react";

type CardId = "passes" | "qr" | "pin" | "scanner";

type Props = {
  readonly active?: CardId;
  readonly onPasses: () => void;
  readonly onQr: () => void;
  readonly onPin: () => void;
  readonly onScanner: () => void;
};

export function EventDayWorkflowCards({ active, onPasses, onQr, onPin, onScanner }: Props) {
  return (
    <div className="wm-mlWorkflowGrid" data-testid="event-day-workflow-cards">
      <button
        type="button"
        className={`wm-dashWidget wm-mlWorkflowCard${active === "passes" ? " isActive" : ""}`}
        data-testid="event-day-card-passes"
        onClick={onPasses}
      >
        <Ticket size={20} aria-hidden="true" />
        <span className="wm-mlWorkflowCard__title">Send guest &amp; staff passes</span>
        <span className="wm-mlWorkflowCard__sub">
          1 shift, 3-day, 1-week, or custom validity window
        </span>
      </button>
      <button
        type="button"
        className={`wm-dashWidget wm-mlWorkflowCard${active === "qr" ? " isActive" : ""}`}
        data-testid="event-day-card-qr"
        onClick={onQr}
      >
        <QrCode size={20} aria-hidden="true" />
        <span className="wm-mlWorkflowCard__title">Create branded QR &amp; export</span>
        <span className="wm-mlWorkflowCard__sub">Poster designer with SVG, PNG, and PDF export</span>
      </button>
      <button
        type="button"
        className={`wm-dashWidget wm-mlWorkflowCard${active === "pin" ? " isActive" : ""}`}
        data-testid="event-day-card-pin"
        onClick={onPin}
      >
        <KeyRound size={20} aria-hidden="true" />
        <span className="wm-mlWorkflowCard__title">Security gate PIN</span>
        <span className="wm-mlWorkflowCard__sub">View active PIN and reset instantly</span>
      </button>
      <button
        type="button"
        className={`wm-dashWidget wm-mlWorkflowCard${active === "scanner" ? " isActive" : ""}`}
        data-testid="event-day-card-scanner"
        onClick={onScanner}
      >
        <Camera size={20} aria-hidden="true" />
        <span className="wm-mlWorkflowCard__title">Live gate camera scanner</span>
        <span className="wm-mlWorkflowCard__sub">Scan passes in-app with instant valid/expired feedback</span>
      </button>
    </div>
  );
}
