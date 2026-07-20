// App name: Job Mitra
// File name: VaultProfileTab.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultProfileTab.tsx

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { VAULT_ACCENT } from "../constants/vaultConstants";
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
} from "./VaultProfileSections";

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
    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
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
                bg={`${VAULT_ACCENT}08`}
              />
              <Chip
                label={noticePeriodLabel(d.professionalSummary.noticePeriod)}
                color={VAULT_ACCENT}
                bg={`${VAULT_ACCENT}08`}
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

      {approvedTags.length > 0 && (
        <>
          <VaultSectionHead number={5} title="Approved Work Feedback Summary" auto />
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
          <VaultSectionHead number={6} title="Skills Assessment" />
          <SkillsSection data={d.skills} />
        </>
      ) : (
        <VaultSectionLock title="Skills Assessment" />
      )}

      {VAULT_FEATURE_FLAGS.performanceRecord ? (
        <>
          <VaultSectionHead number={7} title="Performance Record" auto />
          <VaultPerformanceCard data={d.performance} showTips={!readOnlyEmployerView} />
        </>
      ) : (
        <VaultSectionLock title="Performance Record" />
      )}

      <VaultSectionHead number={8} title="Trust Level & Points" auto />
      <WorkerLevelCard />

      {VAULT_FEATURE_FLAGS.references ? (
        <>
          <VaultSectionHead number={9} title="Shift Work Reviews" auto />
          <ReviewsSection data={d.references} />
        </>
      ) : (
        <VaultSectionLock title="Shift Work Reviews" />
      )}

      {VAULT_FEATURE_FLAGS.activity ? (
        <>
          <VaultSectionHead number={10} title="Achievements & Growth Milestones" auto />
          <AchievementsSection data={d.achievements} />
        </>
      ) : (
        <VaultSectionLock title="Achievements & Growth Milestones" />
      )}

      {VAULT_FEATURE_FLAGS.activity ? (
        <>
          <VaultSectionHead number={11} title="Activity & Engagement" />
          <ActivitySection data={d.activity} />
        </>
      ) : (
        <VaultSectionLock title="Activity & Engagement" />
      )}

      {!readOnlyEmployerView && d.identity.uniqueId && <ShareProfileButton />}

      {!readOnlyEmployerView && (
        <button
          type="button"
          onClick={() => nav(ROUTE_PATHS.employeeProfile)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: `1.5px solid ${VAULT_ACCENT}`,
            background: "transparent",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: VAULT_ACCENT }}>Edit Profile</div>
          <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 2 }}>
            Update summary and skills
          </div>
        </button>
      )}
    </div>
  );
}
