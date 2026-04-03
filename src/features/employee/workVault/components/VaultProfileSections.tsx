// src/features/employee/workVault/components/VaultProfileSections.tsx
//
// Section sub-components for VaultProfileTab.
// WorkExperienceSection, SkillsSection, ReviewsSection,
// AchievementsSection, ActivitySection, EducationSection.

import { VAULT_ACCENT } from "../constants/vaultConstants";
import type { VaultSectionData } from "../services/vaultDataAggregator";
import { formatDate, timeAgo } from "../helpers/vaultHomeHelpers";

/* ------------------------------------------------ */
/* Shared                                           */
/* ------------------------------------------------ */
export function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      padding: "3px 9px", borderRadius: 999,
      background: bg, color, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 12,
      background: "var(--wm-emp-bg)",
      border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
    }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------ */
/* Work Experience Section                          */
/* ------------------------------------------------ */
export function WorkExperienceSection({ data }: { data: VaultSectionData["workExperience"] }) {
  return (
    <SectionCard>
      {data.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", textAlign: "center", padding: "8px 0" }}>
          No work experience yet. Get hired through Career Jobs to build your history.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {data.map((exp, i) => (
            <div
              key={exp.jobId}
              style={{
                paddingTop: i > 0 ? 10 : 0,
                borderTop: i > 0 ? "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
                    {exp.jobTitle}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 1 }}>
                    {exp.companyName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 1 }}>
                    {formatDate(exp.hiredAt)} &mdash; {exp.endedAt ? formatDate(exp.endedAt) : "Present"}
                  </div>
                </div>
                <Chip
                  label={exp.status === "hired" ? "Hired" : exp.status}
                  color={exp.status === "hired" ? "#15803d" : "var(--wm-emp-muted)"}
                  bg={exp.status === "hired" ? "rgba(22,163,74,0.08)" : "rgba(15,23,42,0.04)"}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------ */
/* Education Section                                */
/* ------------------------------------------------ */
export function EducationSection({ data }: { data: VaultSectionData["education"] }) {
  return (
    <SectionCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
            {data.level === "none"
              ? "Not set"
              : data.level.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 2 }}>
            {data.certifications.length} certification{data.certifications.length !== 1 ? "s" : ""}
          </div>
        </div>
        <span style={{ fontSize: 16, color: "var(--wm-emp-muted)" }}>&#8250;</span>
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------ */
/* Skills Section                                   */
/* ------------------------------------------------ */
export function SkillsSection({ data }: { data: VaultSectionData["skills"] }) {
  return (
    <SectionCard>
      {data.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", textAlign: "center", padding: "8px 0" }}>
          No skills added yet. Update your profile to add skills.
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {data.map((skill) => (
            <Chip
              key={skill.name}
              label={`${skill.name} — ${skill.proficiency.charAt(0).toUpperCase()}${skill.proficiency.slice(1)}`}
              color={VAULT_ACCENT}
              bg={`${VAULT_ACCENT}08`}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------ */
/* Employer Reviews Section                         */
/* ------------------------------------------------ */
export function ReviewsSection({ data }: { data: VaultSectionData["references"] }) {
  return (
    <SectionCard>
      {data.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", textAlign: "center", padding: "8px 0" }}>
          No employer reviews yet. Complete assignments to start collecting reviews.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {data.map((ref, i) => {
            const starColor = ref.rating >= 4 ? "#16a34a" : ref.rating >= 2 ? "#f59e0b" : "#94a3b8";
            const barPct = Math.round((ref.rating / 5) * 100);
            return (
              <div
                key={`${ref.companyName}-${i}`}
                style={{
                  paddingTop: i > 0 ? 8 : 0,
                  borderTop: i > 0 ? "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
                    {ref.companyName}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: starColor }}>
                    &#9733; {ref.rating.toFixed(1)}
                  </span>
                </div>
                <div style={{
                  marginTop: 4, height: 4, borderRadius: 999,
                  background: "rgba(15,23,42,0.06)", overflow: "hidden",
                }}>
                  <div style={{
                    width: `${barPct}%`, height: "100%",
                    borderRadius: 999, background: starColor,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                {ref.rating >= 4 && (
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#16a34a", marginTop: 3 }}>
                    Reference
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

/* ------------------------------------------------ */
/* Achievements Section                             */
/* ------------------------------------------------ */
export function AchievementsSection({ data }: { data: VaultSectionData["achievements"] }) {
  return (
    <SectionCard>
      {data.filter((a) => a.earned).length === 0 && (
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", textAlign: "center", padding: "8px 0" }}>
          No achievements yet. Start completing shifts and career jobs to earn badges.
        </div>
      )}
      <div style={{ display: "grid", gap: 6 }}>
        {data.map((ach) => (
          <div
            key={ach.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 10,
              background: ach.earned ? `${VAULT_ACCENT}06` : "rgba(15,23,42,0.02)",
              border: ach.earned ? `1px solid ${VAULT_ACCENT}18` : "1px solid rgba(15,23,42,0.05)",
              opacity: ach.earned ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0, filter: ach.earned ? "none" : "grayscale(1)" }}>
              {ach.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ach.earned ? "var(--wm-emp-text)" : "var(--wm-emp-muted)" }}>
                {ach.title}
              </div>
              <div style={{ fontSize: 10, color: "var(--wm-emp-muted)", marginTop: 1 }}>
                {ach.description}
              </div>
            </div>
            {ach.earned && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                background: "rgba(22,163,74,0.08)", color: "#15803d",
                border: "1px solid rgba(22,163,74,0.18)", whiteSpace: "nowrap",
              }}>
                Earned
              </span>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------ */
/* Activity Section                                 */
/* ------------------------------------------------ */
export function ActivitySection({ data }: { data: VaultSectionData["activity"] }) {
  return (
    <SectionCard>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>Member since</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text)" }}>
            {formatDate(data.memberSince)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>Last active</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text)" }}>
            {timeAgo(data.lastActive)}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}