// src/features/employer/hrManagement/components/LeaveBalanceCard.tsx
//
// Displays leave balance for an employee.
// Used in both employer HR detail and employee employment detail.

import { leaveManagementStorage } from "../storage/leaveManagement.storage";
import { LEAVE_TYPE_LABELS } from "../types/leaveManagement.types";
import type { LeaveBalance } from "../types/leaveManagement.types";

type Props = {
  hrCandidateId: string;
};

const typeColors: Record<string, string> = {
  annual: "#7c3aed",
  sick: "#dc2626",
  casual: "#d97706",
  unpaid: "#64748b",
};

function BalanceRow({ balance }: { balance: LeaveBalance }) {
  const color = typeColors[balance.leaveType] ?? "#64748b";
  const isUnpaid = balance.leaveType === "unpaid";
  const pct = isUnpaid ? 0 : balance.allocated > 0 ? Math.round((balance.used / balance.allocated) * 100) : 0;

  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
          {LEAVE_TYPE_LABELS[balance.leaveType]}
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>
          {isUnpaid ? "Unlimited" : `${balance.remaining} left`}
        </span>
      </div>

      {!isUnpaid && (
        <>
          <div style={{ height: 4, borderRadius: 999, background: "var(--wm-er-border, #e5e7eb)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, borderRadius: 999, background: color, transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--wm-er-muted)", marginTop: 3 }}>
            <span>Used: {balance.used}</span>
            {balance.pending > 0 && <span>Pending: {balance.pending}</span>}
            <span>Allocated: {balance.allocated}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function LeaveBalanceCard({ hrCandidateId }: Props) {
  const balances = leaveManagementStorage.getBalance(hrCandidateId);

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 8 }}>
        Leave Balance
      </div>
      {balances.map((b) => (
        <BalanceRow key={b.leaveType} balance={b} />
      ))}
    </div>
  );
}
