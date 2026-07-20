// App name: Job Mitra
// File name: EmployerActiveEmployeeWorkspaceCard.tsx

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  filterActiveWorkspaceRecords,
  formatStaffDate,
  getActiveWorkspaceDepartments,
  getRecordDepartmentLabel,
  getStaffStatusLabel,
  getStaffStatusStyle,
  needsEmployerAction,
  type ActiveWorkspaceStatusFilter,
} from "../helpers/employerCareerRecords.helpers";

type Props = { records: StaffRecord[]; onOpenStaff: (staffId: string) => void };

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e40af";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

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
    <section style={CARD_STYLE}>
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

function ActiveStaffRow({
  record,
  onOpenStaff,
}: {
  record: StaffRecord;
  onOpenStaff: (staffId: string) => void;
}) {
  const actionNeeded = needsEmployerAction(record);
  return (
    <button
      type="button"
      onClick={() => onOpenStaff(record.id)}
      style={{
        ...STAFF_BUTTON_STYLE,
        border: actionNeeded
          ? "1px solid rgba(37, 99, 235, 0.25)"
          : "1px solid rgba(255, 255, 255, 0.9)",
        boxShadow: actionNeeded
          ? "0 8px 24px -4px rgba(37, 99, 235, 0.15)"
          : "0 4px 16px rgba(15, 23, 42, 0.03)",
        background: actionNeeded
          ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(239,246,255,0.7))"
          : "rgba(255, 255, 255, 0.7)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={STAFF_NAME_STYLE}>{record.employeeName}</div>
          <div style={STAFF_META_STYLE}>
            {record.employeeUniqueId || "No ID"} • {record.jobTitle}
          </div>
          <div style={DEPARTMENT_META_STYLE}>{getRecordDepartmentLabel(record)}</div>
        </div>
        <span
          style={{
            ...STATUS_BADGE_STYLE,
            ...getStaffStatusStyle(record.status),
            padding: "5px 10px",
            borderRadius: 12,
          }}
        >
          {getStaffStatusLabel(record.status)}
        </span>
      </div>
      {record.joinedAt && (
        <div style={JOINED_STYLE}>Joined: {formatStaffDate(record.joinedAt)}</div>
      )}
      <div style={FOOTER_ROW_STYLE}>
        <span style={ACTION_TEXT_STYLE}>{actionNeeded ? "Review required" : "Open workspace"}</span>
        <span style={ARROW_STYLE}>›</span>
      </div>
    </button>
  );
}

function EmptyWorkspaceState() {
  return (
    <div style={EMPTY_STYLE}>
      <div style={EMPTY_TITLE_STYLE}>No active employees yet</div>
      <div style={EMPTY_TEXT_STYLE}>
        After hiring, active employees will appear here for joining and employer follow-up.
      </div>
      <div style={EMPTY_GUIDE_GRID_STYLE}>
        <EmptyGuideChip title="Active only" text="Exited employees will not appear here." />
        <EmptyGuideChip
          title="Department ready"
          text="Filters will work after staff are assigned."
        />
      </div>
    </div>
  );
}

function EmptyGuideChip({ title, text }: { title: string; text: string }) {
  return (
    <div style={EMPTY_GUIDE_CHIP_STYLE}>
      <div style={EMPTY_GUIDE_TITLE_STYLE}>{title}</div>
      <div style={EMPTY_GUIDE_TEXT_STYLE}>{text}</div>
    </div>
  );
}

function SummaryChip({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "14px",
        borderRadius: 16,
        background: active ? "rgba(37, 99, 235, 0.05)" : "rgba(255, 255, 255, 0.7)",
        border: active ? "1px solid rgba(37, 99, 235, 0.15)" : "1px solid rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.8)",
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 700, color: CAREER_MUTED }}>{label}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: 19,
          fontWeight: 800,
          color: active ? CAREER_BLUE : "rgba(15,23,42,0.4)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ULTRA-PREMIUM STYLES
const CARD_STYLE: CSSProperties = {
  padding: 18,
  borderRadius: 24,
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
  display: "grid",
  gap: 14,
};
const EYEBROW_STYLE: CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 12,
  background: "rgba(37, 99, 235, 0.08)",
  border: "1px solid rgba(37, 99, 235, 0.12)",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: CAREER_BLUE_DEEP,
};
const TITLE_STYLE: CSSProperties = {
  marginTop: 8,
  fontSize: 17,
  fontWeight: 800,
  color: CAREER_TEXT,
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
};
const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 500,
  color: CAREER_MUTED,
  lineHeight: 1.45,
};
const COUNT_BADGE_STYLE: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 16,
  background: "rgba(37, 99, 235, 0.08)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11.5,
  fontWeight: 800,
  whiteSpace: "nowrap",
  flexShrink: 0,
  border: "1px solid rgba(37, 99, 235, 0.1)",
  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
};
const SUMMARY_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};
const FILTER_PANEL_STYLE: CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
};
const FILTER_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};
const INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 42,
  borderRadius: 12,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "#fff",
  padding: "0 12px",
  color: CAREER_TEXT,
  fontSize: 12.5,
  fontWeight: 600,
  outline: "none",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)",
  transition: "border-color 0.2s",
};
const CLEAR_BUTTON_STYLE: CSSProperties = {
  minHeight: 40,
  borderRadius: 12,
  border: "1px solid rgba(37, 99, 235, 0.15)",
  background: "rgba(37, 99, 235, 0.05)",
  color: CAREER_BLUE_DEEP,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform 0.1s var(--wm-motion-spring)",
};
const EMPTY_STYLE: CSSProperties = {
  padding: "20px 16px",
  borderRadius: 20,
  border: "1px dashed rgba(37, 99, 235, 0.2)",
  background: "rgba(37, 99, 235, 0.02)",
  textAlign: "center",
};
const FILTER_EMPTY_STYLE: CSSProperties = { ...EMPTY_STYLE, padding: "16px" };
const EMPTY_TITLE_STYLE: CSSProperties = { fontSize: 14.5, fontWeight: 800, color: CAREER_TEXT };
const EMPTY_TEXT_STYLE: CSSProperties = {
  margin: "6px auto 0",
  maxWidth: 320,
  fontSize: 12,
  color: CAREER_MUTED,
  lineHeight: 1.45,
  fontWeight: 500,
};
const EMPTY_GUIDE_GRID_STYLE: CSSProperties = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};
const EMPTY_GUIDE_CHIP_STYLE: CSSProperties = {
  padding: "12px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(255,255,255,0.9)",
  textAlign: "left",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
};
const EMPTY_GUIDE_TITLE_STYLE: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 800,
  color: CAREER_BLUE_DEEP,
};
const EMPTY_GUIDE_TEXT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 11.5,
  fontWeight: 500,
  color: CAREER_MUTED,
  lineHeight: 1.35,
};
const STAFF_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 20,
  cursor: "pointer",
  textAlign: "left",
  transition: "transform 0.1s var(--wm-motion-spring), box-shadow 0.2s ease",
};
const STAFF_NAME_STYLE: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};
const STAFF_META_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12.5,
  color: CAREER_MUTED,
  lineHeight: 1.4,
  fontWeight: 500,
};
const DEPARTMENT_META_STYLE: CSSProperties = {
  marginTop: 8,
  width: "fit-content",
  maxWidth: "100%",
  padding: "4px 10px",
  borderRadius: 10,
  background: "rgba(37, 99, 235, 0.06)",
  border: "1px solid rgba(37, 99, 235, 0.08)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11,
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const STATUS_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
  border: "1px solid transparent",
};
const JOINED_STYLE: CSSProperties = {
  marginTop: 10,
  fontSize: 12,
  color: CAREER_MUTED,
  fontWeight: 600,
};
const FOOTER_ROW_STYLE: CSSProperties = {
  marginTop: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};
const ACTION_TEXT_STYLE: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 800,
  color: CAREER_BLUE_DEEP,
};
const ARROW_STYLE: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 13,
  background: "rgba(37, 99, 235, 0.08)",
  color: CAREER_BLUE_DEEP,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  fontWeight: 800,
};
