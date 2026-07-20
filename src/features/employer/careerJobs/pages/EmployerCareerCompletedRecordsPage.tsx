// App name: Job Mitra
// File name: EmployerCareerCompletedRecordsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerCompletedRecordsPage.tsx

import type { CSSProperties } from "react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackTask,
} from "../../myStaff/storage/careerEmploymentFeedback.storage";
import { myStaffStorage, type StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  filterCompletedCareerRecords,
  getActiveWorkspaceDepartments,
  getFeedbackStatusForStaff,
  getFeedbackStatusLabel,
  getRecordDepartmentLabel,
  type FeedbackStatusFilter,
} from "../helpers/employerCareerRecords.helpers";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

let cachedCompletedStaffSnapshot: StaffRecord[] = [];
let cachedCompletedStaffSnapshotKey = "";

function getCompletedStaffSnapshot(): StaffRecord[] {
  const fresh = myStaffStorage.getAll().filter((record) => record.status === "exited");
  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedCompletedStaffSnapshotKey) {
    cachedCompletedStaffSnapshot = fresh;
    cachedCompletedStaffSnapshotKey = freshKey;
  }

  return cachedCompletedStaffSnapshot;
}

let cachedFeedbackSnapshot: CareerEmploymentFeedbackTask[] = [];
let cachedFeedbackSnapshotKey = "";

function getFeedbackSnapshot(): CareerEmploymentFeedbackTask[] {
  const fresh = careerEmploymentFeedbackStorage.getAll();
  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedFeedbackSnapshotKey) {
    cachedFeedbackSnapshot = fresh;
    cachedFeedbackSnapshotKey = freshKey;
  }

  return cachedFeedbackSnapshot;
}

function subscribeCompletedRecords(callback: () => void): () => void {
  const unsubscribeStaff = myStaffStorage.subscribe(callback);
  const unsubscribeFeedback = careerEmploymentFeedbackStorage.subscribe(callback);

  return () => {
    unsubscribeStaff();
    unsubscribeFeedback();
  };
}

