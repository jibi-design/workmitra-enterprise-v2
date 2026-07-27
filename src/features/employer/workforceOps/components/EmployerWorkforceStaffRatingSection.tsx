// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffRatingSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffRatingSection.tsx

import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconStar } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staff: WorkforceStaff;
  ratingOpen: boolean;
  ratingVal: number;
  onToggleRating: () => void;
  onRatingChange: (value: number) => void;
  onSubmitRating: () => void;
  onCancelRating: () => void;
};

const inlineEditBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: "var(--wm-radius-8)",
  display: "inline-flex",
  alignItems: "center",
};

export function EmployerWorkforceStaffRatingSection({
  staff,
  ratingOpen,
  ratingVal,
  onToggleRating,
  onRatingChange,
  onSubmitRating,
  onCancelRating,
}: Props) {
  return (
    <div className="wm-er-card" style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 900 }}>
          <IconStar /> Rating
        </div>

        <button
          type="button"
          onClick={onToggleRating}
          style={{ ...inlineEditBtnStyle, fontSize: 12, fontWeight: 700 }}
        >
          Rate
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        {staff.rating !== null ? (
          <>
            <div style={{ fontSize: 28, fontWeight: 900, color: AMBER }}>
              {staff.rating.toFixed(1)}
            </div>

            <div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
                {staff.ratingCount} rating{staff.ratingCount !== 1 ? "s" : ""}
              </div>

              <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      color: star <= Math.round(staff.rating ?? 0) ? AMBER : "var(--wm-er-border)",
                      fontSize: 16,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)" }}>
            No rating yet. Tap "Rate" to add one.
          </div>
        )}
      </div>

      {ratingOpen && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: "var(--wm-radius-10)",
            background: AMBER_BG,
          }}
        >
          <div
            style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 8 }}
          >
            Select Rating
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onRatingChange(value)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--wm-radius-10)",
                  border:
                    ratingVal === value ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
                  background: ratingVal === value ? AMBER : "#fff",
                  color: ratingVal === value ? "#fff" : "var(--wm-er-text)",
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {value}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onSubmitRating}
              style={{ background: AMBER, fontSize: 12, padding: "6px 16px" }}
            >
              Submit
            </button>

            <button
              type="button"
              onClick={onCancelRating}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "var(--wm-er-muted)",
                fontWeight: 700,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
