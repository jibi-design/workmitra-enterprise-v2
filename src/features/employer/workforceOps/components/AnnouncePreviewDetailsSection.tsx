// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnouncePreviewDetailsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnouncePreviewDetailsSection.tsx

import type { AnnounceFormData } from "../types/announceForm.types";
import { IconEdit } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  form: AnnounceFormData;
  onEdit: (step: Step) => void;
  sectionStyle: React.CSSProperties;
  sectionHeaderStyle: React.CSSProperties;
  sectionLabelStyle: React.CSSProperties;
  editBtnStyle: React.CSSProperties;
};

export function AnnouncePreviewDetailsSection({
  form,
  onEdit,
  sectionStyle,
  sectionHeaderStyle,
  sectionLabelStyle,
  editBtnStyle,
}: Props) {
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div style={sectionLabelStyle}>Details</div>
        <button type="button" onClick={() => onEdit(4)} style={editBtnStyle}>
          <IconEdit /> Edit
        </button>
      </div>

      <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
        {form.title || "Untitled"}
      </div>

      <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
        <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>
          <strong>Work Date:</strong>{" "}
          {form.date
            ? new Date(form.date + "T00:00:00").toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Not set"}
        </div>

        {form.time && (
          <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>
            <strong>Reporting Time:</strong> {form.time}
          </div>
        )}

        {form.location && (
          <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>
            <strong>Location:</strong> {form.location}
          </div>
        )}

        {form.description && (
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 4 }}>
            {form.description}
          </div>
        )}
      </div>
    </div>
  );
}
