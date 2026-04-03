// src/features/employer/workforceOps/components/WorkforcePostEventRatingModal.tsx
//
// Post-event rating modal — rate all active group members after group completion.
// MANDATORY: No skip option. All members must be rated before closing.
// Updates staff weighted average via workforceGroupMemberService.

import { useState, useMemo, useCallback } from "react";
import { workforceGroupMemberService } from "../services/workforceGroupMemberService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { WorkforceGroupMember } from "../types/workforceTypes";
import { IconClose, IconStar } from "./workforceIcons";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  isOpen: boolean;
  groupId: string;
  groupName: string;
  members: WorkforceGroupMember[];
  onClose: () => void;
  onComplete: () => void;
};

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
type RatingEntry = {
  memberId: string;
  rating: number;
  comment: string;
};

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: 16,
};

const modalStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 16,
  width: "100%", maxWidth: 440, maxHeight: "90vh",
  overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};

const headerStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 18px 12px",
  borderBottom: "1px solid var(--wm-er-border)",
};

const bodyStyle: React.CSSProperties = {
  padding: "16px 18px", display: "grid", gap: 14,
};

const footerStyle: React.CSSProperties = {
  padding: "12px 18px 16px",
  borderTop: "1px solid var(--wm-er-border)",
  display: "flex", justifyContent: "flex-end",
};

const memberCardStyle: React.CSSProperties = {
  padding: "12px", borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function WorkforcePostEventRatingModal({
  isOpen,
  groupName,
  members,
  onClose,
  onComplete,
}: Props) {
  const activeMembers = useMemo(
    () => members.filter((m) => m.status === "active"),
    [members],
  );

  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const [ratings, setRatings] = useState<Map<string, RatingEntry>>(() => {
    const map = new Map<string, RatingEntry>();
    for (const m of activeMembers) {
      map.set(m.id, { memberId: m.id, rating: 0, comment: "" });
    }
    return map;
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setRating = useCallback((memberId: string, rating: number) => {
    setRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(memberId);
      if (existing) {
        next.set(memberId, { ...existing, rating: existing.rating === rating ? 0 : rating });
      }
      return next;
    });
    setErrors([]);
  }, []);

  const setComment = useCallback((memberId: string, comment: string) => {
    setRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(memberId);
      if (existing) next.set(memberId, { ...existing, comment });
      return next;
    });
  }, []);

  const rateAll = useCallback((value: number) => {
    setRatings((prev) => {
      const next = new Map(prev);
      for (const [id, entry] of next) {
        next.set(id, { ...entry, rating: value });
      }
      return next;
    });
    setErrors([]);
  }, []);

  const handleSubmit = useCallback(() => {
    const entries = Array.from(ratings.values());
    const unrated = entries.filter((e) => e.rating === 0);
    if (unrated.length > 0) {
      setErrors([`${unrated.length} member${unrated.length !== 1 ? "s" : ""} not rated yet. All members must be rated.`]);
      return;
    }
    setIsSubmitting(true);
    const result = workforceGroupMemberService.rateAllGroupMembers(
      entries.map((e) => ({ memberId: e.memberId, rating: e.rating, comment: e.comment })),
    );
    setIsSubmitting(false);
    if (result.success) {
      onComplete();
    } else {
      setErrors(result.errors ?? ["Failed to save ratings."]);
    }
  }, [ratings, onComplete]);

  const ratedCount = useMemo(
    () => Array.from(ratings.values()).filter((e) => e.rating > 0).length,
    [ratings],
  );

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Rate Your Team
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>{groupName}</div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wm-er-muted)", padding: 4 }}>
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {/* Mandatory notice */}
          <div style={{
            fontSize: 12, color: "var(--wm-er-accent-workforce, #b45309)",
            fontWeight: 600, lineHeight: 1.5,
            padding: "8px 12px", borderRadius: 8,
            background: "rgba(180,83,9,0.06)",
            border: "1px solid rgba(180,83,9,0.18)",
          }}>
            Rating is required to close this group. Rate each member to complete the process.
          </div>

          {/* Quick rate all */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 8,
            background: "rgba(180,83,9,0.06)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-accent-workforce, #b45309)" }}>
              Rate all:
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => rateAll(v)}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: "1px solid var(--wm-er-border)",
                    background: "#fff",
                    color: "var(--wm-er-accent-workforce, #b45309)",
                    fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: "var(--wm-er-muted)", marginLeft: "auto" }}>
              {ratedCount}/{activeMembers.length} rated
            </span>
          </div>

          {/* Member Rating Cards */}
          {activeMembers.map((member) => {
            const entry = ratings.get(member.id);
            const currentRating = entry?.rating ?? 0;
            const currentComment = entry?.comment ?? "";

            return (
              <div key={member.id} style={memberCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                      {member.employeeName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                      {categoryMap.get(member.categoryId) ?? member.categoryId}
                    </div>
                  </div>
                  {currentRating > 0 && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 2,
                      fontSize: 14, fontWeight: 600,
                      color: "var(--wm-er-accent-workforce, #b45309)",
                    }}>
                      <IconStar /> {currentRating}
                    </span>
                  )}
                </div>

                {/* Star buttons */}
                <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRating(member.id, v)}
                      aria-label={`${v} star`}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: currentRating >= v
                          ? "2px solid var(--wm-er-accent-workforce, #b45309)"
                          : "1px solid var(--wm-er-border)",
                        background: currentRating >= v
                          ? "var(--wm-er-accent-workforce, #b45309)"
                          : "#fff",
                        color: currentRating >= v ? "#fff" : "var(--wm-er-muted)",
                        fontSize: 15, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      &#9733;
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <input
                  type="text"
                  className="wm-input"
                  placeholder="Optional comment (max 100 characters)"
                  value={currentComment}
                  onChange={(e) => setComment(member.id, e.target.value)}
                  style={{ width: "100%", fontSize: 12, marginTop: 8 }}
                  maxLength={100}
                />
              </div>
            );
          })}

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
              {errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--wm-error)", fontWeight: 600 }}>{e}</div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — Submit only, no skip */}
        <div style={footerStyle}>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || ratedCount === 0}
            style={{
              background: ratedCount === activeMembers.length
                ? "var(--wm-er-accent-workforce, #b45309)"
                : "#d1d5db",
              fontSize: 13, padding: "8px 20px",
              cursor: ratedCount === 0 ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Saving..." : `Submit Ratings (${ratedCount}/${activeMembers.length})`}
          </button>
        </div>

      </div>
    </div>
  );
}