/** Job Mitra | CareerSkeletonCard.tsx | Shared career shimmer skeleton */

type CareerSkeletonCardProps = {
  count?: number;
  employer?: boolean;
};

export function CareerSkeletonCard({ count = 3, employer = false }: CareerSkeletonCardProps) {
  const cards = Array.from({ length: Math.max(1, count) }, (_, i) => i);

  return (
    <div style={{ display: "grid", gap: 12 }} aria-hidden="true">
      {cards.map((i) => (
        <div
          key={i}
          className={`wm-career-card${employer ? " wm-career-card--employer" : ""}`}
          style={{ padding: 16, display: "grid", gap: 12 }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              className="wm-career-shimmer"
              style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }}
            />
            <div style={{ flex: 1, display: "grid", gap: 8 }}>
              <div
                className="wm-career-shimmer"
                style={{ height: 14, borderRadius: 8, width: "72%" }}
              />
              <div
                className="wm-career-shimmer"
                style={{ height: 11, borderRadius: 8, width: "48%" }}
              />
            </div>
          </div>
          <div
            className="wm-career-shimmer"
            style={{ height: 11, borderRadius: 8, width: "88%" }}
          />
          <div
            className="wm-career-shimmer"
            style={{ height: 11, borderRadius: 8, width: "62%" }}
          />
          <div
            className="wm-career-shimmer"
            style={{ height: 44, borderRadius: 14, width: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}
