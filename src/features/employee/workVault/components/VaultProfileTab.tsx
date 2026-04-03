// src/features/employee/workVault/components/VaultProfileTab.tsx
//
// Work Vault Profile tab — orchestrator only.

import { useNavigate } from "react-router-dom";
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
  Chip, SectionCard,
  WorkExperienceSection, EducationSection, SkillsSection,
  ReviewsSection, AchievementsSection, ActivitySection,
} from "./VaultProfileSections";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = { data: VaultSectionData };

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function VaultProfileTab({ data: d }: Props) {
  const nav = useNavigate();

  return (
    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>

      {/* 1. Identity */}
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
      ) : <VaultSectionLock title="Identity & Verification" />}

      {/* 2. Professional Summary */}
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
              <Chip label={d.professionalSummary.expectedRoleType} color={VAULT_ACCENT} bg={`${VAULT_ACCENT}08`} />
              <Chip label={noticePeriodLabel(d.professionalSummary.noticePeriod)} color={VAULT_ACCENT} bg={`${VAULT_ACCENT}08`} />
            </div>
            {d.professionalSummary.resolvedStatus === "employed" && d.professionalSummary.resolvedCompany && (
              <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 6 }}>
                Currently at {d.professionalSummary.resolvedCompany}
              </div>
            )}
          </SectionCard>
        </>
      ) : <VaultSectionLock title="Professional Summary" />}

      {/* 3. Work Experience */}
      {VAULT_FEATURE_FLAGS.workExperience ? (
        <>
          <VaultSectionHead number={3} title="Work Experience" auto />
          <WorkExperienceSection data={d.workExperience} />
        </>
      ) : <VaultSectionLock title="Work Experience" />}

      {/* 4. Work Stats */}
      {VAULT_FEATURE_FLAGS.workStats ? (
        <>
          <VaultSectionHead number={4} title="Work Stats" auto />
          <VaultWorkStatsCard stats={d.workStats} />
        </>
      ) : <VaultSectionLock title="Work Stats" />}

      {/* 5. Education */}
      {VAULT_FEATURE_FLAGS.education ? (
        <>
          <VaultSectionHead number={5} title="Education & Certifications" />
          <EducationSection data={d.education} />
        </>
      ) : <VaultSectionLock title="Education & Certifications" />}

      {/* 6. Skills */}
      {VAULT_FEATURE_FLAGS.skillsAssessment ? (
        <>
          <VaultSectionHead number={6} title="Skills Assessment" />
          <SkillsSection data={d.skills} />
        </>
      ) : <VaultSectionLock title="Skills Assessment" />}

      {/* 7. Performance */}
      {VAULT_FEATURE_FLAGS.performanceRecord ? (
        <>
          <VaultSectionHead number={7} title="Performance Record" auto />
          <VaultPerformanceCard data={d.performance} showTips />
        </>
      ) : <VaultSectionLock title="Performance Record" />}

      {/* Trust Level & Points */}
      <VaultSectionHead number={8} title="Trust Level & Points" auto />
      <WorkerLevelCard />

      {/* 9. Employer Reviews */}
      {VAULT_FEATURE_FLAGS.references ? (
        <>
          <VaultSectionHead number={9} title="Employer Reviews" auto />
          <ReviewsSection data={d.references} />
        </>
      ) : <VaultSectionLock title="Employer Reviews" />}

      {/* 10. Achievements */}
      {VAULT_FEATURE_FLAGS.activity ? (
        <>
          <VaultSectionHead number={10} title="Achievements & Milestones" auto />
          <AchievementsSection data={d.achievements} />
        </>
      ) : <VaultSectionLock title="Achievements & Milestones" />}

      {/* 11. Activity */}
      {VAULT_FEATURE_FLAGS.activity ? (
        <>
          <VaultSectionHead number={11} title="Activity & Engagement" />
          <ActivitySection data={d.activity} />
        </>
      ) : <VaultSectionLock title="Activity & Engagement" />}

      {/* Share Profile */}
      {d.identity.uniqueId && <ShareProfileButton />}

      {/* Edit Profile Button */}
      <button
        type="button"
        onClick={() => nav("/employee/vault/edit-profile")}
        style={{
          width: "100%", padding: "12px", borderRadius: 12,
          border: `1.5px solid ${VAULT_ACCENT}`,
          background: "transparent", cursor: "pointer", textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: VAULT_ACCENT }}>Edit Profile</div>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 2 }}>
          Update summary, education, skills
        </div>
      </button>

    </div>
  );
}