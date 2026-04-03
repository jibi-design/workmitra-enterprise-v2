// src/features/employer/workforceOps/components/AnnounceStepVacancy.tsx
//
// Step 3: Set vacancy per category × per shift.
// Grid layout with + / - controls and waiting buffer setting.

import { useMemo, useState, useCallback } from "react";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { AnnouncementShift, WorkforceCategory } from "../types/workforceTypes";
import { validateAnnouncementStep2 } from "../helpers/workforceValidation";
import { AMBER, AMBER_BG } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  targetCategories: string[];
  shifts: AnnouncementShift[];
  vacancyMap: Record<string, Record<string, number>>;
  waitingBuffer: number;
  onChange: (vacMap: Record<string, Record<string, number>>, buffer: number) => void;
  onNext: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const counterBtnStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: "1px solid var(--wm-er-border)",
  background: "#fff",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 900,
  color: "var(--wm-er-text)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const countDisplayStyle: React.CSSProperties = {
  width: 36,
  textAlign: "center",
  fontSize: 16,
  fontWeight: 900,
  color: AMBER,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AnnounceStepVacancy({ targetCategories, shifts, vacancyMap, waitingBuffer, onChange, onNext }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, WorkforceCategory>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const [errors, setErrors] = useState<string[]>([]);

  const getCount = useCallback((catId: string, shiftId: string): number => {
    return vacancyMap[catId]?.[shiftId] ?? 0;
  }, [vacancyMap]);

  const setCount = useCallback((catId: string, shiftId: string, value: number) => {
    const clamped = Math.max(0, Math.min(99, value));
    const updated = { ...vacancyMap };
    if (!updated[catId]) updated[catId] = {};
    updated[catId] = { ...updated[catId], [shiftId]: clamped };
    onChange(updated, waitingBuffer);
    setErrors([]);
  }, [vacancyMap, waitingBuffer, onChange]);

  const setBuffer = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(20, value));
    onChange(vacancyMap, clamped);
  }, [vacancyMap, onChange]);

  /* Total vacancy */
  const totalVacancy = useMemo(() => {
    let total = 0;
    for (const catId of targetCategories) {
      for (const shift of shifts) {
        total += getCount(catId, shift.id);
      }
    }
    return total;
  }, [targetCategories, shifts, getCount]);

  function handleNext() {
    const result = validateAnnouncementStep2(vacancyMap, targetCategories, shifts);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onNext();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="wm-er-card">
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 4 }}>
          Set Vacancies
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 14 }}>
          How many staff do you need for each category and shift?
        </div>

        {/* Grid: Category × Shift */}
        <div style={{ display: "grid", gap: 14 }}>
          {targetCategories.map((catId) => {
            const cat = categoryMap.get(catId);
            if (!cat) return null;

            return (
              <div key={catId} style={{ padding: 12, borderRadius: 10, background: AMBER_BG }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: AMBER, marginBottom: 8 }}>
                  {cat.name}
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {shifts.map((shift) => {
                    const count = getCount(catId, shift.id);
                    return (
                      <div
                        key={shift.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: 8,
                          background: "#fff",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>{shift.name}</div>
                          <div style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>{shift.startTime} — {shift.endTime}</div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => setCount(catId, shift.id, count - 1)}
                            disabled={count === 0}
                            style={{ ...counterBtnStyle, opacity: count === 0 ? 0.3 : 1 }}
                          >
                            −
                          </button>
                          <div style={countDisplayStyle}>{count}</div>
                          <button
                            type="button"
                            onClick={() => setCount(catId, shift.id, count + 1)}
                            style={counterBtnStyle}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting Buffer */}
      <div className="wm-er-card">
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 4 }}>
          Waiting List Buffer
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10 }}>
          Extra applicants to keep as backup per category per shift. If someone cancels, the next person moves up automatically.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setBuffer(waitingBuffer - 1)}
            disabled={waitingBuffer === 0}
            style={{ ...counterBtnStyle, opacity: waitingBuffer === 0 ? 0.3 : 1 }}
          >
            −
          </button>
          <div style={countDisplayStyle}>{waitingBuffer}</div>
          <button
            type="button"
            onClick={() => setBuffer(waitingBuffer + 1)}
            style={counterBtnStyle}
          >
            +
          </button>
          <span style={{ fontSize: 12, color: "var(--wm-er-muted)", marginLeft: 4 }}>per category per shift</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: 12, borderRadius: 10, background: AMBER_BG, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>Total Vacancies</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: AMBER }}>{totalVacancy}</div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--wm-error)" }}>{e}</div>
          ))}
        </div>
      )}

      {/* Next */}
      <button
        className="wm-primarybtn"
        type="button"
        onClick={handleNext}
        disabled={totalVacancy === 0}
        style={{
          width: "100%",
          background: totalVacancy > 0 ? AMBER : "var(--wm-er-muted)",
          fontSize: 14,
          padding: "12px",
        }}
      >
        Next — Announcement Details
      </button>
    </div>
  );
}