// src/features/employer/hrManagement/components/LeaveManagementSection.tsx
//
// Employer's view of leave management for a specific employee.
// Shows balance, pending requests, and history.
// Used in HRCandidateDetailPage when status = "active".

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { LeaveBalanceCard } from "./LeaveBalanceCard";
import { LeaveRequestCard } from "./LeaveRequestCard";
import { useCandidateLeaveRequests } from "../helpers/leaveSubscription";
import { leaveManagementStorage } from "../storage/leaveManagement.storage";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { LeaveType } from "../types/leaveManagement.types";

type Props = {
  record: HRCandidateRecord;
};

/* ── Edit Allocation Modal ── */

function EditAllocationModal({
  open,
  hrCandidateId,
  onClose,
}: {
  open: boolean;
  hrCandidateId: string;
  onClose: () => void;
}) {
  const current = leaveManagementStorage.getAllocation(hrCandidateId);
  const [annual, setAnnual] = useState(String(current.annual));
  const [sick, setSick] = useState(String(current.sick));
  const [casual, setCasual] = useState(String(current.casual));

  const parse = (v: string) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) || n < 0 ? 0 : n;
  };

  const handleSave = () => {
    const allocations: Record<LeaveType, number> = {
      annual: parse(annual),
      sick: parse(sick),
      casual: parse(casual),
      unpaid: 0,
    };
    leaveManagementStorage.setAllocation(hrCandidateId, allocations);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 13,
    border: "1px solid var(--wm-er-border, #e5e7eb)",
    borderRadius: 8,
    outline: "none",
    background: "#fff",
    color: "var(--wm-er-text)",
    boxSizing: "border-box",
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Edit Leave Allocation" maxWidth={400}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>Edit Leave Allocation</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
          Set the annual leave allocation for this employee. Unpaid leave is always unlimited.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", display: "block", marginBottom: 4 }}>Annual Leave (days)</label>
            <input type="number" min={0} max={365} value={annual} onChange={(e) => setAnnual(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", display: "block", marginBottom: 4 }}>Sick Leave (days)</label>
            <input type="number" min={0} max={365} value={sick} onChange={(e) => setSick(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", display: "block", marginBottom: 4 }}>Casual Leave (days)</label>
            <input type="number" min={0} max={365} value={casual} onChange={(e) => setCasual(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" onClick={handleSave}>Save Allocation</button>
        </div>
      </div>
    </CenterModal>
  );
}

/* ── Main Section ── */

export function LeaveManagementSection({ record }: Props) {
  const requests = useCandidateLeaveRequests(record.id);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const historyRequests = requests.filter((r) => r.status !== "pending");
  const displayHistory = showAll ? historyRequests : historyRequests.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>Leave Management</div>
        <button className="wm-outlineBtn" type="button" onClick={() => setShowAllocationModal(true)} style={{ fontSize: 11, padding: "5px 12px" }}>Edit Allocation</button>
      </div>

      <LeaveBalanceCard hrCandidateId={record.id} />

      {pendingRequests.length > 0 && (
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, color: "#d97706", marginBottom: 8 }}>Pending Requests ({pendingRequests.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingRequests.map((req) => (
              <LeaveRequestCard key={req.id} request={req} mode="employer" />
            ))}
          </div>
        </div>
      )}

      {historyRequests.length > 0 && (
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)", marginBottom: 8 }}>Leave History</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayHistory.map((req) => (
              <LeaveRequestCard key={req.id} request={req} mode="employer" />
            ))}
          </div>
          {historyRequests.length > 3 && !showAll && (
            <button type="button" onClick={() => setShowAll(true)} style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "var(--wm-er-accent-hr)" }}>
              View all {historyRequests.length} records →
            </button>
          )}
        </div>
      )}

      {requests.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>No leave requests yet.</div>
      )}

      <EditAllocationModal open={showAllocationModal} hrCandidateId={record.id} onClose={() => setShowAllocationModal(false)} />
    </div>
  );
}
