// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkExperienceSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\WorkExperienceSection.tsx

import { formatDate } from "../../helpers/vaultHomeHelpers";
import type { VaultSectionData } from "../../services/vaultDataAggregator";
import { Chip, SectionCard } from "./VaultProfileSharedUi";

export function WorkExperienceSection({ data }: { data: VaultSectionData["workExperience"] }) {
  return (
    <SectionCard>
      {data.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--wm-emp-muted)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          No work experience yet. Get hired through Career Jobs to build your history.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {data.map((exp, index) => (
            <div
              key={exp.jobId}
              style={{
                paddingTop: index > 0 ? 10 : 0,
                borderTop:
                  index > 0 ? "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
                    {exp.jobTitle}
                  </div>

                  <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 1 }}>
                    {exp.companyName}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 1 }}>
                    {formatDate(exp.hiredAt)} - {exp.endedAt ? formatDate(exp.endedAt) : "Present"}
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
