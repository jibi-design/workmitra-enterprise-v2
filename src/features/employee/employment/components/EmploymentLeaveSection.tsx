// src/features/employee/employment/components/EmploymentLeaveSection.tsx
//
// Leave balance + requests + apply button for active employees.

import { useState } from "react";
import { LeaveBalanceCard } from "../../../employer/hrManagement/components/LeaveBalanceCard";
import { LeaveRequestCard } from "../../../employer/hrManagement/components/LeaveRequestCard";
import { useCandidateLeaveRequests } from "../../../employer/hrManagement/helpers/leaveSubscription";

type Props = {
  hrCandidateId: string;
  onApplyLeave: () => void;
};

export function EmploymentLeaveSection({ hrCandidateId, onApplyLeave }: Props) {
  const leaveRequests = useCandidateLeaveRequests(hrCandidateId);
  const [showAll, setShowAll] = useState(false);
  const displayLeave = showAll ? leaveRequests : leaveRequests.slice(0, 3);

  return (
    <div className="wm-ee-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>Leave</div>
        <button
          className="wm-primarybtn"
          type="button"
          onClick={onApplyLeave}
          style={{ fontSize: 11, padding: "6px 14px" }}
        >
          Apply for Leave
        </button>
      </div>

      <LeaveBalanceCard hrCandidateId={hrCandidateId} />

      {leaveRequests.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: "var(--wm-emp-text, var(--wm-er-text))", marginBottom: 8 }}>My Leave Requests</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayLeave.map((req) => (
              <LeaveRequestCard key={req.id} request={req} mode="employee" />
            ))}
          </div>
          {leaveRequests.length > 3 && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#2563eb" }}
            >
              View all {leaveRequests.length} requests
            </button>
          )}
        </div>
      )}
    </div>
  );
}