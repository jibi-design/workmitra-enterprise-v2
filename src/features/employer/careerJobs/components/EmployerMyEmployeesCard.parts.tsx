import type { StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  formatDate,
  getStatusLabel,
  getStatusStyle,
  INACTIVE_BADGE_BG,
  INACTIVE_BADGE_TEXT,
  needsAction,
} from "./EmployerMyEmployeesCard.helpers";

export function WorkspaceIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3Zm2 0h4V4h-4v2Zm9 6h-5v2h-4v-2H5v7h14v-7Z"
      />
    </svg>
  );
}

export function SummaryChip({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  const isActive = active ?? value > 0;

  return (
    <div
      style={{
        minWidth: 0,
        padding: "9px 10px",
        borderRadius: "var(--wm-radius-chip)",
        background: isActive ? "rgba(29,78,216,0.07)" : INACTIVE_BADGE_BG,
        border: isActive ? "1px solid rgba(29,78,216,0.11)" : "1px solid rgba(15,23,42,0.045)",
      }}
    >
      <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>{label}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: 16,
          fontWeight: 950,
          color: isActive ? CAREER_BLUE : INACTIVE_BADGE_TEXT,
        }}
      >
        {value}
      </div>
    </div>
  );
}

type EmployeeRowProps = {
  record: StaffRecord;
  onOpenPost: (careerPostId: string) => void;
};

export function EmployeeWorkspaceRow({ record, onOpenPost }: EmployeeRowProps) {
  const actionNeeded = needsAction(record);
  const statusStyle = getStatusStyle(record.status);
  const openTarget = record.careerPostId ?? record.id;

  return (
    <button
      key={record.id}
      type="button"
      onClick={() => onOpenPost(openTarget)}
      style={{
        width: "100%",
        padding: 14,
        borderRadius: "var(--wm-radius-employee-card)",
        border: actionNeeded ? "1px solid rgba(29,78,216,0.22)" : "1px solid rgba(29,78,216,0.11)",
        background: actionNeeded
          ? "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(255,255,255,0.98))"
          : "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        boxShadow: actionNeeded
          ? "0 12px 24px rgba(29,78,216,0.07)"
          : "0 8px 18px rgba(15,23,42,0.035)",
        cursor: "pointer",
        textAlign: "left",
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
          <div style={{ fontSize: 14, fontWeight: 950, color: CAREER_TEXT, lineHeight: 1.22 }}>
            {record.employeeName}
          </div>
          <div style={{ marginTop: 5, fontSize: 12, color: CAREER_MUTED, lineHeight: 1.42 }}>
            {record.jobTitle}
            {record.category ? ` - ${record.category}` : ""}
          </div>
        </div>

        <span
          style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 950,
            padding: "5px 9px",
            borderRadius: "var(--wm-radius-pill)",
            whiteSpace: "nowrap",
            ...statusStyle,
          }}
        >
          {getStatusLabel(record.status)}
        </span>
      </div>

      {record.joinedAt && (
        <div style={{ marginTop: 7, fontSize: 11, color: CAREER_MUTED, fontWeight: 850 }}>
          Joined: {formatDate(record.joinedAt)}
        </div>
      )}

      {record.status === "notice_period" && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 9px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(217,119,6,0.08)",
            color: "#b45309",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          Notice period active
        </div>
      )}

      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 950, color: CAREER_BLUE_DEEP }}>
          {actionNeeded
            ? "Review required"
            : record.status !== "exited"
              ? "Open workspace"
              : "View record"}
        </span>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "var(--wm-radius-pill)",
            background: "rgba(29,78,216,0.055)",
            color: CAREER_BLUE_DEEP,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontWeight: 950,
          }}
        >
          ›
        </span>
      </div>
    </button>
  );
}

export function EmptyWorkspaceState() {
  return (
    <div
      style={{
        padding: "15px 13px",
        borderRadius: "var(--wm-radius-chip)",
        border: "1px dashed rgba(29,78,216,0.17)",
        background: "rgba(255,255,255,0.76)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 950, color: CAREER_TEXT }}>
        No hired employee workspace yet
      </div>
      <div style={{ marginTop: 5, fontSize: 12, color: CAREER_MUTED, lineHeight: 1.5 }}>
        Hired candidates will appear here for status, completion, and rating follow-up.
      </div>
    </div>
  );
}
