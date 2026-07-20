// App name: Job Mitra
// File name: ShiftHomeAnalyzedSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftHomeAnalyzedSection.tsx

import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import { IconAnalysis, IconArrowRight } from "./ShiftHomeIcons";

type ShiftHomeAnalyzedSectionProps = {
  posts: ShiftPost[];
  onOpen: (id: string) => void;
};

export function ShiftHomeAnalyzedSection({ posts, onOpen }: ShiftHomeAnalyzedSectionProps) {
  if (posts.length === 0) return null;

  return (
    <div className="wm-er-card wm-shiftHomeAnalyzedCard">
      <div className="wm-shiftHomeSectionTitle">
        <div className="wm-shiftHomeAnalyzedIcon">
          <IconAnalysis />
        </div>
        Recently Analyzed
      </div>

      <div className="wm-shiftHomeAnalyzedList">
        {posts.map((post) => (
          <AnalyzedPostButton key={post.id} post={post} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

function AnalyzedPostButton({ post, onOpen }: { post: ShiftPost; onOpen: (id: string) => void }) {
  const date = post.analyzedAt
    ? new Date(post.analyzedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <button
      type="button"
      className="wm-shiftHomeAnalyzedPostButton"
      onClick={() => onOpen(post.id)}
    >
      <div className="wm-shiftHomeAnalyzedTitleWrap">
        <div className="wm-shiftHomeAnalyzedTitle">
          {post.jobName} - {post.companyName}
        </div>

        <div className="wm-shiftHomeAnalyzedMeta">
          {date} - {post.shortlistIds.length} shortlisted - {post.waitingIds.length} waiting -{" "}
          {post.confirmedIds.length} confirmed
        </div>
      </div>

      <div className="wm-shiftHomeAnalyzedArrow">
        <IconArrowRight />
      </div>
    </button>
  );
}
