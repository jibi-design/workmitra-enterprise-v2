// src/features/employee/careerJobs/components/DuplicateEmploymentWarning.tsx
//
// Session 17: Warning banner shown inside offer cards when employee
// is already "working" or "notice" in another career job.
// Inform only — does NOT block acceptance.

import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

/* ── Styles ── */
const AMBER = "#b45309";
const BANNER_BG = "rgba(180,83,9,0.06)";
const BANNER_BORDER = "rgba(180,83,9,0.25)";

export function DuplicateEmploymentWarning() {
  const profile = employeeProfileStorage.get();
  const employeeId = profile.uniqueId ?? "";
  if (!employeeId) return null;

  const activeRecords = employmentStorage.getActiveByEmployee(employeeId);
  const currentJob = activeRecords.find(
    (r) => r.status === "working" || r.status === "notice",
  );
  if (!currentJob) return null;

  const company = currentJob.companyName || "another company";

  return (
    <div style={{
      marginBottom: 10, padding: "10px 12px", borderRadius: 10,
      background: BANNER_BG, border: `1px solid ${BANNER_BORDER}`,
      display: "flex", alignItems: "flex-start", gap: 8,
    }}>
      <svg width={16} height={16} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
        <path fill={AMBER} d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
      </svg>
      <div style={{ fontSize: 12, color: AMBER, fontWeight: 600, lineHeight: 1.5 }}>
        You are currently working at {company}. Accepting a new offer will not end your current job automatically.
      </div>
    </div>
  );
}