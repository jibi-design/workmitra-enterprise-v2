/** Staff scanner result — green authorized / red used or invalid. */

type Props = {
  readonly headline: string;
  readonly tone: "valid" | "fail";
  readonly guestName: string;
  readonly detail: string;
};

export function EventDayGateScannerResult({ headline, tone, guestName, detail }: Props) {
  return (
    <div className="wm-mlEntModal__scanResult" data-testid="scanner-result">
      <div className={`wm-mlBadge wm-mlBadge--${tone}`} role="status">
        {headline}
      </div>
      {guestName ? <p className="wm-mlEntModal__scanDetail">{guestName}</p> : null}
      <p className="wm-mlEntModal__scanDetail">{detail}</p>
    </div>
  );
}
