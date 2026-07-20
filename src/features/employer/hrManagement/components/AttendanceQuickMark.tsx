// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AttendanceQuickMark.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\AttendanceQuickMark.tsx

import { useState } from "react";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import type { AttendanceDayFormData, AttendanceDayStatus } from "../types/attendanceLog.types";
import { AttendanceQuickMarkForm } from "./attendanceQuickMark/AttendanceQuickMarkForm";

type QuickMarkProps = {
  dateKey: string;
  hrCandidateId: string;
  currentStatus?: AttendanceDayStatus;
  onClose: () => void;
};

function getInitialEntry(hrCandidateId: string, dateKey: string) {
  const entry = attendanceLogStorage.getDayEntry(hrCandidateId, dateKey);

  return {
    status: entry?.status ?? ("present" as AttendanceDayStatus),
    signIn: entry?.signInTime ?? "",
    signOut: entry?.signOutTime ?? "",
    location: entry?.location ?? "",
    note: entry?.note ?? "",
  };
}

export function AttendanceQuickMark({
  dateKey,
  hrCandidateId,
  currentStatus,
  onClose,
}: QuickMarkProps) {
  const initial = getInitialEntry(hrCandidateId, dateKey);

  const [status, setStatus] = useState<AttendanceDayStatus>(initial.status);
  const [signIn, setSignIn] = useState(initial.signIn);
  const [signOut, setSignOut] = useState(initial.signOut);
  const [location, setLocation] = useState(initial.location);
  const [note, setNote] = useState(initial.note);
  const [clearConfirm, setClearConfirm] = useState<ConfirmData | null>(null);

  const calculatedHours = attendanceLogStorage.calculateHours(signIn, signOut);

  const handleSave = () => {
    const form: AttendanceDayFormData = {
      status,
      signInTime: signIn,
      signOutTime: signOut,
      location,
      note,
    };

    attendanceLogStorage.saveDayDetail(hrCandidateId, dateKey, form);
    onClose();
  };

  const handleClearRequest = () => {
    setClearConfirm({
      title: "Clear Attendance Entry",
      message:
        "This will permanently delete all attendance data for this date including sign in/out times, location and notes. This action cannot be undone.",
      tone: "danger",
      confirmLabel: "Clear Entry",
      cancelLabel: "Keep It",
    });
  };

  const handleClearConfirm = () => {
    attendanceLogStorage.deleteDayEntry(hrCandidateId, dateKey);
    setClearConfirm(null);
    onClose();
  };

  return (
    <>
      <AttendanceQuickMarkForm
        dateKey={dateKey}
        currentStatus={currentStatus}
        status={status}
        signIn={signIn}
        signOut={signOut}
        location={location}
        note={note}
        calculatedHours={calculatedHours}
        onStatusChange={setStatus}
        onSignInChange={setSignIn}
        onSignOutChange={setSignOut}
        onLocationChange={setLocation}
        onNoteChange={setNote}
        onSave={handleSave}
        onClearRequest={handleClearRequest}
      />

      <ConfirmModal
        confirm={clearConfirm}
        onConfirm={handleClearConfirm}
        onCancel={() => setClearConfirm(null)}
      />
    </>
  );
}