export function EmployerCareerCompletedRecordsPage() {
  const nav = useNavigate();
  const records = useSyncExternalStore(
    subscribeCompletedRecords,
    getCompletedStaffSnapshot,
    getCompletedStaffSnapshot,
  );
  const feedbackTasks = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    getFeedbackSnapshot,
    getFeedbackSnapshot,
  );

  const [query, setQuery] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const departments = useMemo(() => getActiveWorkspaceDepartments(records), [records]);

  const filtered = useMemo(
    () =>
      filterCompletedCareerRecords({
        records,
        tasks: feedbackTasks,
        query,
        feedbackStatus,
        department: departmentFilter,
      }),
    [records, feedbackTasks, query, feedbackStatus, departmentFilter],
  );

  return (
    <div className="wm-er-vCareer" style={PAGE_STYLE}>
      <section style={HERO_STYLE}>
        <div style={EYEBROW_STYLE}>Closed employment</div>
        <div style={TITLE_STYLE}>Completed Career Records</div>
        <div style={SUBTITLE_STYLE}>
          Exited employees, closed work history, feedback status, and long-term staff lookup stay
          here, separate from active workspace.
        </div>
      </section>

      <section style={FILTER_CARD_STYLE}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, Unique ID, job, or department"
          style={INPUT_STYLE}
        />

        <div style={FILTER_GRID_STYLE}>
          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            style={INPUT_STYLE}
          >
            <option value="">Department: All</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={feedbackStatus}
            onChange={(event) => setFeedbackStatus(event.target.value as FeedbackStatusFilter)}
            style={INPUT_STYLE}
          >
            <option value="all">Feedback: All</option>
            <option value="pending">Feedback pending</option>
            <option value="completed">Feedback saved</option>
            <option value="none">No feedback yet</option>
          </select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <CompletedRecordsEmptyState hasAnyRecords={records.length > 0} />
      ) : (
        <section style={{ display: "grid", gap: 8 }}>
          {filtered.map((record) => (
            <CompactRecordRow
              key={record.id}
              record={record}
              feedbackStatus={getFeedbackStatusForStaff(record, feedbackTasks)}
              onOpen={() => nav(ROUTE_PATHS.employerStaffDetail.replace(":staffId", record.id))}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function CompletedRecordsEmptyState({ hasAnyRecords }: { hasAnyRecords: boolean }) {
  return (
    <section style={EMPTY_STATE_STYLE}>
      <div style={EMPTY_ICON_STYLE} aria-hidden="true">
        ✓
      </div>

      <div style={EMPTY_TITLE_STYLE}>
        {hasAnyRecords ? "No records match this filter" : "No completed Career records yet"}
      </div>

      <div style={EMPTY_TEXT_STYLE}>
        {hasAnyRecords
          ? "Try a different search term, department, or feedback status filter to find the completed staff record."
          : "Exited employees will appear here after employment is closed. This keeps old staff records separate from active employees."}
      </div>

      <div style={EMPTY_GUIDE_GRID_STYLE}>
        <EmptyGuideChip
          title="Long-term lookup"
          text="Search old staff by name, Unique ID, job, or department."
        />
        <EmptyGuideChip
          title="Feedback status"
          text="Track whether protected work feedback is pending or saved."
        />
      </div>
    </section>
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

function CompactRecordRow({
  record,
  feedbackStatus,
  onOpen,
}: {
  record: StaffRecord;
  feedbackStatus: "pending" | "completed" | "none";
  onOpen: () => void;
}) {
  const feedbackIsPending = feedbackStatus === "pending";
  const departmentLabel = getRecordDepartmentLabel(record);

  return (
    <button type="button" onClick={onOpen} style={RECORD_ROW_STYLE}>
      <div style={ROW_TOP_STYLE}>
        <div style={{ minWidth: 0 }}>
          <div style={RECORD_TITLE_STYLE}>{record.employeeName}</div>

          <div style={RECORD_META_STYLE}>
            {[record.employeeUniqueId, record.jobTitle].filter(Boolean).join(" - ")}
          </div>

          <div style={DEPARTMENT_META_STYLE}>{departmentLabel}</div>
        </div>

        <span style={EXIT_BADGE_STYLE}>Exited</span>
      </div>

      <div style={ROW_BOTTOM_STYLE}>
        <span
          style={{
            ...FEEDBACK_BADGE_STYLE,
            color: feedbackIsPending ? CAREER_BLUE_DEEP : "rgba(15,23,42,0.62)",
            background: feedbackIsPending ? "rgba(29,78,216,0.08)" : "rgba(15,23,42,0.055)",
          }}
        >
          {getFeedbackStatusLabel(feedbackStatus)}
        </span>

        <span style={OPEN_TEXT_STYLE}>View record</span>
      </div>
    </button>
  );
}

const PAGE_STYLE: CSSProperties = {
  display: "grid",
  gap: 12,
  paddingBottom: 30,
};

const HERO_STYLE: CSSProperties = {
  padding: 16,
  borderRadius: 28,
  border: "1px solid rgba(29,78,216,0.18)",
  background:
    "radial-gradient(circle at 92% 0%, rgba(29,78,216,0.15), transparent 34%), linear-gradient(145deg, rgba(255,255,255,1), rgba(239,246,255,0.92))",
  boxShadow: "0 20px 44px rgba(15,23,42,0.1)",
};

const EYEBROW_STYLE: CSSProperties = {
  fontSize: 10.2,
  fontWeight: 950,
  color: CAREER_BLUE,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};

const TITLE_STYLE: CSSProperties = {
  marginTop: 6,
  fontSize: 22,
  fontWeight: 950,
  color: CAREER_TEXT,
  lineHeight: 1.1,
};

const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 7,
  fontSize: 12.3,
  color: CAREER_MUTED,
  lineHeight: 1.5,
  fontWeight: 720,
};

const FILTER_CARD_STYLE: CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 12,
  borderRadius: 20,
  border: "1px solid rgba(29,78,216,0.12)",
  background: "rgba(255,255,255,0.92)",
};

const FILTER_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 40,
  borderRadius: 13,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#fff",
  padding: "0 11px",
  color: CAREER_TEXT,
  fontSize: 12,
  fontWeight: 750,
  outline: "none",
};

const EMPTY_STATE_STYLE: CSSProperties = {
  padding: 17,
  borderRadius: 24,
  border: "1px dashed rgba(29,78,216,0.2)",
  background:
    "radial-gradient(circle at 92% 0%, rgba(29,78,216,0.09), transparent 34%), linear-gradient(145deg, rgba(255,255,255,0.94), rgba(248,250,252,0.9))",
  textAlign: "center",
  boxShadow: "0 12px 28px rgba(15,23,42,0.045)",
};

const EMPTY_ICON_STYLE: CSSProperties = {
  width: 42,
  height: 42,
  margin: "0 auto",
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(29,78,216,0.08)",
  border: "1px solid rgba(29,78,216,0.12)",
  color: CAREER_BLUE,
  fontSize: 20,
  fontWeight: 950,
};

const EMPTY_TITLE_STYLE: CSSProperties = {
  marginTop: 11,
  fontSize: 15,
  fontWeight: 950,
  color: CAREER_TEXT,
};

const EMPTY_TEXT_STYLE: CSSProperties = {
  margin: "6px auto 0",
  maxWidth: 360,
  fontSize: 12,
  fontWeight: 720,
  color: CAREER_MUTED,
  lineHeight: 1.55,
};

const EMPTY_GUIDE_GRID_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const EMPTY_GUIDE_CHIP_STYLE: CSSProperties = {
  padding: "9px 10px",
  borderRadius: 15,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(29,78,216,0.09)",
  textAlign: "left",
};

const EMPTY_GUIDE_TITLE_STYLE: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 950,
  color: CAREER_BLUE_DEEP,
};

const EMPTY_GUIDE_TEXT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 10.8,
  fontWeight: 720,
  color: CAREER_MUTED,
  lineHeight: 1.4,
};

const RECORD_ROW_STYLE: CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: 18,
  border: "1px solid rgba(29,78,216,0.11)",
  background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
  boxShadow: "0 8px 20px rgba(15,23,42,0.045)",
  textAlign: "left",
  cursor: "pointer",
};

