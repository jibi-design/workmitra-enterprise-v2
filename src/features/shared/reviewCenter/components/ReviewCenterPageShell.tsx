/** ReviewCenter page shell — hero + request list + optional role content. */

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getReviewCenterTitle } from "../helpers/reviewCenter.helpers";
import { reviewCenterStorage } from "../storage/reviewCenter.storage";
import type { ReviewRole } from "../types/reviewCenter.types";
import { ReviewRequestCard } from "./ReviewRequestCard";

type ReviewCenterPageShellProps = {
  role: ReviewRole;
  hasExtraContent?: boolean;
  children?: ReactNode;
};

export function ReviewCenterPageShell({
  role,
  hasExtraContent = false,
  children,
}: ReviewCenterPageShellProps) {
  const [requests, setRequests] = useState(() => reviewCenterStorage.getActiveForRole(role));

  useEffect(() => {
    return reviewCenterStorage.subscribe(() => {
      setRequests(reviewCenterStorage.getActiveForRole(role));
    });
  }, [role]);

  const openCount = requests.length;

  return (
    <div className="wm-reviewCenterShell" style={{ paddingBottom: 24 }}>
      <section className="wm-reviewHero">
        <div className="wm-reviewHero__score">{openCount > 0 ? openCount : "—"}</div>
        <div
          className="wm-reviewHero__stars"
          style={{ opacity: openCount > 0 ? 1 : 0.35 }}
          aria-hidden="true"
        >
          ★★★★★
        </div>
        <div className="wm-reviewHero__meta">
          {openCount > 0
            ? `${openCount} open review request${openCount === 1 ? "" : "s"}`
            : "All caught up"}
        </div>
        <div className="wm-reviewHero__title">{getReviewCenterTitle(role)}</div>
        <div className="wm-reviewHero__sub">
          Manage completed work reviews and rating requests from one place.
        </div>
      </section>

      {children}

      {openCount > 0 ? (
        <section style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {requests.map((request) => (
            <ReviewRequestCard key={request.id} request={request} />
          ))}
        </section>
      ) : hasExtraContent ? null : (
        <section style={{ marginTop: 12 }}>
          <div className="wm-reviewEmpty">
            <div className="wm-reviewEmpty__icon" aria-hidden="true">
              ★
            </div>
            <div className="wm-reviewEmpty__title">No reviews waiting</div>
            <div className="wm-reviewEmpty__sub">
              Completed shift or career work reviews will appear here when action is needed.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
