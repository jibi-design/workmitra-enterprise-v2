// src/features/employer/workVault/components/EmployerVaultEducationView.tsx

import type { VaultEducation } from "../../../employee/workVault/types/vaultProfileTypes";

const LEVEL_LABELS: Record<string, string> = {
  none: "Not specified",
  high_school: "High School",
  diploma: "Diploma",
  degree: "Degree",
  masters: "Masters",
  phd: "PhD",
};

type Props = {
  data: VaultEducation;
};

export function EmployerVaultEducationView({ data }: Props) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "var(--wm-er-bg, #fff)",
        border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
        Education level:{" "}
        <strong style={{ color: "var(--wm-er-text)" }}>
          {LEVEL_LABELS[data.level] ?? data.level}
        </strong>
      </div>

      {data.certifications.length > 0 && (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)" }}>
            Certifications
          </div>
          {data.certifications.map((cert) => (
            <div
              key={cert.id}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>{cert.name}</div>
              <div style={{ color: "var(--wm-er-muted)", marginTop: 2, fontSize: 11 }}>
                {cert.issuedBy}
                {cert.issueDate ? ` · ${cert.issueDate}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.certifications.length === 0 && data.level === "none" && (
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", fontStyle: "italic", marginTop: 6 }}>
          No education details added yet.
        </div>
      )}
    </div>
  );
}