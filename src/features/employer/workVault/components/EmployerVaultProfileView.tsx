// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultProfileView.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\EmployerVaultProfileView.tsx

import { useMemo, useSyncExternalStore } from "react";
import type { VaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";
import type { VaultFolder, VaultDocument } from "../../../employee/workVault/types/vaultTypes";
import { VAULT_FEATURE_FLAGS } from "../../../employee/workVault/constants/vaultFeatureFlags";
import { VaultIdentityCard } from "../../../employee/workVault/components/VaultIdentityCard";
import { VaultWorkStatsCard } from "../../../employee/workVault/components/VaultWorkStatsCard";
import { VaultPerformanceCard } from "../../../employee/workVault/components/VaultPerformanceCard";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackApprovedSummarySnapshot,
  type CareerEmploymentFeedbackTag,
} from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { WorkFeedbackSummaryCard } from "../../../../shared/employmentFeedback/WorkFeedbackSummaryCard";
import { EmployerVaultSectionHead } from "./EmployerVaultSectionHead";
import { EmployerVaultLockedSection } from "./EmployerVaultLockedSection";
import { EmployerVaultSkillTags } from "./EmployerVaultSkillTags";
import { EmployerVaultSummaryView } from "./EmployerVaultSummaryView";
import { EmployerVaultExperienceView } from "./EmployerVaultExperienceView";
import { EmployerVaultEducationView } from "./EmployerVaultEducationView";
import { EmployerVaultReferencesView } from "./EmployerVaultReferencesView";
import { EmployerVaultAchievementsView } from "./EmployerVaultAchievementsView";
import { EmployerVaultActivityView } from "./EmployerVaultActivityView";
import { EmployerVaultFolderView } from "./EmployerVaultFolderView";

type Props = {
  data: VaultSectionData;
  unlocked: boolean;
  folders?: VaultFolder[];
  documents?: VaultDocument[];
};

function parseApprovedFeedbackSnapshot(
  raw: string,
): CareerEmploymentFeedbackApprovedSummarySnapshot {
  try {
    const parsed = JSON.parse(raw) as CareerEmploymentFeedbackApprovedSummarySnapshot;
    return { tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [] };
  } catch {
    return { tasks: [] };
  }
}

function getUniqueFeedbackTags(
  tasks: CareerEmploymentFeedbackApprovedSummarySnapshot["tasks"],
): CareerEmploymentFeedbackTag[] {
  const tags = new Set<CareerEmploymentFeedbackTag>();

  for (const task of tasks) {
    for (const tag of task.selectedTags ?? []) {
      tags.add(tag);
    }
  }

  return [...tags];
}

export function EmployerVaultProfileView({ data, unlocked, folders = [], documents = [] }: Props) {
  const workerId = data.identity.uniqueId ?? "";

  const feedbackRaw = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    () => careerEmploymentFeedbackStorage.getApprovedSummarySnapshot(workerId),
    () => careerEmploymentFeedbackStorage.getApprovedSummarySnapshot(workerId),
  );

  const approvedFeedback = useMemo(() => parseApprovedFeedbackSnapshot(feedbackRaw), [feedbackRaw]);
  const approvedTags = useMemo(
    () => getUniqueFeedbackTags(approvedFeedback.tasks),
    [approvedFeedback.tasks],
  );
  const latestFeedback = approvedFeedback.tasks[0] ?? null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {VAULT_FEATURE_FLAGS.identity && (
        <div>
          <EmployerVaultSectionHead number={1} title="Identity & Verification" />
          <VaultIdentityCard
            fullName={data.identity.fullName}
            city={data.identity.city}
            uniqueId={data.identity.uniqueId}
            photoDataUrl={data.identity.photoDataUrl}
            phoneVerified={data.identity.phoneVerified}
            emailVerified={data.identity.emailVerified}
          />
        </div>
      )}

      {VAULT_FEATURE_FLAGS.workStats && (
        <div>
          <EmployerVaultSectionHead number={4} title="Work Stats" />
          <VaultWorkStatsCard stats={data.workStats} />
        </div>
      )}

      {VAULT_FEATURE_FLAGS.performanceRecord && (
        <div>
          <EmployerVaultSectionHead number={7} title="Performance Record" />
          <VaultPerformanceCard data={data.performance} showTips={false} />
        </div>
      )}

      {unlocked && approvedTags.length > 0 && (
        <div>
          <EmployerVaultSectionHead number={8} title="Approved Work Feedback Summary" />
          <WorkFeedbackSummaryCard
            tags={approvedTags}
            companyName={latestFeedback?.companyName}
            jobTitle={latestFeedback?.jobTitle}
            displayMode="publicReference"
            subtitle="Approved structured feedback from completed Career employment records."
          />
        </div>
      )}

      {VAULT_FEATURE_FLAGS.skillsAssessment && (
        <div>
          <EmployerVaultSectionHead number={6} title="Skills Assessment" />
          <EmployerVaultSkillTags skills={data.skills} />
        </div>
      )}

      {VAULT_FEATURE_FLAGS.professionalSummary && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={2} title="Professional Summary" />
              <EmployerVaultSummaryView data={data.professionalSummary} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={2} title="Professional Summary" />
          )}
        </div>
      )}

      {VAULT_FEATURE_FLAGS.workExperience && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={3} title="Work Experience" />
              <EmployerVaultExperienceView entries={data.workExperience} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={3} title="Work Experience" />
          )}
        </div>
      )}

      {VAULT_FEATURE_FLAGS.education && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={5} title="Education & Certifications" />
              <EmployerVaultEducationView data={data.education} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={5} title="Education & Certifications" />
          )}
        </div>
      )}

      {VAULT_FEATURE_FLAGS.references && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={9} title="Employer Reviews" />
              <EmployerVaultReferencesView refs={data.references} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={9} title="Employer Reviews" />
          )}
        </div>
      )}

      {VAULT_FEATURE_FLAGS.achievements && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={10} title="Achievements & Milestones" />
              <EmployerVaultAchievementsView achievements={data.achievements} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={10} title="Achievements & Milestones" />
          )}
        </div>
      )}

      {VAULT_FEATURE_FLAGS.activity && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={11} title="Activity & Engagement" />
              <EmployerVaultActivityView data={data.activity} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={11} title="Activity & Engagement" />
          )}
        </div>
      )}

      {VAULT_FEATURE_FLAGS.documents && unlocked && folders.length > 0 && (
        <div>
          <EmployerVaultSectionHead number={12} title="Documents" />
          <EmployerVaultFolderView folders={folders} documents={documents} />
        </div>
      )}

      {VAULT_FEATURE_FLAGS.documents && !unlocked && (
        <EmployerVaultLockedSection sectionNumber={12} title="Documents" />
      )}
    </div>
  );
}
