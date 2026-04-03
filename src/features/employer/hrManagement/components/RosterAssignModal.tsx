// src/features/employer/hrManagement/components/RosterAssignModal.tsx
//
// Assign staff to a date — site-first flow.

import { useState, useMemo } from "react";
import type { CSSProperties } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { rosterPlannerStorage } from "../storage/rosterPlanner.storage";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { formatDateShort } from "../helpers/rosterPlannerUtils";
import { myStaffStorage } from "../../myStaff/storage/myStaff.storage";
import { RosterEmployeeSelector } from "./RosterEmployeeSelector";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const INPUT: CSSProperties = {
  width: "100%", padding: "10px 12px", fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8, outline: "none", background: "#fff",
  color: "var(--wm-er-text)", boxSizing: "border-box" as const,
};

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)",
  display: "block", marginBottom: 4,
};

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  open: boolean;
  date: string;
  onClose: () => void;
  onSuccess: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function RosterAssignModal({ open, date, onClose, onSuccess }: Props) {
  const shiftDefaults = companyConfigStorage.getShiftTimes();

  const [site, setSite] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [shiftStart, setShiftStart] = useState(shiftDefaults.start);
  const [shiftEnd, setShiftEnd] = useState(shiftDefaults.end);
  const [note, setNote] = useState("");

  const employees = useMemo<HRCandidateRecord[]>(
    () => (open ? hrManagementStorage.getAll().filter((r) => r.status === "active") : []),
    [open],
  );

  const existingSites = useMemo(
    () => (open ? rosterPlannerStorage.getUniqueSites() : []),
    [open],
  );

   const categories = useMemo(() => {
    const staffCats = myStaffStorage.getCategories().map((c) => c.name);
    return ["all", ...staffCats];
  }, []);

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (selectedCategory !== "all") {
      list = list.filter((e) => (e.department?.trim() ?? "") === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((e) =>
        e.employeeName.toLowerCase().includes(q) || e.jobTitle.toLowerCase().includes(q),
      );
    }
    return list;
  }, [employees, selectedCategory, search]);

  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    for (const id of selectedIds) {
      if (rosterPlannerStorage.hasAssignmentOnDate(id, date)) ids.add(id);
    }
    return ids;
  }, [selectedIds, date]);

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const emp of filteredEmployees) next.add(emp.id);
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const emp of filteredEmployees) next.delete(emp.id);
      return next;
    });
  };

  const allFilteredSelected = filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedIds.has(e.id));
  const canSubmit = site.trim().length > 0 && selectedIds.size > 0 && shiftStart && shiftEnd;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const empList = employees
      .filter((e) => selectedIds.has(e.id))
      .map((e) => ({ hrCandidateId: e.id, employeeName: e.employeeName }));

    rosterPlannerStorage.createBulkAssignments({
      date, site: site.trim(), shiftStart, shiftEnd,
      note: note.trim(), employees: empList,
    });
    handleClose();
    onSuccess();
  };

  const handleClose = () => {
    setSite(""); setSelectedCategory("all"); setSelectedIds(new Set());
    setSearch(""); setShiftStart(shiftDefaults.start); setShiftEnd(shiftDefaults.end);
    setNote(""); onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Assign Staff" maxWidth={480}>
      <div style={{ padding: 20, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>Assign Staff</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2, marginBottom: 16 }}>
          {formatDateShort(date)}
        </div>

        {/* Site */}
        <div style={{ marginBottom: 14 }}>
          <label style={LABEL}>Site / Location *</label>
          <input type="text" value={site} onChange={(e) => setSite(e.target.value)}
            placeholder="e.g. Main Office, Site A, Warehouse B" list="roster-sites" style={INPUT} />
          {existingSites.length > 0 && (
            <datalist id="roster-sites">
              {existingSites.map((s) => <option key={s} value={s} />)}
            </datalist>
          )}
        </div>

        {/* Employee Selector */}
        <RosterEmployeeSelector
          employees={employees}
          filteredEmployees={filteredEmployees}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => { setSelectedCategory(cat); setSearch(""); }}
          selectedIds={selectedIds}
          conflictIds={conflictIds}
          search={search}
          onSearchChange={setSearch}
          onToggle={toggleEmployee}
          onSelectAll={selectAllFiltered}
          onDeselectAll={deselectAllFiltered}
          allFilteredSelected={allFilteredSelected}
        />

        {/* Shift Times */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={LABEL}>Start Time</label>
            <input type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>End Time</label>
            <input type="time" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} style={INPUT} />
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 16 }}>
          <label style={LABEL}>Note (optional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Overtime, cover shift" style={INPUT} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={handleClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" onClick={handleSubmit}
            disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}>
            {selectedIds.size > 0 ? `Assign ${selectedIds.size} Staff` : "Assign Staff"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}