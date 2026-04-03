// src/features/employee/workforceOps/pages/EmployeeWorkforceAnnounceDetailPage.tsx
//
// Workforce Ops Hub — Employee Announcement Detail.
// View details, select shifts, apply. Shows date conflict warning (IMP-1).

import { useMemo, useState, useCallback } from "react";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";
// Types used via readAnnouncements return type
import {
  WF_ANNOUNCEMENTS_KEY,
} from "../../../employer/workforceOps/helpers/workforceStorageUtils";
import { readAnnouncements } from "../../../employer/workforceOps/helpers/workforceNormalizers";
import { IconBack } from "../../../employer/workforceOps/components/workforceIcons";
import { AMBER, AMBER_BG } from "../../../employer/workforceOps/components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  announcementId: string;
  onBack: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployeeWorkforceAnnounceDetailPage({ announcementId, onBack }: Props) {
  const announcement = useMemo(
    () => readAnnouncements(WF_ANNOUNCEMENTS_KEY).find((a) => a.id === announcementId) ?? null,
    [announcementId],
  );

  const staff = useMemo(() => employeeWorkforceHelpers.getMyStaffRecord(), []);
  const existingApp = useMemo(
    () => employeeWorkforceHelpers.getApplicationForAnnouncement(announcementId),
    [announcementId],
  );
  const categories = useMemo(() => employeeWorkforceHelpers.getAllCategories(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [applied, setApplied] = useState(existingApp !== null);

  /* Date conflict check */
  const hasConflict = useMemo(() => {
    if (!announcement) return false;
    const confirmed = readAnnouncements(WF_ANNOUNCEMENTS_KEY).filter(
      (a) => a.status === "confirmed" && a.date === announcement.date && a.id !== announcement.id,
    );
    return confirmed.length > 0;
  }, [announcement]);

  const toggleShift = useCallback((shiftId: string) => {
    setSelectedShifts((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId],
    );
    setErrors([]);
  }, []);

  const handleApply = useCallback(() => {
    if (!staff || !announcement) return;

    const myCategoryInAnnouncement = announcement.targetCategories.find(
      (catId) => staff.categories.includes(catId),
    );
    if (!myCategoryInAnnouncement) {
      setErrors(["You are not in any of the required categories."]);
      return;
    }

    const result = employeeWorkforceHelpers.apply(
      announcementId,
      myCategoryInAnnouncement,
      selectedShifts,
    );

    if (result.success) {
      setApplied(true);
      setErrors([]);
    } else {
      setErrors(result.errors ?? ["Failed to apply."]);
    }
  }, [staff, announcement, announcementId, selectedShifts]);

  /* Guard */
  if (!announcement) {
    return (
      <div style={{ padding: "0 16px" }}>
        <div className="wm-pageHead">
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4 }}><IconBack /></button>
          <div className="wm-pageTitle">Announcement not found</div>
        </div>
      </div>
    );
  }

  const totalVacancy = (() => {
    let total = 0;
    for (const catId of announcement.targetCategories) {
      for (const shift of announcement.shifts) {
        total += announcement.vacancyPerCategoryPerShift[catId]?.[shift.id] ?? 0;
      }
    }
    return total;
  })();

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Header */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center" }}>
          <IconBack />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wm-pageTitle" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{announcement.title}</div>
          <div className="wm-pageSub">Announcement Details</div>
        </div>
      </div>

      {/* Details Card */}
      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ display: "grid", gap: 6 }}>
         <div style={{ fontSize: 13 }}><strong>Work Date:</strong> {new Date(announcement.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
          {announcement.time && <div style={{ fontSize: 13 }}><strong>Reporting Time:</strong> {announcement.time}</div>}
          {announcement.location && <div style={{ fontSize: 13 }}><strong>Location:</strong> {announcement.location}</div>}
          <div style={{ fontSize: 13 }}><strong>Vacancies:</strong> {totalVacancy}</div>
          {announcement.description && (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>{announcement.description}</div>
          )}
        </div>

        {/* Categories */}
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {announcement.targetCategories.map((catId) => (
            <span key={catId} style={{ padding: "2px 8px", borderRadius: 999, background: AMBER_BG, color: AMBER, fontSize: 10, fontWeight: 700 }}>
              {categoryMap.get(catId) ?? catId}
            </span>
          ))}
        </div>
      </div>

      {/* Date Conflict Warning (IMP-1) */}
      {hasConflict && (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-warning)" }}>Date Conflict Warning</div>
          <div style={{ fontSize: 11, color: "var(--wm-er-text)", marginTop: 2 }}>
            You already have a confirmed assignment on {announcement.date}. You can still apply, but the employer will see the conflict.
          </div>
        </div>
      )}

      {/* Applied State */}
      {applied ? (
        <div className="wm-er-card" style={{ marginTop: 14, border: "1px solid var(--wm-success)" }}>
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-success)" }}>Applied Successfully</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
              The employer will review your application. You'll be notified of the result.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Shift Selection */}
          <div className="wm-er-card" style={{ marginTop: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 6 }}>
              Select Your Available Shifts
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10 }}>
              Choose the shifts you can work. You can select multiple.
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {announcement.shifts.map((shift) => {
                const isSelected = selectedShifts.includes(shift.id);
                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => toggleShift(shift.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--wm-radius-10)",
                      border: isSelected ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
                      background: isSelected ? AMBER_BG : "var(--wm-er-card)",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{shift.name}</div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{shift.startTime} — {shift.endTime}</div>
                    </div>
                    <div style={{ fontSize: 18, color: isSelected ? AMBER : "var(--wm-er-border)" }}>
                      {isSelected ? "✓" : "○"}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedShifts.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: AMBER, fontWeight: 700 }}>
                {selectedShifts.length} shift{selectedShifts.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
              {errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--wm-error)" }}>{e}</div>
              ))}
            </div>
          )}

          {/* Apply Button */}
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleApply}
            disabled={selectedShifts.length === 0}
            style={{
              width: "100%",
              marginTop: 14,
              background: selectedShifts.length > 0 ? AMBER : "var(--wm-er-muted)",
              fontSize: 15,
              fontWeight: 900,
              padding: "14px",
            }}
          >
            I'm Available
          </button>
        </>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}