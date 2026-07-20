// App name: Job Mitra
// File name: EmployerShiftPostsList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftPostsList.tsx

import { PulseTargetIndicator } from "../../../../features/pulse/PulseTargetIndicator";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import { EmployerShiftPostCard } from "./EmployerShiftPostCard";
import { EmployerShiftPlannerGroupPromoCard } from "./EmployerShiftPlannerGroupPromoCard";
import type { EmployerPlannerPostGroup } from "../../planner/helpers/employerPlannerPostsGrouping";
import { IconPlus } from "./EmployerShiftPostsHeader";

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
        </div>
      ))}
    </div>
  );
}

function EmptyPostsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="wm-er-card wm-shiftPostsEmptyState">
      <div className="wm-shiftPostsEmptyTitle">Create your first shift post</div>

      <div className="wm-shiftPostsEmptyText">
        Start with a clear title, pay, shift time, location, and must-have requirements. Workers
        will see the post and apply from the employee side.
      </div>

      <div className="wm-shiftPostsRecoveryGrid">
        <RecoveryTip text="Use simple job names like Helper, Billing Staff, Delivery Support, or Cleaner." />
        <RecoveryTip text="Keep pay, reporting time, and dress code honest. Avoid fake hiring or payment claims." />
        <RecoveryTip text="After applications arrive, use candidate filters, compare mode, shortlist, backup, and vacancy-safe confirmation." />
      </div>

      <button
        className="wm-primarybtn wm-shiftPostsEmptyCreateBtn"
        type="button"
        onClick={onCreate}
      >
        <IconPlus /> Create Shift Post
      </button>
    </div>
  );
}

function RecoveryTip({ text }: { readonly text: string }) {
  return <div className="wm-shiftPostsRecoveryTip">{text}</div>;
}
