// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EducationSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\EducationSection.tsx

import { StatusBadge } from "../../../../../shared/components/enterprise/StatusBadge";
import { EDUCATION_LEVEL_LABELS } from "../../constants/vaultConstants";
import type { VaultSectionData } from "../../services/vaultDataAggregator";
import { SectionCard } from "./VaultProfileSharedUi";

export function EducationSection({ data }: { data: VaultSectionData["education"] }) {
  const levelLabel = EDUCATION_LEVEL_LABELS[data.level] ?? EDUCATION_LEVEL_LABELS.none;

  return (
    <SectionCard>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
            {levelLabel}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 4 }}>
            {data.certifications.length} certification
            {data.certifications.length !== 1 ? "s" : ""}
          </div>
        </div>
        <StatusBadge
          label={data.level === "none" ? "Not set" : "On file"}
          tone={data.level === "none" ? "pending" : "active"}
        />
      </div>

      {data.certifications.length > 0 ? (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {data.certifications.map((cert) => (
            <div
              key={cert.id}
              style={{
                paddingTop: 8,
                borderTop: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text)" }}>
                {cert.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 2 }}>
                {cert.issuedBy || "Issuer not set"}
                {cert.issueDate ? ` · ${cert.issueDate}` : ""}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}
