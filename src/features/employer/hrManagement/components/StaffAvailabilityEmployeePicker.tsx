// src/features/employer/hrManagement/components/StaffAvailabilityEmployeePicker.tsx
//
// Employee picker for Staff Availability Request.
// Simple mode: flat checkbox selection.
// Batch mode: select employees + assign to priority batches.

import { useState, useMemo } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type {
  AvailabilityFormEmployee,
  AvailabilityFormBatch,
} from "../types/staffAvailability.types";
import { MAX_BATCHES } from "../helpers/staffAvailabilityConstants";
import { AvailabilityEmployeeList } from "./AvailabilityEmployeeList";
import { AvailabilityBatchArrangement } from "./AvailabilityBatchArrangement";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  employees: HRCandidateRecord[];
  mode: "simple" | "batch";
  selectedEmployees: AvailabilityFormEmployee[];
  onSelectedChange: (selected: AvailabilityFormEmployee[]) => void;
  batches: AvailabilityFormBatch[];
  onBatchesChange: (batches: AvailabilityFormBatch[]) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function StaffAvailabilityEmployeePicker({
  employees,
  mode,
  selectedEmployees,
  onSelectedChange,
  batches,
  onBatchesChange,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedIds = useMemo(() => {
    if (mode === "simple") {
      return new Set(selectedEmployees.map((e) => e.hrCandidateId));
    }
    const ids = new Set<string>();
    batches.forEach((b) => b.employees.forEach((e) => ids.add(e.hrCandidateId)));
    return ids;
  }, [mode, selectedEmployees, batches]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase().trim();
    return employees.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.jobTitle.toLowerCase().includes(q) ||
        (r.department?.toLowerCase().includes(q) ?? false) ||
        (r.location?.toLowerCase().includes(q) ?? false),
    );
  }, [employees, searchQuery]);

  const toggleEmployee = (record: HRCandidateRecord) => {
    const emp: AvailabilityFormEmployee = {
      hrCandidateId: record.id,
      employeeName: record.employeeName,
    };

    if (mode === "simple") {
      if (selectedIds.has(record.id)) {
        onSelectedChange(selectedEmployees.filter((e) => e.hrCandidateId !== record.id));
      } else {
        onSelectedChange([...selectedEmployees, emp]);
      }
    } else {
      if (selectedIds.has(record.id)) {
        const updated = batches.map((b) => ({
          ...b,
          employees: b.employees.filter((e) => e.hrCandidateId !== record.id),
        }));
        onBatchesChange(updated);
      } else {
        if (batches.length === 0) {
          onBatchesChange([{ batchNumber: 1, employees: [emp] }]);
        } else {
          const updated = [...batches];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            employees: [...updated[lastIdx].employees, emp],
          };
          onBatchesChange(updated);
        }
      }
    }
  };

  const moveEmployeeToBatch = (hrCandidateId: string, fromBatch: number, toBatch: number) => {
    const emp = batches
      .find((b) => b.batchNumber === fromBatch)
      ?.employees.find((e) => e.hrCandidateId === hrCandidateId);
    if (!emp) return;

    const updated = batches.map((b) => {
      if (b.batchNumber === fromBatch) {
        return { ...b, employees: b.employees.filter((e) => e.hrCandidateId !== hrCandidateId) };
      }
      if (b.batchNumber === toBatch) {
        return { ...b, employees: [...b.employees, emp] };
      }
      return b;
    });

    const cleaned = updated.filter((b) => b.employees.length > 0 || updated.length === 1);
    const renumbered = cleaned.map((b, i) => ({ ...b, batchNumber: i + 1 }));
    onBatchesChange(renumbered);
  };

  const addBatch = () => {
    if (batches.length >= MAX_BATCHES) return;
    onBatchesChange([...batches, { batchNumber: batches.length + 1, employees: [] }]);
  };

  const totalSelected = selectedIds.size;
  const hasBatchContent = mode === "batch" && totalSelected > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)" }}>
            Select Employees
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
            {totalSelected > 0 ? `${totalSelected} selected` : "Tap to select employees"}
          </div>
        </div>
      </div>

      <AvailabilityEmployeeList
        employees={employees}
        filtered={filtered}
        selectedIds={selectedIds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggle={toggleEmployee}
        hasBatchContent={hasBatchContent}
      />

      {hasBatchContent && (
        <AvailabilityBatchArrangement
          batches={batches}
          onMove={moveEmployeeToBatch}
          onAddBatch={addBatch}
        />
      )}
    </div>
  );
}