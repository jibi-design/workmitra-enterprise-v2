/** Job Mitra | NotificationSkeleton.tsx | Shimmer rows for notification list */

export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  const rows = Array.from({ length: Math.max(1, count) }, (_, i) => i);

  return (
    <div className="wm-notifSkeleton" aria-hidden="true">
      {rows.map((i) => (
        <div key={i} className="wm-notifSkeleton__row wm-career-shimmer" />
      ))}
    </div>
  );
}
