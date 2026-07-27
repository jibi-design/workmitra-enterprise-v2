// App name: Job Mitra
// File name: VaultProfileTab.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultProfileTab.tsx

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { VAULT_ACCENT, vaultAccentMix } from "../constants/vaultConstants";
import { VAULT_FEATURE_FLAGS } from "../constants/vaultFeatureFlags";
import type { VaultSectionData } from "../services/vaultDataAggregator";
import { statusLabel, statusColor, statusBg, noticePeriodLabel } from "../helpers/vaultHomeHelpers";
import { VaultSectionLock } from "./VaultSectionLock";
import { VaultSectionHead } from "./VaultSectionHead";
import { VaultIdentityCard } from "./VaultIdentityCard";
import { VaultWorkStatsCard } from "./VaultWorkStatsCard";
import { VaultPerformanceCard } from "./VaultPerformanceCard";
import { WorkerLevelCard } from "./WorkerLevelCard";
import { ShareProfileButton } from "../../profile/components/ShareProfileButton";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackApprovedSummarySnapshot,
  type CareerEmploymentFeedbackTag,
} from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { WorkFeedbackSummaryCard } from "../../../../shared/employmentFeedback/WorkFeedbackSummaryCard";
import {
  Chip,
  SectionCard,
  WorkExperienceSection,
  SkillsSection,
  ReviewsSection,
  AchievementsSection,
  ActivitySection,
  EducationSection,
} from "./VaultProfileSections";
import { PlannerGrowthSection } from "./profileSections/PlannerGrowthSection";

type Props = {
  data: VaultSectionData;
  readOnlyEmployerView?: boolean;
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

export function VaultProfileTab({ data: d, readOnlyEmployerView = false }: Props) {
  const nav = useNavigate();
  const workerId = d.identity.uniqueId ?? "";

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
    <div className="wm-vault-profile" style={{ marginTop: 12, display: "grid", gap: 14 }}>
      {VAULT_FEATURE_FLAGS.identity ? (
        <>
          <VaultSectionHead number={1} title="Identity & Verification" />
          <VaultIdentityCard
            fullName={d.identity.fullName}
            city={d.identity.city}
            uniqueId={d.identity.uniqueId}
            photoDataUrl={d.identity.photoDataUrl}
            phoneVerified={d.identity.phoneVerified}
            emailVerified={d.identity.emailVerified}
          />
        </>
      ) : (
        <VaultSectionLock title="Identity & Verification" />
      )}

      {VAULT_FEATURE_FLAGS.professionalSummary ? (
        <>
          <VaultSectionHead number={2} title="Professional Summary" />
          <SectionCard>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text)" }}>
              {d.professionalSummary.headline || "No headline set"}
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <Chip
                label={statusLabel(d.professionalSummary.resolvedStatus)}
                color={statusColor(d.professionalSummary.resolvedStatus)}
                bg={statusBg(d.professionalSummary.resolvedStatus)}
              />
              <Chip
                label={d.professionalSummary.expectedRoleType}
                color={VAULT_ACCENT}
                bg={`${vaultAccentMix(4)}`}
              />
              <Chip
                label={noticePeriodLabel(d.professionalSummary.noticePeriod)}
                color={VAULT_ACCENT}
                bg={`${vaultAccentMix(4)}`}
              />
            </div>

            {d.professionalSummary.resolvedStatus === "employed" &&
              d.professionalSummary.resolvedCompany && (
                <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 6 }}>
                  Currently at {d.professionalSummary.resolvedCompany}
                </div>
              )}
          </SectionCard>
        </>
      ) : (
        <VaultSectionLock title="Professional Summary" />
      )}

      {VAULT_FEATURE_FLAGS.workExperience ? (
        <>
          <VaultSectionHead number={3} title="Work Experience" auto />
          <WorkExperienceSection data={d.workExperience} />
        </>
      ) : (
        <VaultSectionLock title="Work Experience" />
      )}

      {VAULT_FEATURE_FLAGS.workStats ? (
        <>
          <VaultSectionHead number={4} title="Work Stats" auto />
          <VaultWorkStatsCard stats={d.workStats} />
        </>
      ) : (
        <VaultSectionLock title="Work Stats" />
      )}

      {VAULT_FEATURE_FLAGS.plannerGrowth ? (
        <>
          <VaultSectionHead number={5} title="Planner Growth & Epochs" auto />
          <PlannerGrowthSection data={d.plannerGrowth} />
        </>
      ) : (
        <VaultSectionLock title="Planner Growth & Epochs" />
      )}

      {VAULT_FEATURE_FLAGS.education ? (
        <>
          <VaultSectionHead number={6} title="Education & Certifications" />
          <EducationSection data={d.education} />
        </>
      ) : (
        <VaultSectionLock title="Education & Certifications" />
      )}

      {approvedTags.length > 0 && (
        <>
          <VaultSectionHead number={7} title="Approved Work Feedback Summary" auto />
          <WorkFeedbackSummaryCard
            tags={approvedTags}
            companyName={latestFeedback?.companyName}
            jobTitle={latestFeedback?.jobTitle}
            displayMode="publicReference"
            subtitle="Approved structured feedback from completed Career employment records."
          />
        </>
      )}

      {VAULT_FEATURE_FLAGS.skillsAssessment ? (
        <>
          <VaultSectionHead number={8} title="Skills Assessment" />
          <SkillsSection data={d.skills} />
        </>
      ) : (
        <VaultSectionLock title="Skills Assessment" />
      )}

      {VAULT_FEATURE_FLAGS.performanceRecord ? (
        <>
          <VaultSectionHead number={9} title="Performance Record" auto />
          <VaultPerformanceCard data={d.performance} showTips={!readOnlyEmployerView} />
        </>
      ) : (
        <VaultSectionLock title="Performance Record" />
      )}

      <VaultSectionHead number={10} title="Trust Level & Points" auto />
      <WorkerLevelCard />

      {VAULT_FEATURE_FLAGS.references ? (
        <>
          <VaultSectionHead number={11} title="Work Reviews" auto />
          <ReviewsSection data={d.references} />
        </>
      ) : (
        <VaultSectionLock title="Work Reviews" />
      )}

      {VAULT_FEATURE_FLAGS.activity ? (
        <>
          <VaultSectionHead number={12} title="Achievements & Growth Milestones" auto />
          <AchievementsSection data={d.achievements} />
        </>
      ) : (
        <VaultSectionLock title="Achievements & Growth Milestones" />
      )}

      {VAULT_FEATURE_FLAGS.activity ? (
        <>
          <VaultSectionHead number={13} title="Activity & Engagement" />
          <ActivitySection data={d.activity} />
        </>
      ) : (
        <VaultSectionLock title="Activity & Engagement" />
      )}

      {!readOnlyEmployerView && d.identity.uniqueId && <ShareProfileButton />}

      {!readOnlyEmployerView && (
        <button
          type="button"
          className="wm-vault-edit-cta"
          onClick={() => nav(ROUTE_PATHS.employeeProfile)}
        >
          <div className="wm-vault-edit-cta__title">Edit Profile</div>
          <div className="wm-vault-edit-cta__sub">Update summary and skills</div>
        </button>
      )}
    </div>
  );
}
