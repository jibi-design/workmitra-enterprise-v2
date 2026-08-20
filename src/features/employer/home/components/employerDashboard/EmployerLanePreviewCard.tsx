/** Non-clickable lane sub-card — title, one-line guide, sample preview badge. */

type Props = {
  readonly title: string;
  readonly blurb: string;
  readonly preview: string;
  readonly testId: string;
};

export function EmployerLanePreviewCard({ title, blurb, preview, testId }: Props) {
  return (
    <article className="wm-dashWidget wm-erDashBentoCard wm-erDashPreviewCard" data-testid={testId}>
      <div className="wm-erDashPreviewCard__copy">
        <h2 className="wm-erDashPreviewCard__title">{title}</h2>
        <p className="wm-erDashPreviewCard__blurb">{blurb}</p>
      </div>
      <span className="wm-erDashPreviewCard__badge" aria-hidden="true">
        {preview}
      </span>
    </article>
  );
}
