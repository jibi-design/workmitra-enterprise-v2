// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceGroupRatingBanner.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceGroupRatingBanner.tsx

import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  groupId: string;
  unratedCount: number;
  onOpenRating?: (groupId: string) => void;
};

export function EmployerWorkforceGroupRatingBanner({ groupId, unratedCount, onOpenRating }: Props) {
  if (unratedCount === 0) return null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-14)",
        background: "rgba(217, 119, 6, 0.06)",
        border: "1px solid rgba(217, 119, 6, 0.18)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, color: "#92400e" }}>Rate your team</div>

      <div style={{ fontSize: 12, color: "#92400e", marginTop: 4, lineHeight: 1.5, opacity: 0.85 }}>
        {unratedCount} member{unratedCount !== 1 ? "s" : ""} not rated yet. Your rating helps
        workers get better opportunities and builds a stronger workforce.
      </div>

      {onOpenRating && (
        <button
          type="button"
          onClick={() => onOpenRating(groupId)}
          style={{
            marginTop: 10,
            height: 38,
            padding: "0 18px",
            borderRadius: "var(--wm-radius-10)",
            border: "none",
            background: AMBER,
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ★ Rate {unratedCount} Member{unratedCount !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