const ROW_TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};

const ROW_BOTTOM_STYLE: CSSProperties = {
  marginTop: 9,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const RECORD_TITLE_STYLE: CSSProperties = {
  fontSize: 14.5,
  fontWeight: 950,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};

const RECORD_META_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 11.6,
  color: CAREER_MUTED,
  lineHeight: 1.35,
  fontWeight: 760,
};

const DEPARTMENT_META_STYLE: CSSProperties = {
  marginTop: 5,
  width: "fit-content",
  maxWidth: "100%",
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(29,78,216,0.065)",
  color: CAREER_BLUE_DEEP,
  fontSize: 10.4,
  fontWeight: 950,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const EXIT_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 10.2,
  fontWeight: 950,
  whiteSpace: "nowrap",
  color: "rgba(15,23,42,0.62)",
  background: "rgba(15,23,42,0.055)",
};

const FEEDBACK_BADGE_STYLE: CSSProperties = {
  minWidth: 0,
  padding: "5px 8px",
  borderRadius: 999,
  fontSize: 10.5,
  fontWeight: 950,
  whiteSpace: "nowrap",
};

const OPEN_TEXT_STYLE: CSSProperties = {
  color: CAREER_BLUE_DEEP,
  fontSize: 11,
  fontWeight: 950,
  whiteSpace: "nowrap",
};
