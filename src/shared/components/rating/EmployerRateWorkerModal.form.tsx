import { StarRating } from "./StarRating";
import { RatingTagSelector } from "./RatingTagSelector";
import { EMPLOYER_WORKER_TAGS } from "../../rating/ratingTags";
import type { EmployerWorkerTag } from "../../rating/ratingTypes";

export function EmployerRateWorkerModalForm({
  editMode,
  workerName,
  stars,
  tags,
  comment,
  hireAgain,
  error,
  submitting,
  onStarsChange,
  onTagsChange,
  onCommentChange,
  onHireAgainChange,
  onSubmit,
}: {
  editMode?: boolean;
  workerName: string;
  stars: number;
  tags: EmployerWorkerTag[];
  comment: string;
  hireAgain: boolean | null;
  error: string;
  submitting: boolean;
  onStarsChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  onTagsChange: (tags: EmployerWorkerTag[]) => void;
  onCommentChange: (value: string) => void;
  onHireAgainChange: (value: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <div style={{ padding: "16px 18px", display: "grid", gap: 16 }}>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(22,163,74,0.06)",
            border: "1px solid rgba(22,163,74,0.18)",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.5,
            color: "var(--wm-er-accent-shift, #16a34a)",
          }}
        >
          {editMode
            ? "Edit your review. This is your only edit — make it count."
            : "Rating is required to close this shift. Honest feedback builds a stronger workforce."}
        </div>

        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--wm-er-border)",
            background: "var(--wm-er-card)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {workerName}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {editMode ? "Update your rating below" : "How did this worker perform?"}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--wm-er-text)",
              marginBottom: 8,
            }}
          >
            Star Rating <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <StarRating value={stars} onChange={onStarsChange} />
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--wm-er-text)",
              marginBottom: 8,
            }}
          >
            What stood out? (optional)
          </div>
          <RatingTagSelector tags={EMPLOYER_WORKER_TAGS} selected={tags} onChange={onTagsChange} />
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--wm-er-text)",
              marginBottom: 6,
            }}
          >
            Comment (optional, max 100 chars)
          </div>
          <input
            type="text"
            className="wm-input"
            placeholder="Brief comment about this worker..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            maxLength={100}
            style={{ width: "100%", fontSize: 12 }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--wm-er-text)",
              marginBottom: 8,
            }}
          >
            Would you hire this worker again? <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => onHireAgainChange(true)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border:
                  hireAgain === true
                    ? "2px solid var(--wm-er-accent-shift, #16a34a)"
                    : "1px solid var(--wm-er-border)",
                background: hireAgain === true ? "rgba(22,163,74,0.08)" : "#fff",
                color:
                  hireAgain === true ? "var(--wm-er-accent-shift, #16a34a)" : "var(--wm-er-muted)",
                cursor: "pointer",
              }}
            >
              &#10003; Yes
            </button>
            <button
              type="button"
              onClick={() => onHireAgainChange(false)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: hireAgain === false ? "2px solid #ef4444" : "1px solid var(--wm-er-border)",
                background: hireAgain === false ? "rgba(239,68,68,0.06)" : "#fff",
                color: hireAgain === false ? "#ef4444" : "var(--wm-er-muted)",
                cursor: "pointer",
              }}
            >
              &#10005; No
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(220,38,38,0.06)",
              fontSize: 12,
              color: "var(--wm-error)",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 18px 16px", borderTop: "1px solid var(--wm-er-border)" }}>
        {!editMode && (
          <div
            style={{
              fontSize: 11,
              color: "var(--wm-er-muted)",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            You can edit this review once within 24 hours
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || stars === 0}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background:
                stars > 0 && hireAgain !== null ? "var(--wm-er-accent-shift, #16a34a)" : "#d1d5db",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: stars > 0 ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "Saving..." : editMode ? "Update Review" : "Submit Rating"}
          </button>
        </div>
      </div>
    </>
  );
}
