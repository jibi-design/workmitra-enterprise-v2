// App name: Job Mitra
// File name: EmployerActiveEmployeeWorkspaceCard.tsx

import { useMemo, useState } from "react";
import type { StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  filterActiveWorkspaceRecords,
  getActiveWorkspaceDepartments,
  needsEmployerAction,
  type ActiveWorkspaceStatusFilter,
} from "../helpers/employerCareerRecords.helpers";
import {
  ActiveStaffRow,
  EmptyWorkspaceState,
  SummaryChip,
} from "./EmployerActiveEmployeeWorkspaceCard.parts";
import {
  CARD_STYLE,
  CLEAR_BUTTON_STYLE,
  COUNT_BADGE_STYLE,
  EYEBROW_STYLE,
  EMPTY_TEXT_STYLE,
  EMPTY_TITLE_STYLE,
  FILTER_EMPTY_STYLE,
  FILTER_GRID_STYLE,
  FILTER_PANEL_STYLE,
  INPUT_STYLE,
  SUBTITLE_STYLE,
  SUMMARY_GRID_STYLE,
  TITLE_STYLE,
} from "./EmployerActiveEmployeeWorkspaceCard.styles";

type Props = { records: StaffRecord[]; onOpenStaff: (staffId: string) => void };

export function EmployerActiveEmployeeWorkspaceCard({ records, onOpenStaff }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActiveWorkspaceStatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const actionCount = records.filter(needsEmployerAction).length;
  const departments = useMemo(() => getActiveWorkspaceDepartments(records), [records]);
  const filteredRecords = useMemo(
    () =>
      filterActiveWorkspaceRecords({
        records,
        query,
        status: statusFilter,
        department: departmentFilter,
      }),
    [records, query, statusFilter, departmentFilter],
  );
  const hasActiveFilters = Boolean(query.trim() || statusFilter !== "all" || departmentFilter);

  return (
    <section className="wm-er-card wm-career-card wm-career-card--employer wm-homeGlassCard--domainCareer" style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={EYEBROW_STYLE}>Active staff</div>
          <div style={TITLE_STYLE}>Active Employee Workspace</div>
          <div style={SUBTITLE_STYLE}>
            Search current employees by name, Unique ID, department, or work status.
          </div>
        </div>
        <span style={COUNT_BADGE_STYLE}>{records.length} active</span>
      </div>

      <div style={SUMMARY_GRID_STYLE}>
        <SummaryChip label="Current records" value={records.length} active={records.length > 0} />
        <SummaryChip label="Needs action" value={actionCount} active={actionCount > 0} />
      </div>

      {records.length === 0 ? (
        <EmptyWorkspaceState />
      ) : (
        <>
          <div style={FILTER_PANEL_STYLE}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, Unique ID, role"
              style={INPUT_STYLE}
            />
            <div style={FILTER_GRID_STYLE}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ActiveWorkspaceStatusFilter)}
                style={INPUT_STYLE}
              >
                <option value="all">Status: All</option>
                <option value="joining_pending">Joining Pending</option>
                <option value="active">Currently Working</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={INPUT_STYLE}
              >
                <option value="">Department: All</option>
                {departments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setDepartmentFilter("");
                }}
                style={CLEAR_BUTTON_STYLE}
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredRecords.length === 0 ? (
            <div style={FILTER_EMPTY_STYLE}>
              <div style={EMPTY_TITLE_STYLE}>No match found</div>
              <div style={EMPTY_TEXT_STYLE}>Try another name, department, or status.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredRecords.map((record) => (
                <ActiveStaffRow key={record.id} record={record} onOpenStaff={onOpenStaff} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
