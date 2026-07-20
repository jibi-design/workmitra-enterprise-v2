// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnouncePreviewCategoriesSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnouncePreviewCategoriesSection.tsx

import type { AnnounceFormData } from "../types/announceForm.types";
import { IconEdit } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  form: AnnounceFormData;
  categoryMap: Map<string, string>;
  onEdit: (step: Step) => void;
  sectionStyle: React.CSSProperties;
  sectionHeaderStyle: React.CSSProperties;
  sectionLabelStyle: React.CSSProperties;
  editBtnStyle: React.CSSProperties;
  chipStyle: React.CSSProperties;
};

export function AnnouncePreviewCategoriesSection({
  form,
  categoryMap,
  onEdit,
  sectionStyle,
  sectionHeaderStyle,
  sectionLabelStyle,
  editBtnStyle,
  chipStyle,
}: Props) {
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div style={sectionLabelStyle}>Categories ({form.targetCategories.length})</div>
        <button type="button" onClick={() => onEdit(1)} style={editBtnStyle}>
          <IconEdit /> Edit
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {form.targetCategories.map((catId) => (
          <span key={catId} style={chipStyle}>
            {categoryMap.get(catId) ?? catId}
          </span>
        ))}
      </div>
    </div>
  );
}
