// App name: Job Mitra
// File name: CareerPostStatusBadge.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerPostStatusBadge.tsx

type CareerPostStatusBadgeProps = {
  status: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
  active: { label: "Active", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  paused: { label: "Paused", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  closed: { label: "Closed", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  filled: { label: "Filled", color: "#3730a3", bg: "rgba(29,78,216,0.08)" },
};

export function CareerPostStatusBadge({ status }: CareerPostStatusBadgeProps) {
  const statusData = STATUS_MAP[status] ?? STATUS_MAP["draft"];

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: 999,
        background: statusData.bg,
        color: statusData.color,
        border: `1px solid ${statusData.color}33`,
      }}
    >
      {statusData.label}
    </span>
  );
}
