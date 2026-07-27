// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnouncePreviewVacanciesSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnouncePreviewVacanciesSection.tsx

import type { AnnounceFormData } from "../types/announceForm.types";
import { IconEdit } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  form: AnnounceFormData;
  categoryMap: Map<string, string>;
  totalVacancy: number;
  onEdit: (step: Step) => void;
  sectionStyle: React.CSSProperties;
  sectionHeaderStyle: React.CSSProperties;
  sectionLabelStyle: React.CSSProperties;
  editBtnStyle: React.CSSProperties;
};

export function AnnouncePreviewVacanciesSection({
  form,
  categoryMap,
  totalVacancy,
  onEdit,
  sectionStyle,
  sectionHeaderStyle,
  sectionLabelStyle,
  editBtnStyle,
}: Props) {
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div style={sectionLabelStyle}>Vacancies</div>
        <button type="button" onClick={() => onEdit(3)} style={editBtnStyle}>
          <IconEdit /> Edit
        </button>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {form.targetCategories.map((catId) => {
          const catName = categoryMap.get(catId) ?? catId;

          return (
            <div key={catId}>
              <div style={{ fontSize: 12, fontWeight: 700, color: AMBER, marginBottom: 4 }}>
                {catName}
              </div>

              <div style={{ display: "grid", gap: 2, paddingLeft: 8 }}>
                {form.shifts.map((shift) => {
                  const count = form.vacancyPerCategoryPerShift[catId]?.[shift.id] ?? 0;

                  return (
                    <div
                      key={shift.id}
                      style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}
                    >
                      <span style={{ color: "var(--wm-er-text)" }}>{shift.name}</span>
                      <span
                        style={{
                          fontWeight: 800,
                          color: count > 0 ? "var(--wm-er-text)" : "var(--wm-er-muted)",
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 8,
          padding: "8px 10px",
          borderRadius: "var(--wm-radius-8)",
          background: AMBER_BG,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>Total</span>
        <span style={{ fontSize: 18, fontWeight: 900, color: AMBER }}>{totalVacancy}</span>
      </div>

      <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
        Waiting list buffer: {form.waitingBuffer} per category per shift
      </div>
    </div>
  );
}
