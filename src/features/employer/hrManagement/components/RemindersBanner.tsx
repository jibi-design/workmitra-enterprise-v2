// src/features/employer/hrManagement/components/RemindersBanner.tsx
//
// Shows upcoming probation + contract expiration reminders
// at the top of HR Management page.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { useHRCandidates } from "../helpers/hrSubscription";

export function RemindersBanner() {
  const nav = useNavigate();
  const [nowMs] = useState(() => Date.now());

  // Trigger re-render on HR data changes
  useHRCandidates();

  const probationSoon = hrManagementStorage.getProbationReminders(14);
  const probationOverdue = hrManagementStorage.getProbationOverdue();
  const contractSoon = hrManagementStorage.getContractReminders(30);
  const contractOverdue = hrManagementStorage.getContractOverdue();

  const total = probationSoon.length + probationOverdue.length + contractSoon.length + contractOverdue.length;

  if (total === 0) return null;

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  const daysUntil = (ts: number) => Math.ceil((ts - nowMs) / 86400000);

  return (
    <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Overdue items (red) */}
      {probationOverdue.map((r) => (
        <ReminderCard
          key={`po-${r.id}`}
          icon="⚠"
          color="#dc2626"
          title="Probation Overdue"
          message={`${r.employeeName} — probation ended ${fmtDate(r.probationEndDate!)}. Confirm or extend.`}
          onClick={() => nav(`/employer/hr/candidate/${r.id}`)}
        />
      ))}
      {contractOverdue.map((r) => (
        <ReminderCard
          key={`co-${r.id}`}
          icon="⚠"
          color="#dc2626"
          title="Contract Expired"
          message={`${r.employeeName} — contract ended ${fmtDate(r.contractEndDate!)}. Renew or process exit.`}
          onClick={() => nav(`/employer/hr/candidate/${r.id}`)}
        />
      ))}

      {/* Upcoming items (amber) */}
      {probationSoon.map((r) => (
        <ReminderCard
          key={`ps-${r.id}`}
          icon="🔔"
          color="#d97706"
          title="Probation Ending Soon"
          message={`${r.employeeName} — ${daysUntil(r.probationEndDate!)} days left (${fmtDate(r.probationEndDate!)})`}
          onClick={() => nav(`/employer/hr/candidate/${r.id}`)}
        />
      ))}
      {contractSoon.map((r) => (
        <ReminderCard
          key={`cs-${r.id}`}
          icon="🔔"
          color="#d97706"
          title="Contract Expiring Soon"
          message={`${r.employeeName} — ${daysUntil(r.contractEndDate!)} days left (${fmtDate(r.contractEndDate!)})`}
          onClick={() => nav(`/employer/hr/candidate/${r.id}`)}
        />
      ))}
    </div>
  );
}

function ReminderCard({
  icon,
  color,
  title,
  message,
  onClick,
}: {
  icon: string;
  color: string;
  title: string;
  message: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: `1px solid ${color}25`,
        background: `${color}08`,
        cursor: "pointer",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 900, color, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 2, lineHeight: 1.4 }}>{message}</div>
      </div>
      <span style={{ fontSize: 14, color: "var(--wm-er-muted)", flexShrink: 0, alignSelf: "center" }}>→</span>
    </div>
  );
}
