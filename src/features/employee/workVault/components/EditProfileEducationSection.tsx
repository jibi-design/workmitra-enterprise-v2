
// src/features/employee/workVault/components/EditProfileEducationSection.tsx

import { VAULT_ACCENT } from "../constants/vaultConstants";
import type { VaultCertification, EducationLevel, SkillProficiency } from "../types/vaultProfileTypes";

/* ------------------------------------------------ */
/* Section Title                                    */
/* ------------------------------------------------ */
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: VAULT_ACCENT }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------ */
/* Education Section Props                          */
/* ------------------------------------------------ */
type EducationSectionProps = {
  eduLevel: EducationLevel;
  onEduLevelChange: (val: EducationLevel) => void;
  certs: VaultCertification[];
  newCertName: string;
  onNewCertNameChange: (val: string) => void;
  newCertIssuer: string;
  onNewCertIssuerChange: (val: string) => void;
  onAddCert: () => void;
  onRemoveCert: (id: string) => void;
};

/* ------------------------------------------------ */
/* Education Section                                */
/* ------------------------------------------------ */
export function EditProfileEducationSection({
  eduLevel, onEduLevelChange,
  certs, newCertName, onNewCertNameChange,
  newCertIssuer, onNewCertIssuerChange,
  onAddCert, onRemoveCert,
}: EducationSectionProps) {
  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <SectionTitle title="Education & Certifications" />

      <div className="wm-field">
        <label className="wm-label">Education level</label>
        <select
          className="wm-input"
          value={eduLevel}
          onChange={(e) => onEduLevelChange(e.target.value as EducationLevel)}
        >
          <option value="none">Not specified</option>
          <option value="high_school">High School</option>
          <option value="diploma">Diploma</option>
          <option value="degree">Degree</option>
          <option value="masters">Masters</option>
          <option value="phd">PhD</option>
        </select>
      </div>

      {certs.length > 0 && (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {certs.map((cert) => (
            <div
              key={cert.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: 10,
                background: `${VAULT_ACCENT}06`, border: `1px solid ${VAULT_ACCENT}15`,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>{cert.name}</div>
                {cert.issuedBy && (
                  <div style={{ fontSize: 11, color: "var(--wm-emp-muted)" }}>by {cert.issuedBy}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveCert(cert.id)}
                style={{
                  border: "none", background: "transparent", cursor: "pointer",
                  fontSize: 16, fontWeight: 900, color: "var(--wm-error, #dc2626)", padding: 0,
                }}
              >
                {"\u00D7"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        <input
          className="wm-input"
          value={newCertName}
          onChange={(e) => onNewCertNameChange(e.target.value)}
          placeholder="Certification name"
          maxLength={60}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="wm-input"
            style={{ flex: 1 }}
            value={newCertIssuer}
            onChange={(e) => onNewCertIssuerChange(e.target.value)}
            placeholder="Issued by (optional)"
            maxLength={40}
          />
          <button className="wm-primarybtn" type="button" onClick={onAddCert}>
            Add
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Skills Section Props                             */
/* ------------------------------------------------ */
type SkillsSectionProps = {
  profileSkills: string[];
  proficiencies: Record<string, SkillProficiency>;
  onProficiencyChange: (skill: string, level: SkillProficiency) => void;
};

/* ------------------------------------------------ */
/* Skills Section                                   */
/* ------------------------------------------------ */
export function EditProfileSkillsSection({
  profileSkills,
  proficiencies,
  onProficiencyChange,
}: SkillsSectionProps) {
  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <SectionTitle
        title="Skill Proficiency Levels"
        sub="Set your level for each skill from your profile"
      />

      {profileSkills.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", textAlign: "center", padding: "12px 0" }}>
          No skills in your profile yet. Go to Profile page to add skills first.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {profileSkills.map((skill) => {
            const key = skill.toLowerCase().trim();
            const current = proficiencies[key] ?? "beginner";
            return (
              <div
                key={skill}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 10,
                  background: "var(--wm-emp-bg)",
                  border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
                  {skill}
                </span>
                <select
                  value={current}
                  onChange={(e) => onProficiencyChange(key, e.target.value as SkillProficiency)}
                  style={{
                    fontSize: 11, fontWeight: 800, padding: "4px 8px",
                    borderRadius: 8, border: `1px solid ${VAULT_ACCENT}25`,
                    background: `${VAULT_ACCENT}06`, color: VAULT_ACCENT,
                    cursor: "pointer",
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}