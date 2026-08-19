/** Job Mitra | ShiftSearchResultsList — virtualized discoverable shifts (4-state) */

import type { CSSProperties, MouseEvent } from "react";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EnterpriseEmpty, EnterpriseSkeleton } from "../../../../shared/components/enterprise";
import { isAlreadyApplied } from "../../shiftJobs/helpers/shiftSearchHelpers";
import type { ShiftSearchFeedStatus } from "../services/shiftSearchFeed.service";
import type { ShiftPostDemo } from "../types/shiftSearch.types";
import { ShiftSearchResultCard } from "./ShiftSearchResultCard";
import {
  fitVirtualListViewportPx,
  virtualListNeedsInnerScroll,
} from "../../../../shared/layout/fitVirtualListViewport";

const SHIFT_GREEN = "var(--wm-shift-accent, #16a34a)";
const TEXT_DARK = "#0f172a";
const ROW_ESTIMATE_PX = 176;

type Props = {
  feedStatus: ShiftSearchFeedStatus;
  feedErrorMessage: string;
  discoverableCount: number;
  filteredPosts: ShiftPostDemo[];
  hasFilters: boolean;
  quickApplyEnabled: boolean;
  appliedIds: Set<string>;
  onOpenDetails: (postId: string) => void;
  onQuickApply: (event: MouseEvent, postId: string) => void;
  onClearFilters: () => void;
  onOpenProfile: () => void;
  onRetryFeed: () => void;
};

const SECTION_HEADER_STYLE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "0 2px",
};

export function ShiftSearchResultsList({
  feedStatus,
  feedErrorMessage,
  discoverableCount,
  filteredPosts,
  hasFilters,
  quickApplyEnabled,
  appliedIds,
  onOpenDetails,
  onQuickApply,
  onClearFilters,
  onOpenProfile,
  onRetryFeed,
}: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  // TanStack Virtual intentionally returns unstable function identities.
  // eslint-disable-next-line react-hooks/incompatible-library -- required for list virtualization
  const virtualizer = useVirtualizer({
    count: filteredPosts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 4,
  });
  const listContentHeight = virtualizer.getTotalSize();
  const listViewportHeight = fitVirtualListViewportPx(listContentHeight, filteredPosts.length, {
    rowEstimatePx: ROW_ESTIMATE_PX,
  });
  const listInnerScroll = virtualListNeedsInnerScroll(listContentHeight);

  return (
    <section className="wm-ee-vShift" style={{ marginTop: 18, marginBottom: 20 }}>
      <div style={SECTION_HEADER_STYLE}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 950, color: TEXT_DARK }}>Available Shifts</div>
          <div style={{ marginTop: 3, fontSize: 12, color: "var(--wm-er-muted)" }}>
            {feedStatus === "ready"
              ? `${filteredPosts.length} of ${discoverableCount} shift${discoverableCount !== 1 ? "s" : ""} shown · ${appliedIds.size} application${appliedIds.size === 1 ? "" : "s"}`
              : feedStatus === "loading"
                ? "Loading shifts…"
                : "Couldn't load shifts"}
          </div>
        </div>

        {hasFilters && feedStatus === "ready" && (
          <button
            type="button"
            className="wm-shift-tap"
            onClick={onClearFilters}
            style={{
              padding: "0 14px",
              borderRadius: "var(--wm-radius-pill)",
              border: "1px solid rgba(22,163,74,0.2)",
              background: "rgba(22,163,74,0.08)",
              color: SHIFT_GREEN,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {feedStatus === "loading" ? (
        <div style={{ marginTop: 12 }}>
          <EnterpriseSkeleton count={3} domain="shift" testId="shift-search-skeleton" />
        </div>
      ) : null}

      {feedStatus === "error" ? (
        <div
          className="wm-ent-error"
          role="alert"
          data-testid="shift-search-error"
          style={{ marginTop: 12 }}
        >
          <div className="wm-ent-error__title">Could not load shifts</div>
          <div className="wm-ent-error__subtitle">
            {feedErrorMessage || "We couldn't refresh this list. Try again in a moment."}
          </div>
          <div className="wm-ent-error__actions">
            <button type="button" className="wm-primarybtn" onClick={onRetryFeed}>
              Try again
            </button>
            <button type="button" className="wm-outlineBtn" onClick={onOpenProfile}>
              Update profile
            </button>
          </div>
        </div>
      ) : null}

      {feedStatus === "ready" && filteredPosts.length === 0 ? (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <EnterpriseEmpty
            domain="shift"
            title="No shifts available"
            subtitle={
              hasFilters
                ? "Check back soon or adjust filters"
                : "New shifts will appear here when employers post matching opportunities."
            }
            primaryLabel={hasFilters ? "Clear filters" : "Update profile"}
            onPrimary={hasFilters ? onClearFilters : onOpenProfile}
            secondaryLabel={hasFilters ? "Update profile" : undefined}
            onSecondary={hasFilters ? onOpenProfile : undefined}
            testId="shift-search-empty"
          />
        </div>
      ) : null}

      {feedStatus === "ready" && filteredPosts.length > 0 ? (
        <div
          ref={parentRef}
          data-testid="shift-search-virtual-list"
          style={{
            marginTop: 10,
            height: listViewportHeight,
            overflow: listInnerScroll ? "auto" : "hidden",
            position: "relative",
          }}
        >
          <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const post = filteredPosts[virtualRow.index];
              if (!post) return null;
              const applied = appliedIds.has(post.id) || isAlreadyApplied(post.id);

              return (
                <div
                  key={post.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: 12,
                  }}
                >
                  <ShiftSearchResultCard
                    post={post}
                    applied={applied}
                    quickApplyEnabled={quickApplyEnabled}
                    onOpenDetails={onOpenDetails}
                    onQuickApply={onQuickApply}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
