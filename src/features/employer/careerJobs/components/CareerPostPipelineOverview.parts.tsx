import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
} from "./CareerPostPipelineOverview.helpers";

export function StageBox({ label, count }: { label: string; count: number }) {
  const active = count > 0;

  return (
    <div
      className="wm-stat-box"
      style={{
        minWidth: 0,
        padding: "16px 10px",
        borderRadius: "var(--wm-radius-chip)",
        textAlign: "center",
        background: active ? "#ffffff" : "rgba(248,250,252,0.6)",
        border: active ? "1px solid rgba(37,99,235,0.2)" : "1px solid rgba(0,0,0,0.04)",
        boxShadow: active ? "0 4px 12px rgba(37,99,235,0.06)" : "0 2px 6px rgba(0,0,0,0.02)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
          }}
        />
      )}
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: active ? CAREER_BLUE : "rgba(15,23,42,0.3)",
          lineHeight: 1,
        }}
      >
        {count}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          fontWeight: 900,
          color: active ? CAREER_BLUE_DEEP : CAREER_MUTED,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function HealthBox({
  icon,
  label,
  value,
  helper,
}: {
  icon: string;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div
      className="wm-health-box"
      style={{
        minWidth: 0,
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(248,250,252,0.8)",
        border: "1px solid rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 20, flexShrink: 0, opacity: 0.8 }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: CAREER_MUTED,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 14,
            fontWeight: 900,
            color: CAREER_TEXT,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 12,
            fontWeight: 700,
            color: CAREER_MUTED,
            lineHeight: 1.3,
          }}
        >
          {helper}
        </div>
      </div>
    </div>
  );
}
