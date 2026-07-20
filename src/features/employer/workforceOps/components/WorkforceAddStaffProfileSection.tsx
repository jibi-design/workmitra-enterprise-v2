// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforceAddStaffProfileSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforceAddStaffProfileSection.tsx

import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  initialRating: number | null;
  ratingComment: string;
  onRatingChange: (rating: number | null) => void;
  onRatingCommentChange: (value: string) => void;
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--wm-er-muted)",
  marginTop: 2,
};

export function WorkforceAddStaffProfileSection({
  initialRating,
  ratingComment,
  onRatingChange,
  onRatingCommentChange,
}: Props) {
  return (
    <>
      <div>
        <div style={labelStyle}>
          Initial Rating{" "}
          <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 500 }}>
            (optional)
          </span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onRatingChange(initialRating === value ? null : value)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border:
                  initialRating === value ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
                background: initialRating === value ? AMBER : "#fff",
                color: initialRating === value ? "#fff" : "var(--wm-er-text)",
                fontSize: 14,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {value}
            </button>
          ))}
        </div>

        <div style={hintStyle}>Rate based on past experience working with this person.</div>
      </div>

      <div>
        <div style={labelStyle}>
          Rating Comment{" "}
          <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 500 }}>
            (optional)
          </span>
        </div>

        <input
          type="text"
          className="wm-input"
          placeholder="e.g. Very punctual, great teamwork"
          value={ratingComment}
          onChange={(event) => onRatingCommentChange(event.target.value)}
          style={{ width: "100%", fontSize: 13 }}
          maxLength={200}
        />
      </div>
    </>
  );
}
