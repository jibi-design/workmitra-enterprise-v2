// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerShiftPostCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftPostCard.tsx

import {
  countAppliedAppsForPost,
  getShiftPostStatusColor,
} from "../helpers/employerShiftPosts.helpers";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import { EmployerShiftPostCardBody } from "./shiftPostCard/EmployerShiftPostCardBody";
import { EmployerShiftPostTemplateSaveRow } from "./shiftPostCard/EmployerShiftPostTemplateSaveRow";

type EmployerShiftPostCardProps = {
  post: ShiftPost;
  isSaving: boolean;
  templateName: string;
  onOpen: (postId: string) => void;
  onTemplateNameChange: (value: string) => void;
  onStartSaveTemplate: (post: ShiftPost) => void;
  onCancelSaveTemplate: () => void;
  onSaveTemplate: (post: ShiftPost) => void;
};

export function EmployerShiftPostCard({
  post,
  isSaving,
  templateName,
  onOpen,
  onTemplateNameChange,
  onStartSaveTemplate,
  onCancelSaveTemplate,
  onSaveTemplate,
}: EmployerShiftPostCardProps) {
  const appliedCount = countAppliedAppsForPost(post.id);
  const needsAnalysis = post.analysisStatus !== "done";
  const statusColor = getShiftPostStatusColor(post);

  return (
    <div className="wm-er-card" style={{ padding: 0, overflow: "hidden" }}>
      <EmployerShiftPostCardBody
        post={post}
        appliedCount={appliedCount}
        needsAnalysis={needsAnalysis}
        statusColor={statusColor}
        onOpen={onOpen}
      />

      <EmployerShiftPostTemplateSaveRow
        post={post}
        isSaving={isSaving}
        templateName={templateName}
        onTemplateNameChange={onTemplateNameChange}
        onStartSaveTemplate={onStartSaveTemplate}
        onCancelSaveTemplate={onCancelSaveTemplate}
        onSaveTemplate={onSaveTemplate}
      />
    </div>
  );
}
