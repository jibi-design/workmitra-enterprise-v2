/** Job Mitra | ShiftSkeletonCard.tsx | Shared shift shimmer skeleton */

type ShiftSkeletonCardProps = {
  count?: number;
  employer?: boolean;
};

export function ShiftSkeletonCard({ count = 3, employer = false }: ShiftSkeletonCardProps) {
  const cards = Array.from({ length: Math.max(1, count) }, (_, i) => i);

  return (
    <div style={{ display: "grid", gap: 12 }} aria-hidden="true">
      {cards.map((i) => (
        <div
          key={i}
          className={`wm-shift-card${employer ? " wm-shift-card--employer" : ""}`}
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
            style={{ height: 44, borderRadius: 14, width: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}
