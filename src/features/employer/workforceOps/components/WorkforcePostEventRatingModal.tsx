// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforcePostEventRatingModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforcePostEventRatingModal.tsx

import { useCallback, useMemo, useState } from "react";
import type { WorkforceGroupMember } from "../../../../shared/domains/workforce/types/workforceTypes";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceGroupMemberService } from "../services/workforceGroupMemberService";
import { WorkforcePostEventRatingMemberCard } from "./WorkforcePostEventRatingMemberCard";
import { WorkforcePostEventRatingModalShell } from "./WorkforcePostEventRatingModalShell";
import { WorkforcePostEventRatingRateAllBar } from "./WorkforcePostEventRatingRateAllBar";

type Props = {
  isOpen: boolean;
  groupId: string;
  groupName: string;
  members: WorkforceGroupMember[];
  onClose: () => void;
  onComplete: () => void;
};

type RatingEntry = {
  memberId: string;
  rating: number;
  comment: string;
};

export function WorkforcePostEventRatingModal({
  isOpen,
  groupName,
  members,
  onClose,
  onComplete,
}: Props) {
  const activeMembers = useMemo(
    () => members.filter((member) => member.status === "active"),
    [members],
  );

  const categories = useMemo(() => workforceCategoryService.getAll(), []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categories) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categories]);

  const [ratings, setRatings] = useState<Map<string, RatingEntry>>(() => {
    const map = new Map<string, RatingEntry>();

    for (const member of activeMembers) {
      map.set(member.id, { memberId: member.id, rating: 0, comment: "" });
    }

    return map;
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setRating = useCallback((memberId: string, rating: number) => {
    setRatings((previous) => {
      const next = new Map(previous);
      const existing = next.get(memberId);

      if (existing) {
        next.set(memberId, { ...existing, rating: existing.rating === rating ? 0 : rating });
      }

      return next;
    });

    setErrors([]);
  }, []);

  const setComment = useCallback((memberId: string, comment: string) => {
    setRatings((previous) => {
      const next = new Map(previous);
      const existing = next.get(memberId);

      if (existing) {
        next.set(memberId, { ...existing, comment });
      }

      return next;
    });
  }, []);

  const rateAll = useCallback((value: number) => {
    setRatings((previous) => {
      const next = new Map(previous);

      for (const [id, entry] of next) {
        next.set(id, { ...entry, rating: value });
      }

      return next;
    });

    setErrors([]);
  }, []);

  const handleSubmit = useCallback(() => {
    const entries = Array.from(ratings.values());
    const unrated = entries.filter((entry) => entry.rating === 0);

    if (unrated.length > 0) {
      setErrors([
        `${unrated.length} member${unrated.length !== 1 ? "s" : ""} not rated yet. All members must be rated.`,
      ]);
      return;
    }

    setIsSubmitting(true);

    const result = workforceGroupMemberService.rateAllGroupMembers(
      entries.map((entry) => ({
        memberId: entry.memberId,
        rating: entry.rating,
        comment: entry.comment,
      })),
    );

    setIsSubmitting(false);

    if (result.success) {
      onComplete();
      return;
    }

    setErrors(result.errors ?? ["Failed to save ratings."]);
  }, [ratings, onComplete]);

  const ratedCount = useMemo(
    () => Array.from(ratings.values()).filter((entry) => entry.rating > 0).length,
    [ratings],
  );

  if (!isOpen) return null;

  return (
    <WorkforcePostEventRatingModalShell
      groupName={groupName}
      errors={errors}
      isSubmitting={isSubmitting}
      ratedCount={ratedCount}
      activeMemberCount={activeMembers.length}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-accent-workforce, #b45309)",
          fontWeight: 600,
          lineHeight: 1.5,
          padding: "8px 12px",
          borderRadius: "var(--wm-radius-8)",
          background: "rgba(180,83,9,0.06)",
          border: "1px solid rgba(180,83,9,0.18)",
        }}
      >
        Rating is required to close this group. Rate each member to complete the process.
      </div>

      <WorkforcePostEventRatingRateAllBar
        ratedCount={ratedCount}
        activeMemberCount={activeMembers.length}
        onRateAll={rateAll}
      />

      {activeMembers.map((member) => {
        const entry = ratings.get(member.id);

        return (
          <WorkforcePostEventRatingMemberCard
            key={member.id}
            member={member}
            categoryName={categoryMap.get(member.categoryId) ?? member.categoryId}
            currentRating={entry?.rating ?? 0}
            currentComment={entry?.comment ?? ""}
            onSetRating={setRating}
            onSetComment={setComment}
          />
        );
      })}
    </WorkforcePostEventRatingModalShell>
  );
}
