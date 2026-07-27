/** ReviewCenter request card — open review / workspace CTA. */

import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  getReviewCenterTheme,
  getReviewRequestBody,
  getReviewRequestLabel,
} from "../helpers/reviewCenter.helpers";
import { getRequestTargetPath } from "../helpers/reviewCenterShiftPaths";
import { reviewCenterStorage } from "../storage/reviewCenter.storage";
import type { ReviewCenterRequest } from "../types/reviewCenter.types";

export function ReviewRequestCard({ request }: { request: ReviewCenterRequest }) {
  const nav = useNavigate();
  const theme = getReviewCenterTheme(request.domain);
  const targetPath = getRequestTargetPath(request);
  const canOpen = Boolean(targetPath);

  function openRequest() {
    if (!targetPath) return;
    reviewCenterStorage.markSeen(request.id);
    nav(targetPath);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRequest();
    }
  }

  return (
    <article
      className="wm-reviewCard"
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      onClick={openRequest}
      onKeyDown={handleKeyDown}
      style={{
        borderLeft: `3px solid ${theme.accent}`,
        cursor: canOpen ? "pointer" : "default",
      }}
    >
      <div className="wm-reviewCard__top">
        <div style={{ minWidth: 0 }}>
          <div className="wm-reviewCard__title">{getReviewRequestLabel(request.action)}</div>
          <div className="wm-reviewCard__source">{request.sourceTitle}</div>
        </div>
        <span
          className="wm-reviewCard__badge"
          style={{
            background: theme.softBg,
            border: `1px solid ${theme.border}`,
            color: theme.accent,
          }}
        >
          {theme.label}
        </span>
      </div>
      <div className="wm-reviewCard__body">{getReviewRequestBody(request.action)}</div>
      {canOpen ? (
        <div className="wm-reviewCard__ctaRow">
          <span style={{ fontSize: 12, fontWeight: 800, color: theme.accent }}>
            Open work group
          </span>
        </div>
      ) : null}
    </article>
  );
}
