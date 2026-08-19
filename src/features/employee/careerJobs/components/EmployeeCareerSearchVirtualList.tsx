/** Virtualized career search cards for large catalogs. */

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  fitVirtualListViewportPx,
  virtualListNeedsInnerScroll,
} from "../../../../shared/layout/fitVirtualListViewport";
import type {
  CareerSearchApplicationState,
  CareerSearchPost,
} from "../helpers/careerSearchHelpers";
import { EmployeeCareerJobCard } from "./EmployeeCareerJobCard";

const ROW_ESTIMATE_PX = 214;

type Props = {
  posts: CareerSearchPost[];
  savedJobIds: string[];
  applicationStatusByPostId: Record<string, CareerSearchApplicationState>;
  onOpen: (id: string) => void;
  onOpenApplications: () => void;
  onToggleSaved: (id: string) => void;
};

export function EmployeeCareerSearchVirtualList({
  posts,
  savedJobIds,
  applicationStatusByPostId,
  onOpen,
  onOpenApplications,
  onToggleSaved,
}: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  // TanStack Virtual intentionally returns unstable function identities.
  // eslint-disable-next-line react-hooks/incompatible-library -- required for list virtualization
  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 4,
  });
  const listContentHeight = virtualizer.getTotalSize();
  const listViewportHeight = fitVirtualListViewportPx(listContentHeight, posts.length, {
    rowEstimatePx: ROW_ESTIMATE_PX,
  });
  const listInnerScroll = virtualListNeedsInnerScroll(listContentHeight);

  return (
    <div
      ref={parentRef}
      data-testid="career-search-virtual-list"
      style={{
        height: listViewportHeight,
        overflow: listInnerScroll ? "auto" : "hidden",
        position: "relative",
      }}
    >
      <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const post = posts[virtualRow.index];
          if (!post) return null;
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
              <EmployeeCareerJobCard
                post={post}
                isSaved={savedJobIds.includes(post.id)}
                applicationStatus={applicationStatusByPostId[post.id]}
                variant="standard"
                onOpen={onOpen}
                onOpenApplications={onOpenApplications}
                onToggleSaved={onToggleSaved}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
