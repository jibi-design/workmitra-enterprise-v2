// App name: Job Mitra
// File name: EmployerShiftPostsList.tsx
// Ultra-Enterprise U3/U4 — SlideOver quick view + EnterpriseEmpty

import { useState, useSyncExternalStore } from "react";
import { PulseTargetIndicator } from "../../../../features/pulse/PulseTargetIndicator";
import {
  EnterpriseEmpty,
  EnterpriseSkeleton,
  SlideOver,
  StatusBadge,
} from "../../../../shared/components/enterprise";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import { EmployerShiftPostCard } from "./EmployerShiftPostCard";
import { EmployerShiftPlannerGroupPromoCard } from "./EmployerShiftPlannerGroupPromoCard";
import type { EmployerPlannerPostGroup } from "../../../shared/planner/ports/plannerShiftJobsBridge";
import {
  countAppliedAppsForPost,
  getShiftPostStatusLabel,
} from "../helpers/employerShiftPosts.helpers";

type EmployerShiftPostsListProps = {
  posts: ShiftPost[];
  planGroups?: EmployerPlannerPostGroup[];
  onOpenPlan?: (planId: string) => void;
  savingPostId: string | null;
  templateName: string;
  onOpen: (postId: string) => void;
  onCreate: () => void;
  onTemplateNameChange: (value: string) => void;
  onStartSaveTemplate: (post: ShiftPost) => void;
  onCancelSaveTemplate: () => void;
  onSaveTemplate: (post: ShiftPost) => void;
};

export function EmployerShiftPostsList({
  posts,
  planGroups = [],
  onOpenPlan,
  savingPostId,
  templateName,
  onOpen,
  onCreate,
  onTemplateNameChange,
  onStartSaveTemplate,
  onCancelSaveTemplate,
  onSaveTemplate,
}: EmployerShiftPostsListProps) {
  const [quickPost, setQuickPost] = useState<ShiftPost | null>(null);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!hydrated) {
    return <EnterpriseSkeleton domain="shift" count={3} testId="shift-posts-skeleton" />;
  }

  return (
    <div className="wm-shiftPostsList">
      {posts.length === 0 && planGroups.length === 0 && <EmptyPostsState onCreate={onCreate} />}

      {planGroups.map((group) => (
        <div key={group.planId} className="wm-shiftPostsPostShell">
          <EmployerShiftPlannerGroupPromoCard
            group={group}
            onOpenPlan={onOpenPlan ?? (() => undefined)}
          />
        </div>
      ))}

      {posts.map((post) => (
        <div key={post.id} className="wm-shiftPostsPostShell">
          <PulseTargetIndicator notificationId="SHIFT_APPLICATION_RECEIVED" postId={post.id} />

          <EmployerShiftPostCard
            post={post}
            isSaving={savingPostId === post.id}
            templateName={templateName}
            onOpen={onOpen}
            onTemplateNameChange={onTemplateNameChange}
            onStartSaveTemplate={onStartSaveTemplate}
            onCancelSaveTemplate={onCancelSaveTemplate}
            onSaveTemplate={onSaveTemplate}
          />

          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="wm-outlineBtn"
              data-testid={`shift-post-quick-view-${post.id}`}
              onClick={() => setQuickPost(post)}
              style={{ minHeight: 36, fontSize: 12, fontWeight: 800 }}
            >
              Quick view
            </button>
          </div>
        </div>
      ))}

      <SlideOver
        open={Boolean(quickPost)}
        onClose={() => setQuickPost(null)}
        title={quickPost?.jobName ?? "Shift details"}
        subtitle={quickPost?.companyName}
        testId="shift-detail-slideover"
        footer={
          quickPost ? (
            <>
              <button type="button" className="wm-outlineBtn" onClick={() => setQuickPost(null)}>
                Close
              </button>
              <button
                type="button"
                className="wm-primarybtn"
                data-testid="shift-detail-slideover-open-full"
                onClick={() => {
                  const id = quickPost.id;
                  setQuickPost(null);
                  onOpen(id);
                }}
              >
                Open full dashboard
              </button>
            </>
          ) : null
        }
      >
        {quickPost ? <ShiftPostQuickViewBody post={quickPost} /> : null}
      </SlideOver>
    </div>
  );
}

function ShiftPostQuickViewBody({ post }: { post: ShiftPost }) {
  const appliedCount = countAppliedAppsForPost(post.id);
  const openSlots = Math.max(0, post.vacancies - post.confirmedIds.length);

  return (
    <div style={{ display: "grid", gap: 12 }} data-testid="shift-detail-slideover-body">
      <StatusBadge label={getShiftPostStatusLabel(post)} tone="active" accent="shift" />
      <div style={{ fontSize: 13, color: "var(--wm-er-muted)" }}>
        {post.locationName} · {post.vacancies} vacancies · {openSlots} open · {appliedCount} applied
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
        Confirmed {post.confirmedIds.length} · Shortlist {post.shortlistIds.length} · Waiting{" "}
        {post.waitingIds.length}
      </div>
    </div>
  );
}

function EmptyPostsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <EnterpriseEmpty
        domain="shift"
        title="No shifts posted yet"
        subtitle="Create your first shift post with pay, time, location, and must-have requirements."
        primaryLabel="Create Shift Post"
        onPrimary={onCreate}
        testId="shift-posts-empty"
      />
      <div className="wm-shiftPostsRecoveryGrid">
        <RecoveryTip text="Use simple job names like Helper, Billing Staff, Delivery Support, or Cleaner." />
        <RecoveryTip text="Keep pay, reporting time, and dress code honest. Avoid fake hiring or payment claims." />
        <RecoveryTip text="After applications arrive, use candidate filters, compare mode, shortlist, backup, and vacancy-safe confirmation." />
      </div>
    </div>
  );
}

function RecoveryTip({ text }: { readonly text: string }) {
  return (
    <div className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shiftPostsRecoveryTip">
      {text}
    </div>
  );
}
