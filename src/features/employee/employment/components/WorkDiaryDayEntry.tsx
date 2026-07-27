// App name: Job Mitra
// File name: WorkDiaryDayEntry.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\WorkDiaryDayEntry.tsx

import { useState } from "react";
import type { WorkDayStatus, WorkDiaryFormData } from "../helpers/workDiary.types";
import { workDiaryStorage } from "../storage/workDiary.storage";
import { WD_STATUS_CONFIG } from "../helpers/workDiaryConstants";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { getInitialEntry } from "./WorkDiaryDayEntry.styles";
import { WorkDiaryDayEditView, WorkDiaryDayReadOnlyView } from "./WorkDiaryDayEntry.parts";

type Props = {
  dateKey: string;
  employmentId: string;
  currentStatus?: WorkDayStatus;
  readOnly?: boolean;
  onClose: () => void;
};

export function WorkDiaryDayEntry({
  dateKey,
  employmentId,
  currentStatus,
  readOnly = false,
  onClose,
}: Props) {
  const initial = getInitialEntry(employmentId, dateKey);

  const [status, setStatus] = useState<WorkDayStatus>(initial.status);
  const [punchIn, setPunchIn] = useState(initial.punchIn);
  const [punchOut, setPunchOut] = useState(initial.punchOut);
  const [location, setLocation] = useState(initial.location);
  const [notes, setNotes] = useState(initial.notes);
  const [clearConfirm, setClearConfirm] = useState<ConfirmData | null>(null);

  const calculatedHours = workDiaryStorage.calculateHours(punchIn, punchOut);
  const statusConfig = WD_STATUS_CONFIG[status];

  const handleSave = () => {
    const form: WorkDiaryFormData = {
      status,
      punchInTime: punchIn,
      punchOutTime: punchOut,
      location,
      notes,
    };

    workDiaryStorage.saveDayDetail(employmentId, dateKey, form);
    onClose();
  };

  const handleClearConfirm = () => {
    workDiaryStorage.deleteDayEntry(employmentId, dateKey);
    setClearConfirm(null);
    onClose();
  };

  if (readOnly) {
    return (
      <WorkDiaryDayReadOnlyView
        dateKey={dateKey}
        statusConfig={statusConfig}
        punchIn={punchIn}
        punchOut={punchOut}
        location={location}
        notes={notes}
        calculatedHours={calculatedHours}
        onClose={onClose}
      />
    );
  }

  return (
    <>
      <WorkDiaryDayEditView
        dateKey={dateKey}
        status={status}
        punchIn={punchIn}
        punchOut={punchOut}
        location={location}
        notes={notes}
        calculatedHours={calculatedHours}
        currentStatus={currentStatus}
        onStatusChange={setStatus}
        onPunchInChange={setPunchIn}
        onPunchOutChange={setPunchOut}
        onLocationChange={setLocation}
        onNotesChange={setNotes}
        onSave={handleSave}
        onClearRequest={() =>
          setClearConfirm({
            title: "Clear Diary Entry",
            message:
              "This will permanently delete this day's entry including times, location and notes. This action cannot be undone.",
            tone: "danger",
            confirmLabel: "Clear Entry",
            cancelLabel: "Keep It",
          })
        }
      />

      <ConfirmModal
        confirm={clearConfirm}
        onConfirm={handleClearConfirm}
        onCancel={() => setClearConfirm(null)}
      />
    </>
  );
}
