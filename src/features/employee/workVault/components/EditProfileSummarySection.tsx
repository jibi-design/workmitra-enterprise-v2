// src/features/employee/workVault/components/EditProfileSummarySection.tsx

import { VAULT_ACCENT } from "../constants/vaultConstants";
import type { EmploymentStatus, ExpectedRoleType, NoticePeriod } from "../types/vaultProfileTypes";

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
/* Props                                            */
/* ------------------------------------------------ */
type EditProfileSummarySectionProps = {
  headline: string;
  onHeadlineChange: (val: string) => void;
  empStatus: EmploymentStatus;
  onEmpStatusChange: (val: EmploymentStatus) => void;
  empStatusAuto: boolean;
  onEmpStatusAutoChange: (val: boolean) => void;
  currentCompany: string;
  onCurrentCompanyChange: (val: string) => void;
  roleType: ExpectedRoleType;
  onRoleTypeChange: (val: ExpectedRoleType) => void;
  noticePeriod: NoticePeriod;
  onNoticePeriodChange: (val: NoticePeriod) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EditProfileSummarySection({
  headline, onHeadlineChange,
  empStatus, onEmpStatusChange,
  empStatusAuto, onEmpStatusAutoChange,
  currentCompany, onCurrentCompanyChange,
  roleType, onRoleTypeChange,
  noticePeriod, onNoticePeriodChange,
}: EditProfileSummarySectionProps) {
  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <SectionTitle title="Professional Summary" sub="This is visible to employers after OTP verification" />

      <div className="wm-field">
        <label className="wm-label">Headline</label>
        <input
          className="wm-input"
          value={headline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          placeholder="e.g. Experienced electrical technician"
          maxLength={80}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <label className="wm-label">Employment status</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={empStatusAuto}
            onChange={(e) => onEmpStatusAutoChange(e.target.checked)}
          />
          <span style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
            Auto-detect from Career Jobs
          </span>
        </div>
        {!empStatusAuto && (
          <select
            className="wm-input"
            value={empStatus}
            onChange={(e) => onEmpStatusChange(e.target.value as EmploymentStatus)}
          >
            <option value="available">Available for hire</option>
            <option value="employed">Currently employed</option>
            <option value="not_looking">Not looking</option>
          </select>
        )}
      </div>

      {!empStatusAuto && empStatus === "employed" && (
        <div className="wm-field" style={{ marginTop: 10 }}>
          <label className="wm-label">Current company</label>
          <input
            className="wm-input"
            value={currentCompany}
            onChange={(e) => onCurrentCompanyChange(e.target.value)}
            placeholder="e.g. PowerTech Solutions"
            maxLength={60}
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <div className="wm-field">
          <label className="wm-label">Expected role</label>
          <select
            className="wm-input"
            value={roleType}
            onChange={(e) => onRoleTypeChange(e.target.value as ExpectedRoleType)}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div className="wm-field">
          <label className="wm-label">Notice period</label>
          <select
            className="wm-input"
            value={noticePeriod}
            onChange={(e) => onNoticePeriodChange(e.target.value as NoticePeriod)}
          >
            <option value="immediate">Immediate</option>
            <option value="2_weeks">2 weeks</option>
            <option value="1_month">1 month</option>
            <option value="2_months">2 months</option>
            <option value="3_months">3 months</option>
          </select>
        </div>
      </div>
    </section>
  );
}