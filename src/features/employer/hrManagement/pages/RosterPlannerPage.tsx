// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterPlannerPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\pages\RosterPlannerPage.tsx

import { useCallback, useMemo, useState } from "react";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { RosterAssignModal } from "../components/RosterAssignModal";
import { RosterConflictBanner } from "../components/RosterConflictBanner";
import { RosterAssignmentDetailModal } from "../components/rosterPlanner/RosterAssignmentDetailModal";
import { RosterPlannerGridPanel } from "../components/rosterPlanner/RosterPlannerGridPanel";
import { RosterPlannerHeader } from "../components/rosterPlanner/RosterPlannerHeader";
import { useRosterForRange } from "../helpers/rosterPlannerHooks";
import {
  detectConflicts,
  formatDateShort,
  getMonthCalendarDates,
  getWeekDates,
  shiftMonth,
  shiftWeek,
} from "../helpers/rosterPlannerUtils";
import { rosterPlannerStorage } from "../storage/rosterPlanner.storage";
import type { RosterAssignment, RosterViewMode } from "../types/rosterPlanner.types";

export function RosterPlannerPage() {
  const [view, setView] = useState<RosterViewMode>("weekly");
  const [refDate, setRefDate] = useState(new Date());
  const [monthYear, setMonthYear] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [assignDate, setAssignDate] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<RosterAssignment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);
  const monthCalDates = useMemo(
    () => getMonthCalendarDates(monthYear.year, monthYear.month),
    [monthYear.year, monthYear.month],
  );

  const startDate = view === "weekly" ? weekDates[0] : monthCalDates[0];
  const endDate = view === "weekly" ? weekDates[6] : monthCalDates[monthCalDates.length - 1];

  const assignments = useRosterForRange(startDate, endDate);
  const conflicts = useMemo(() => detectConflicts(assignments), [assignments]);

  const handlePrev = useCallback(() => {
    if (view === "weekly") {
      setRefDate((date) => shiftWeek(date, -1));
    } else {
      setMonthYear((monthValue) => shiftMonth(monthValue.year, monthValue.month, -1));
    }
  }, [view]);

  const handleNext = useCallback(() => {
    if (view === "weekly") {
      setRefDate((date) => shiftWeek(date, 1));
    } else {
      setMonthYear((monthValue) => shiftMonth(monthValue.year, monthValue.month, 1));
    }
  }, [view]);

  const handleToday = useCallback(() => {
    setRefDate(new Date());
    setMonthYear({ year: new Date().getFullYear(), month: new Date().getMonth() });
  }, []);

  const navTitle =
    view === "weekly"
      ? `${formatDateShort(weekDates[0])} to ${formatDateShort(weekDates[6])}`
      : new Date(monthYear.year, monthYear.month).toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        });

  const handleAddClick = (date: string) => setAssignDate(date);

  const handleAssignmentClick = (assignment: RosterAssignment) => setSelectedAssignment(assignment);

  const handleDayClick = (date: string) => {
    setRefDate(new Date(`${date}T00:00:00`));
    setView("weekly");
  };

  const handleAssignSuccess = () => {
    setSuccessMsg("Staff assigned successfully!");
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleDeleteAssignment = () => {
    if (!selectedAssignment) return;

    setDeleteConfirm({
      title: "Remove Assignment",
      message: `Remove ${selectedAssignment.employeeName} from ${selectedAssignment.site} on ${formatDateShort(
        selectedAssignment.date,
      )}?`,
      tone: "danger",
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
  };

  const handleDeleteConfirm = () => {
    if (selectedAssignment) {
      rosterPlannerStorage.deleteAssignment(selectedAssignment.id);
      setSelectedAssignment(null);
      setDeleteConfirm(null);
      setSuccessMsg("Assignment removed.");
      setTimeout(() => setSuccessMsg(""), 2500);
    }
  };

  return (
    <div>
      <RosterPlannerHeader
        view={view}
        navTitle={navTitle}
        successMsg={successMsg}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      <RosterConflictBanner conflicts={conflicts} />

      <RosterPlannerGridPanel
        view={view}
        weekDates={weekDates}
        monthCalDates={monthCalDates}
        currentMonth={monthYear.month}
        assignments={assignments}
        conflicts={conflicts}
        onAddClick={handleAddClick}
        onAssignmentClick={handleAssignmentClick}
        onDayClick={handleDayClick}
      />

      {assignDate && (
        <RosterAssignModal
          open={!!assignDate}
          date={assignDate}
          onClose={() => setAssignDate(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {selectedAssignment && !deleteConfirm && (
        <RosterAssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onDelete={handleDeleteAssignment}
        />
      )}

      <ConfirmModal
        confirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirm(null);
          setSelectedAssignment(null);
        }}
      />
    </div>
  );
}
