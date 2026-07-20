// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnounceStepPreviewSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnounceStepPreviewSection.tsx

import type { AnnounceFormData } from "../types/announceForm.types";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";
import { AnnouncePreviewCategoriesSection } from "./AnnouncePreviewCategoriesSection";
import { AnnouncePreviewDetailsSection } from "./AnnouncePreviewDetailsSection";
import { AnnouncePreviewShiftsSection } from "./AnnouncePreviewShiftsSection";
import { AnnouncePreviewSubmitSection } from "./AnnouncePreviewSubmitSection";
import { AnnouncePreviewVacanciesSection } from "./AnnouncePreviewVacanciesSection";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  form: AnnounceFormData;
  categoryMap: Map<string, string>;
  totalVacancy: number;
  onSubmit: () => void;
  onEdit: (step: Step) => void;
  isSubmitting: boolean;
  errors: string[];
};

const sectionStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const editBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11,
  fontWeight: 700,
};

const chipStyle: React.CSSProperties = {
  padding: "3px 10px",
  borderRadius: 999,
  background: AMBER_BG,
  color: AMBER,
  fontSize: 11,
  fontWeight: 700,
};

export function AnnounceStepPreviewSection({
  form,
  categoryMap,
  totalVacancy,
  onSubmit,
  onEdit,
  isSubmitting,
  errors,
}: Props) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>
        Review your announcement before sending
      </div>

      <AnnouncePreviewDetailsSection
        form={form}
        onEdit={onEdit}
        sectionStyle={sectionStyle}
        sectionHeaderStyle={sectionHeaderStyle}
        sectionLabelStyle={sectionLabelStyle}
        editBtnStyle={editBtnStyle}
      />

      <AnnouncePreviewCategoriesSection
        form={form}
        categoryMap={categoryMap}
        onEdit={onEdit}
        sectionStyle={sectionStyle}
        sectionHeaderStyle={sectionHeaderStyle}
        sectionLabelStyle={sectionLabelStyle}
        editBtnStyle={editBtnStyle}
        chipStyle={chipStyle}
      />

      <AnnouncePreviewShiftsSection
        form={form}
        onEdit={onEdit}
        sectionStyle={sectionStyle}
        sectionHeaderStyle={sectionHeaderStyle}
        sectionLabelStyle={sectionLabelStyle}
        editBtnStyle={editBtnStyle}
      />

      <AnnouncePreviewVacanciesSection
        form={form}
        categoryMap={categoryMap}
        totalVacancy={totalVacancy}
        onEdit={onEdit}
        sectionStyle={sectionStyle}
        sectionHeaderStyle={sectionHeaderStyle}
        sectionLabelStyle={sectionLabelStyle}
        editBtnStyle={editBtnStyle}
      />

      <AnnouncePreviewSubmitSection
        form={form}
        errors={errors}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        sectionStyle={sectionStyle}
        sectionLabelStyle={sectionLabelStyle}
      />
    </div>
  );
}
