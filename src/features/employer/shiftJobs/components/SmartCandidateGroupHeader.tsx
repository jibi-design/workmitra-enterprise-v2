// App name: Job Mitra
// File name: SmartCandidateGroupHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\SmartCandidateGroupHeader.tsx

type SmartCandidateGroupHeaderProps = {
  title: string;
  subtitle: string;
  count: number;
  color: string;
  bg: string;
};

export function SmartCandidateGroupHeader({
  title,
  subtitle,
  count,
  color,
  bg,
}: SmartCandidateGroupHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: 10,
        background: bg,
        border: `1px solid ${color}22`,
        marginBottom: 8,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{title}</div>
        <div style={{ fontSize: 11, color, opacity: 0.8, marginTop: 1 }}>{subtitle}</div>
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          background: `${color}18`,
          padding: "3px 10px",
          borderRadius: 999,
        }}
      >
        {count}
      </span>
    </div>
  );
}
