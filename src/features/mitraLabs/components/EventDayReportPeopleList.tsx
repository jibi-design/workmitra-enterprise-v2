/** Event Day report — attendance people list. */

type Row = {
  readonly eventId: string;
  readonly staffName: string;
  readonly passId: string;
  readonly entryAt: string;
  readonly status: string;
};

type Props = {
  readonly rows: readonly Row[];
  readonly kicker?: string;
  readonly title?: string;
};

export function EventDayReportPeopleList({
  rows,
  kicker = "Attendance",
  title = "PIN-confirmed entries",
}: Props) {
  if (rows.length === 0) return null;

  return (
    <section className="wm-dashWidget" data-testid="event-day-report-people" data-ui-state="active">
      <div className="wm-dashWidget__kicker">{kicker}</div>
      <h2 className="wm-dashWidget__title">{title}</h2>
      <ul className="wm-mlReportList">
        {rows.map((row) => (
          <li key={row.eventId} className="wm-mlReportList__item">
            <div className="wm-mlReportList__title">{row.staffName}</div>
            <div className="wm-mlReportList__meta">
              {new Date(row.entryAt).toLocaleString()}
              <br />
              {row.status}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
