// src/features/employer/myStaff/components/StatusBadge.tsx

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "#16a34a" },
  probation: { label: "Probation", color: "#0284c7" },
  resignation_pending: { label: "Resignation Pending", color: "#d97706" },
  notice_period: { label: "Notice Period", color: "#d97706" },
  exited: { label: "Exited", color: "#6b7280" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP["active"];
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 900,
        padding: "2px 8px",
        borderRadius: 999,
        background: s.color + "14",
        color: s.color,
        border: "1px solid " + s.color + "33",
      }}
    >
      {s.label}
    </span>
  );
}