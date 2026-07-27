// App name: Job Mitra | ShiftWorkspaceRatingSection.tsx — glass (Wave C)

export function ShiftWorkspaceRatingSection({
  canRate,
  hasRated,
  isCompleted,
  onOpenRating,
}: {
  canRate: boolean;
  hasRated: boolean;
  isCompleted: boolean;
  onOpenRating: () => void;
}) {
  if (canRate && !hasRated) {
    return (
      <section
        className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
        data-testid="shift-workspace-rating"
        style={{ animationDelay: "140ms", padding: 16 }}
      >
        <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-emp-text)" }}>
          Rate Employer
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "var(--wm-emp-muted)",
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          Share your experience. Your rating helps other workers choose good employers.
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button className="wm-primarybtn wm-shift-pressable" type="button" onClick={onOpenRating}>
            Rate Employer
          </button>
        </div>
      </section>
    );
  }

  if (hasRated && isCompleted) {
    return (
      <section
        className="wm-shift-surface-glass wm-animateIn"
        data-testid="shift-workspace-rating-done"
        style={{ animationDelay: "140ms", padding: 16 }}
      >
        <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-emp-text)" }}>
          Rating submitted
        </div>

        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 600 }}>
          Thank you for your feedback. This helps build trust for everyone.
        </div>
      </section>
    );
  }

  return null;
}
