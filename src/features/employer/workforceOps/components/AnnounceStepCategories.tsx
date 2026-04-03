// src/features/employer/workforceOps/components/AnnounceStepCategories.tsx
//
// Step 1: Select target categories for the announcement.
// Includes "Load from Template" option (IMP-2).

import { useMemo, useState } from "react";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceTemplateService } from "../services/workforceTemplateService";
import { workforceStaffService } from "../services/workforceStaffService";
import type { WorkforceCategory, WorkforceTemplate } from "../types/workforceTypes";
import type { AnnounceFormData } from "../pages/EmployerWorkforceAnnouncePage";
import { validateAnnouncementStep1 } from "../helpers/workforceValidation";
import { IconPlus } from "./workforceIcons";
import { AMBER, AMBER_BG, categoryChipStyle } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  selected: string[];
  onChange: (categories: string[]) => void;
  onLoadTemplate: (data: Partial<AnnounceFormData>) => void;
  onNext: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AnnounceStepCategories({ selected, onChange, onLoadTemplate, onNext }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const templates = useMemo(() => workforceTemplateService.getAll(), []);
  const [errors, setErrors] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  /* Staff count per category */
  const staffCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const allStaff = workforceStaffService.getAll();
    for (const s of allStaff) {
      for (const catId of s.categories) {
        counts.set(catId, (counts.get(catId) ?? 0) + 1);
      }
    }
    return counts;
  }, []);

  function toggleCategory(catId: string) {
    const updated = selected.includes(catId)
      ? selected.filter((id) => id !== catId)
      : [...selected, catId];
    onChange(updated);
    setErrors([]);
  }

  function selectAll() {
    onChange(categories.map((c) => c.id));
    setErrors([]);
  }

  function handleNext() {
    const result = validateAnnouncementStep1(selected);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onNext();
  }

  function handleLoadTemplate(template: WorkforceTemplate) {
    onLoadTemplate({
      targetCategories: template.targetCategories,
      shifts: template.shifts,
      vacancyPerCategoryPerShift: template.vacancyPerCategoryPerShift,
      waitingBuffer: template.waitingBuffer,
      title: template.titlePattern,
      description: template.description,
      location: template.location,
    });
    setShowTemplates(false);
    setErrors([]);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Template Loader (IMP-2) */}
      {templates.length > 0 && (
        <div className="wm-er-card">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 0,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: AMBER }}>
              Load from Template
            </div>
            <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
              {templates.length} template{templates.length !== 1 ? "s" : ""} {showTemplates ? "▲" : "▼"}
            </span>
          </button>

          {showTemplates && (
            <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleLoadTemplate(t)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--wm-radius-10)",
                    border: "1px solid var(--wm-er-border)",
                    background: "var(--wm-er-bg)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    {t.targetCategories.length} categories · {t.shifts.length} shifts · {t.location || "No location"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Selection */}
      <div className="wm-er-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>
            Select Categories
          </div>
          {categories.length > 0 && (
            <button
              type="button"
              onClick={selectAll}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: AMBER,
              }}
            >
              Select All
            </button>
          )}
        </div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10 }}>
          Choose which staff categories should receive this announcement.
        </div>

        {categories.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((cat: WorkforceCategory) => {
              const isActive = selected.includes(cat.id);
              const count = staffCounts.get(cat.id) ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    ...categoryChipStyle,
                    cursor: "pointer",
                    padding: "6px 14px",
                    fontSize: 13,
                    background: isActive ? AMBER : AMBER_BG,
                    color: isActive ? "#fff" : AMBER,
                  }}
                >
                  {isActive ? "✓ " : <><IconPlus /> </>}
                  {cat.name}
                  <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 11 }}>({count})</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", padding: 16, textAlign: "center" }}>
            No categories created yet. Add categories from the home page first.
          </div>
        )}

        {selected.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)" }}>
            {selected.length} selected · {selected.reduce((sum, id) => sum + (staffCounts.get(id) ?? 0), 0)} staff will see this announcement
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--wm-error)" }}>{e}</div>
          ))}
        </div>
      )}

      {/* Next Button */}
      <button
        className="wm-primarybtn"
        type="button"
        onClick={handleNext}
        disabled={selected.length === 0}
        style={{
          width: "100%",
          background: selected.length > 0 ? AMBER : "var(--wm-er-muted)",
          fontSize: 14,
          padding: "12px",
        }}
      >
        Next — Define Shifts
      </button>
    </div>
  );
}