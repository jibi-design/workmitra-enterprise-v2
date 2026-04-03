// src/features/employer/workforceOps/components/AnnounceStepPreview.tsx
//
// Step 5: Preview all announcement details before sending.
// Shows summary of categories, shifts, vacancies, details.
// Edit buttons jump back to specific steps.

import { useMemo } from "react";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { AnnounceFormData } from "../pages/EmployerWorkforceAnnouncePage";
import { IconEdit } from "./workforceIcons";
import { AMBER, AMBER_BG } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  form: AnnounceFormData;
  onSubmit: () => void;
  onEdit: (step: Step) => void;
  isSubmitting: boolean;
  errors: string[];
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AnnounceStepPreview({ form, onSubmit, onEdit, isSubmitting, errors }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  /* Total vacancy */
  const totalVacancy = useMemo(() => {
    let total = 0;
    for (const catId of form.targetCategories) {
      for (const shift of form.shifts) {
        total += form.vacancyPerCategoryPerShift[catId]?.[shift.id] ?? 0;
      }
    }
    return total;
  }, [form]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Header */}
      <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>
        Review your announcement before sending
      </div>

      {/* Details Section */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionLabelStyle}>Details</div>
          <button type="button" onClick={() => onEdit(4)} style={editBtnStyle}><IconEdit /> Edit</button>
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>{form.title || "Untitled"}</div>
        <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
          <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>
            <strong>Work Date:</strong> {form.date ? new Date(form.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Not set"}
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
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 4 }}>{form.description}</div>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionLabelStyle}>Categories ({form.targetCategories.length})</div>
          <button type="button" onClick={() => onEdit(1)} style={editBtnStyle}><IconEdit /> Edit</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {form.targetCategories.map((catId) => (
            <span key={catId} style={chipStyle}>{categoryMap.get(catId) ?? catId}</span>
          ))}
        </div>
      </div>

      {/* Shifts Section */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionLabelStyle}>Shifts ({form.shifts.length})</div>
          <button type="button" onClick={() => onEdit(2)} style={editBtnStyle}><IconEdit /> Edit</button>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {form.shifts.map((shift) => (
            <div key={shift.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>
                  {shift.name}
                  {shift.hasBreak && (
                    <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, color: AMBER, padding: "1px 6px", borderRadius: 999, background: AMBER_BG }}>
                      BREAK
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{shift.startTime} — {shift.endTime}</span>
              </div>
              {shift.hasBreak && (
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3, paddingLeft: 4 }}>
                  Duty 1: {shift.startTime} – {shift.breakStartTime} · Break: {shift.breakStartTime} – {shift.breakEndTime} · Duty 2: {shift.breakEndTime} – {shift.endTime}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vacancies Section */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionLabelStyle}>Vacancies</div>
          <button type="button" onClick={() => onEdit(3)} style={editBtnStyle}><IconEdit /> Edit</button>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {form.targetCategories.map((catId) => {
            const catName = categoryMap.get(catId) ?? catId;
            return (
              <div key={catId}>
                <div style={{ fontSize: 12, fontWeight: 700, color: AMBER, marginBottom: 4 }}>{catName}</div>
                <div style={{ display: "grid", gap: 2, paddingLeft: 8 }}>
                  {form.shifts.map((shift) => {
                    const count = form.vacancyPerCategoryPerShift[catId]?.[shift.id] ?? 0;
                    return (
                      <div key={shift.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--wm-er-text)" }}>{shift.name}</span>
                        <span style={{ fontWeight: 800, color: count > 0 ? "var(--wm-er-text)" : "var(--wm-er-muted)" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: AMBER_BG, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: AMBER }}>{totalVacancy}</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Waiting list buffer: {form.waitingBuffer} per category per shift
        </div>
      </div>

      {/* Settings */}
      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Settings</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-text)" }}>
          Auto-replace from waiting list: <strong>{form.autoReplace ? "ON" : "OFF"}</strong>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--wm-error)" }}>{e}</div>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        className="wm-primarybtn"
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        style={{
          width: "100%",
          background: AMBER,
          fontSize: 15,
          fontWeight: 900,
          padding: "14px",
        }}
      >
        {isSubmitting ? "Sending..." : "Send Announcement"}
      </button>

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", textAlign: "center", lineHeight: 1.4 }}>
        Your staff in the selected categories will be notified immediately. They can mark their availability for each shift.
      </div>
    </div>
  );
}