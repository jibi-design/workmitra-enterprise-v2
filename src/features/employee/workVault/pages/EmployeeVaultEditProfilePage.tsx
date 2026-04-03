// src/features/employee/workVault/pages/EmployeeVaultEditProfilePage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vaultProfileService } from "../services/vaultProfileService";
import type {
  VaultProfessionalSummary,
  VaultEducation,
  VaultCertification,
  EducationLevel,
  EmploymentStatus,
  ExpectedRoleType,
  NoticePeriod,
  SkillProficiency,
} from "../types/vaultProfileTypes";
import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { EditProfileSummarySection } from "../components/EditProfileSummarySection";
import { EditProfileEducationSection, EditProfileSkillsSection } from "../components/EditProfileEducationSection";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function uid(): string {
  return `vc_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeVaultEditProfilePage() {
  const nav = useNavigate();
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const initial = useMemo(() => vaultProfileService.get(), []);
  const profileSkills = useMemo(() => employeeProfileStorage.get().skills, []);

  /* ---- Section 2: Professional Summary ---- */
  const [headline, setHeadline] = useState(initial.professionalSummary.headline);
  const [empStatus, setEmpStatus] = useState<EmploymentStatus>(initial.professionalSummary.employmentStatus);
  const [empStatusAuto, setEmpStatusAuto] = useState(initial.professionalSummary.employmentStatusAuto);
  const [currentCompany, setCurrentCompany] = useState(initial.professionalSummary.currentCompany);
  const [roleType, setRoleType] = useState<ExpectedRoleType>(initial.professionalSummary.expectedRoleType);
  const [noticePeriod, setNoticePeriod] = useState<NoticePeriod>(initial.professionalSummary.noticePeriod);

  /* ---- Section 5: Education ---- */
  const [eduLevel, setEduLevel] = useState<EducationLevel>(initial.education.level);
  const [certs, setCerts] = useState<VaultCertification[]>(initial.education.certifications);
  const [newCertName, setNewCertName] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("");

  /* ---- Section 6: Skill proficiencies ---- */
  const [proficiencies, setProficiencies] = useState<Record<string, SkillProficiency>>(
    initial.skillProficiencies,
  );

  /* ---- Certification handlers ---- */
  function addCert() {
    const name = newCertName.trim();
    const issuer = newCertIssuer.trim();
    if (!name) return;
    const cert: VaultCertification = {
      id: uid(),
      name,
      issuedBy: issuer,
      issueDate: "",
      expiryDate: null,
      linkedDocId: null,
    };
    setCerts((prev) => [...prev, cert]);
    setNewCertName("");
    setNewCertIssuer("");
  }

  function removeCert(certId: string) {
    setCerts((prev) => prev.filter((c) => c.id !== certId));
  }

  /* ---- Save ---- */
  function handleSave() {
    const summary: VaultProfessionalSummary = {
      headline: headline.trim(),
      employmentStatus: empStatus,
      employmentStatusAuto: empStatusAuto,
      currentCompany: currentCompany.trim(),
      expectedRoleType: roleType,
      noticePeriod,
    };

    const education: VaultEducation = { level: eduLevel, certifications: certs };

    vaultProfileService.updateSummary(summary);
    vaultProfileService.updateEducationLevel(education.level);

    const existing = vaultProfileService.getEducation();
    for (const old of existing.certifications) {
      if (!certs.find((c) => c.id === old.id)) {
        vaultProfileService.removeCertification(old.id);
      }
    }
    for (const cert of certs) {
      if (!existing.certifications.find((c) => c.id === cert.id)) {
        vaultProfileService.addCertification(cert);
      }
    }

    for (const [skill, level] of Object.entries(proficiencies)) {
      vaultProfileService.setSkillProficiency(skill, level);
    }

    setNotice({ title: "Profile Updated", message: "Your vault profile has been saved.", tone: "success" });
  }

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => nav(-1)}
              style={{
                border: "none", background: "transparent", cursor: "pointer",
                fontSize: 18, color: "var(--wm-emp-muted)", padding: 0,
              }}
            >
              {"\u2190"}
            </button>
            Edit Vault Profile
          </div>
          <div className="wm-pageSub">Update your professional summary, education, and skills</div>
        </div>
      </div>

      <EditProfileSummarySection
        headline={headline} onHeadlineChange={setHeadline}
        empStatus={empStatus} onEmpStatusChange={setEmpStatus}
        empStatusAuto={empStatusAuto} onEmpStatusAutoChange={setEmpStatusAuto}
        currentCompany={currentCompany} onCurrentCompanyChange={setCurrentCompany}
        roleType={roleType} onRoleTypeChange={setRoleType}
        noticePeriod={noticePeriod} onNoticePeriodChange={setNoticePeriod}
      />

      <EditProfileEducationSection
        eduLevel={eduLevel} onEduLevelChange={setEduLevel}
        certs={certs}
        newCertName={newCertName} onNewCertNameChange={setNewCertName}
        newCertIssuer={newCertIssuer} onNewCertIssuerChange={setNewCertIssuer}
        onAddCert={addCert} onRemoveCert={removeCert}
      />

      <EditProfileSkillsSection
        profileSkills={profileSkills}
        proficiencies={proficiencies}
        onProficiencyChange={(skill, level) =>
          setProficiencies((prev) => ({ ...prev, [skill]: level }))
        }
      />

      {/* Save Bar */}
      <div className="wm-stickySaveBar" role="region" aria-label="Save bar">
        <div className="wm-stickyInner">
          <button className="wm-outlineBtn" type="button" onClick={() => nav(-1)}>Cancel</button>
          <button className="wm-primarybtn" type="button" onClick={handleSave}>Save Changes</button>
        </div>
      </div>

      <div style={{ height: 72 }} />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}