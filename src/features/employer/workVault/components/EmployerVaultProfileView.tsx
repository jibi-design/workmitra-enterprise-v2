// src/features/employer/workVault/components/EmployerVaultProfileView.tsx

import type { VaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";
import type { VaultFolder, VaultDocument } from "../../../employee/workVault/types/vaultTypes";
import { VAULT_FEATURE_FLAGS } from "../../../employee/workVault/constants/vaultFeatureFlags";
import { VaultIdentityCard } from "../../../employee/workVault/components/VaultIdentityCard";
import { VaultWorkStatsCard } from "../../../employee/workVault/components/VaultWorkStatsCard";
import { VaultPerformanceCard } from "../../../employee/workVault/components/VaultPerformanceCard";
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

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  data: VaultSectionData;
  unlocked: boolean;
  folders?: VaultFolder[];
  documents?: VaultDocument[];
};

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */
export function EmployerVaultProfileView({
  data,
  unlocked,
  folders = [],
  documents = [],
}: Props) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* ── PUBLIC SECTIONS ── */}

      {/* Section 1: Identity */}
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

      {/* Section 4: Work Stats */}
      {VAULT_FEATURE_FLAGS.workStats && (
        <div>
          <EmployerVaultSectionHead number={4} title="Work Stats" />
          <VaultWorkStatsCard stats={data.workStats} />
        </div>
      )}

      {/* Section 7: Performance */}
      {VAULT_FEATURE_FLAGS.performanceRecord && (
        <div>
          <EmployerVaultSectionHead number={7} title="Performance Record" />
          <VaultPerformanceCard data={data.performance} showTips={false} />
        </div>
      )}

      {/* Section 6: Skills */}
      {VAULT_FEATURE_FLAGS.skillsAssessment && (
        <div>
          <EmployerVaultSectionHead number={6} title="Skills Assessment" />
          <EmployerVaultSkillTags skills={data.skills} />
        </div>
      )}

      {/* ── OTP-PROTECTED SECTIONS ── */}

      {/* Section 2: Professional Summary */}
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

      {/* Section 3: Work Experience */}
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

      {/* Section 5: Education */}
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

      {/* Section 8: References */}
      {VAULT_FEATURE_FLAGS.references && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={8} title="Employer Reviews" />
              <EmployerVaultReferencesView refs={data.references} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={8} title="Employer Reviews" />
          )}
        </div>
      )}

      {/* Section 9: Achievements */}
      {VAULT_FEATURE_FLAGS.achievements && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={9} title="Achievements & Milestones" />
              <EmployerVaultAchievementsView achievements={data.achievements} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={9} title="Achievements & Milestones" />
          )}
        </div>
      )}

      {/* Section 10: Activity */}
      {VAULT_FEATURE_FLAGS.activity && (
        <div>
          {unlocked ? (
            <>
              <EmployerVaultSectionHead number={10} title="Activity & Engagement" />
              <EmployerVaultActivityView data={data.activity} />
            </>
          ) : (
            <EmployerVaultLockedSection sectionNumber={10} title="Activity & Engagement" />
          )}
        </div>
      )}

      {/* Documents (OTP-protected) */}
      {VAULT_FEATURE_FLAGS.documents && unlocked && folders.length > 0 && (
        <div>
          <EmployerVaultSectionHead number={11} title="Documents" />
          <EmployerVaultFolderView folders={folders} documents={documents} />
        </div>
      )}

      {VAULT_FEATURE_FLAGS.documents && !unlocked && (
        <EmployerVaultLockedSection sectionNumber={11} title="Documents" />
      )}
    </div>
  );
}