// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnounceStepShifts.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnounceStepShifts.tsx

import { useCallback, useState } from "react";
import type { AnnouncementShift } from "../../../../shared/domains/workforce/types/workforceTypes";
import { uid } from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { validateShifts } from "../../../../shared/domains/workforce/validation/workforceValidation";
import { IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";
import { AnnounceShiftPresets } from "./AnnounceShiftPresets";
import type { ShiftPreset } from "./AnnounceShiftPresets";
import { AnnounceShiftRow } from "./AnnounceShiftRow";

type Props = {
  shifts: AnnouncementShift[];
  onChange: (shifts: AnnouncementShift[]) => void;
  onNext: () => void;
};

export function AnnounceStepShifts({ shifts, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<string[]>([]);

  const addPreset = useCallback(
    (preset: ShiftPreset) => {
      const exists = shifts.some((shift) => shift.name.toLowerCase() === preset.name.toLowerCase());

      if (exists) return;

      const newShift: AnnouncementShift = {
        id: uid("ws"),
        name: preset.name,
        startTime: preset.startTime,
        endTime: preset.endTime,
        hasBreak: false,
        breakStartTime: "",
        breakEndTime: "",
      };

      onChange([...shifts, newShift]);
      setErrors([]);
    },
    [onChange, shifts],
  );

  const addCustom = useCallback(() => {
    const newShift: AnnouncementShift = {
      id: uid("ws"),
      name: "",
      startTime: "09:00",
      endTime: "17:00",
      hasBreak: false,
      breakStartTime: "",
      breakEndTime: "",
    };

    onChange([...shifts, newShift]);
    setErrors([]);
  }, [onChange, shifts]);

  const updateShift = useCallback(
    (shiftId: string, field: keyof AnnouncementShift, value: string | boolean) => {
      onChange(
        shifts.map((shift) => {
          if (shift.id !== shiftId) return shift;

          const updated = { ...shift, [field]: value };

          if (field === "hasBreak" && value === false) {
            updated.breakStartTime = "";
            updated.breakEndTime = "";
          }

          return updated;
        }),
      );

      setErrors([]);
    },
    [onChange, shifts],
  );

  const enableBreak = useCallback(
    (shiftId: string) => {
      onChange(
        shifts.map((shift) => {
          if (shift.id !== shiftId) return shift;

          return {
            ...shift,
            hasBreak: true,
            breakStartTime: shift.endTime,
            breakEndTime: shift.endTime,
          };
        }),
      );

      setErrors([]);
    },
    [onChange, shifts],
  );

  const removeShift = useCallback(
    (shiftId: string) => {
      onChange(shifts.filter((shift) => shift.id !== shiftId));
      setErrors([]);
    },
    [onChange, shifts],
  );

  function handleNext() {
    const result = validateShifts(shifts);

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    onNext();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <AnnounceShiftPresets shifts={shifts} onAddPreset={addPreset} />

      {shifts.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
            Shifts ({shifts.length})
          </div>

          {shifts.map((shift, index) => (
            <AnnounceShiftRow
              key={shift.id}
              shift={shift}
              index={index}
              onUpdate={updateShift}
              onRemove={removeShift}
              onEnableBreak={enableBreak}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addCustom}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "var(--wm-radius-10)",
          border: "1px dashed var(--wm-er-border)",
          background: "var(--wm-er-bg)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
          color: AMBER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <IconPlus /> Add Custom Shift or Break Shift
      </button>

      {errors.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          {errors.map((error, index) => (
            <div key={index} style={{ fontSize: 12, color: "var(--wm-error)" }}>
              {error}
            </div>
          ))}
        </div>
      )}

      <button
        className="wm-primarybtn"
        type="button"
        onClick={handleNext}
        disabled={shifts.length === 0}
        style={{
          width: "100%",
          background: shifts.length > 0 ? AMBER : "var(--wm-er-muted)",
          fontSize: 14,
          padding: "12px",
        }}
      >
        Next — Set Vacancies
      </button>
    </div>
  );
}
