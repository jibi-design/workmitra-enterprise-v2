// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerShiftPostNextStepText.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\shiftPostCard\EmployerShiftPostNextStepText.tsx

import type { ShiftPost } from "../../storage/employerShift.storage";

type Props = {
  post: ShiftPost;
  appliedCount: number;
  needsAnalysis: boolean;
};

export function EmployerShiftPostNextStepText({ post, appliedCount, needsAnalysis }: Props) {
  const remaining = Math.max(0, post.vacancies - post.confirmedIds.length);

  let text = "Tap to manage this post";

  if (appliedCount > 0 && needsAnalysis) {
    text = `${appliedCount} applied - tap to find best candidates`;
  } else if (!needsAnalysis && post.confirmedIds.length === 0) {
    text = "Candidates ready - tap to confirm workers";
  } else if (post.confirmedIds.length > 0 && post.confirmedIds.length < post.vacancies) {
    text = `${remaining} more needed - tap to continue`;
  } else if (post.confirmedIds.length >= post.vacancies) {
    text = "All workers confirmed";
  }

  return (
    <div
      style={{
        marginTop: 8,
        padding: "6px 10px",
        borderRadius: "var(--wm-radius-8)",
        background: "rgba(15,118,110,0.05)",
        border: "1px solid rgba(15,118,110,0.12)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-accent-shift)" }}>
        {text}
      </div>
    </div>
  );
}
