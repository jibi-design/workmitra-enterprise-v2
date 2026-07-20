// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforcePostEventRatingMemberCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforcePostEventRatingMemberCard.tsx

import type { WorkforceGroupMember } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconStar } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  member: WorkforceGroupMember;
  categoryName: string;
  currentRating: number;
  currentComment: string;
  onSetRating: (memberId: string, rating: number) => void;
  onSetComment: (memberId: string, comment: string) => void;
};

const memberCardStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

export function WorkforcePostEventRatingMemberCard({
  member,
  categoryName,
  currentRating,
  currentComment,
  onSetRating,
  onSetComment,
}: Props) {
  return (
    <div style={memberCardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {member.employeeName}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{categoryName}</div>
        </div>

        {currentRating > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--wm-er-accent-workforce, #b45309)",
            }}
          >
            <IconStar /> {currentRating}
          </span>
        )}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSetRating(member.id, value)}
            aria-label={`${value} star`}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border:
                currentRating >= value
                  ? "2px solid var(--wm-er-accent-workforce, #b45309)"
                  : "1px solid var(--wm-er-border)",
              background:
                currentRating >= value ? "var(--wm-er-accent-workforce, #b45309)" : "#fff",
              color: currentRating >= value ? "#fff" : "var(--wm-er-muted)",
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &#9733;
          </button>
        ))}
      </div>

      <input
        type="text"
        className="wm-input"
        placeholder="Optional comment (max 100 characters)"
        value={currentComment}
        onChange={(event) => onSetComment(member.id, event.target.value)}
        style={{ width: "100%", fontSize: 12, marginTop: 8 }}
        maxLength={100}
      />
    </div>
  );
}
