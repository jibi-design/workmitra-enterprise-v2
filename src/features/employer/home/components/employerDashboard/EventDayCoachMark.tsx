/** Job Mitra | EventDayCoachMark.tsx | One-step Event day discovery callout */

type Props = {
  readonly onDismiss: () => void;
};

export function EventDayCoachMark({ onDismiss }: Props) {
  return (
    <aside
      className="wm-erEventDayCoach"
      data-testid="er-event-day-coach"
      role="status"
      aria-labelledby="er-event-day-coach-title"
      aria-describedby="er-event-day-coach-body"
    >
      <p id="er-event-day-coach-title" className="wm-erEventDayCoach__title">
        Event day
      </p>
      <p id="er-event-day-coach-body" className="wm-erEventDayCoach__body">
        Send a door pass or print a QR. These are venue tools — not Shift or Career hiring.
      </p>
      <div className="wm-erEventDayCoach__actions">
        <button type="button" className="wm-primarybtn" onClick={onDismiss}>
          Got it
        </button>
        <button type="button" className="wm-outlineBtn" onClick={onDismiss}>
          Don&apos;t show again
        </button>
      </div>
    </aside>
  );
}
