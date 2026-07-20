// App name: Job Mitra
// File name: ReviewCenterNudgeCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\components\ReviewCenterNudgeCard.tsx

import type { CSSProperties, KeyboardEvent } from "react";
import { getReviewCenterTheme } from "../helpers/reviewCenter.helpers";
import type { ReviewDomain } from "../types/reviewCenter.types";

type ReviewCenterNudgeCardProps = {
  domain: ReviewDomain;
  title: string;
  body: string;
  count: number;
  actionLabel: string;
  onOpen: () => void;
};

export function ReviewCenterNudgeCard({
  domain,
  title,
  body,
  count,
  actionLabel,
  onOpen,
}: ReviewCenterNudgeCardProps) {
  if (count <= 0) return null;

  const theme = getReviewCenterTheme(domain);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter") {
      onOpen();
    }
  }

  return (
    <section
      className="wm-er-card wm-er-accentCard"
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      style={
        {
          cursor: "pointer",
          "--wm-er-accent": theme.accent,
          "--wm-er-wash": theme.softBg,
        } as CSSProperties
      }
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div>
              <div className="wm-er-cardTitle">{title}</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                {body}
              </div>
            </div>
          </div>

          <span
            style={{
              minWidth: 28,
              height: 28,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.softBg,
              border: `1px solid ${theme.border}`,
              color: theme.accent,
              fontSize: 12,
              fontWeight: 950,
              flexShrink: 0,
            }}
          >
            {count}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ fontSize: 12, fontWeight: 950, color: theme.accent }}>{actionLabel}</div>
      </div>
    </section>
  );
}
