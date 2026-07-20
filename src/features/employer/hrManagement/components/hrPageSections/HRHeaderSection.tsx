// App: Job Mitra / WorkMitra_Enterprise_v2
// File: HRHeaderSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrPageSections\HRHeaderSection.tsx

import { useNavigate } from "react-router-dom";

export function HRHeaderSection() {
  const nav = useNavigate();

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 900, fontSize: 18, color: "var(--wm-er-text, #0f172a)" }}>
        Staff Lifecycle
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
        Manage your team from hiring to exit.
      </div>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={() => nav("/employer/console/attendance")}
        style={{ marginTop: 10, fontSize: 12, padding: "8px 16px" }}
      >
        Daily Attendance
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/bulk-task")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Bulk Task Assign
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/notices")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Company Notices
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/availability")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Staff Availability
      </button>

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={() => nav("/employer/console/roster")}
        style={{ marginTop: 6, fontSize: 12, padding: "8px 16px" }}
      >
        Team Calendar
      </button>
    </div>
  );
}
