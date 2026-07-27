import type { StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  formatStaffDate,
  getRecordDepartmentLabel,
  getStaffStatusLabel,
  getStaffStatusStyle,
  needsEmployerAction,
} from "../helpers/employerCareerRecords.helpers";
import {
  ACTION_TEXT_STYLE,
  ARROW_STYLE,
  CAREER_BLUE,
  CAREER_MUTED,
  DEPARTMENT_META_STYLE,
  EMPTY_GUIDE_CHIP_STYLE,
  EMPTY_GUIDE_GRID_STYLE,
  EMPTY_GUIDE_TEXT_STYLE,
  EMPTY_GUIDE_TITLE_STYLE,
  EMPTY_STYLE,
  EMPTY_TEXT_STYLE,
  EMPTY_TITLE_STYLE,
  FOOTER_ROW_STYLE,
  JOINED_STYLE,
  STAFF_BUTTON_STYLE,
  STAFF_META_STYLE,
  STAFF_NAME_STYLE,
  STATUS_BADGE_STYLE,
} from "./EmployerActiveEmployeeWorkspaceCard.styles";

export function ActiveStaffRow({
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
          gap: "var(--wm-space-10)",
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
            borderRadius: "var(--wm-radius-button)",
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

export function EmptyWorkspaceState() {
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

export function SummaryChip({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "14px",
        borderRadius: "var(--wm-radius-chip)",
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
