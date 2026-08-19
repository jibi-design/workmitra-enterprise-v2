// App name: Job Mitra
// File name: ShiftTimelineHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\ShiftTimelineHeader.tsx

import { REPLACEMENT_REASON_LABEL, STATUS_HELPER, STATUS_TITLE } from "./shiftTimeline.constants";
import { formatDateTime } from "./shiftTimeline.logic";
import { MUTED, RED_DARK, TEXT_DARK, getBadgeVisual } from "./shiftTimeline.styles";
import type { ShiftApplicationStatus, ShiftReplacementReason } from "./shiftTimeline.types";

export type ShiftTimelineHeaderProps = {
  readonly status: ShiftApplicationStatus;
  readonly shiftTitle?: string;
  readonly employerName?: string;
  readonly locationName?: string;
  readonly startAt?: number;
  readonly endAt?: number;
  readonly replacementReason?: ShiftReplacementReason;
};

export function ShiftTimelineHeader({
  status,
  shiftTitle,
  employerName,
  locationName,
  startAt,
  endAt,
  replacementReason,
}: ShiftTimelineHeaderProps) {
  const startText = formatDateTime(startAt);
  const endText = formatDateTime(endAt);
  const badgeVisual = getBadgeVisual(status);

  return (
    <header style={{ display: "grid", gap: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: TEXT_DARK,
              lineHeight: 1.25,
            }}
          >
            {STATUS_TITLE[status]}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: 750,
              color: MUTED,
              lineHeight: 1.45,
            }}
          >
            {STATUS_HELPER[status]}
          </div>
        </div>

        <span
          style={{
            flexShrink: 0,
            borderRadius: "var(--wm-radius-pill)",
            padding: "6px 10px",
            border: `1px solid ${badgeVisual.border}`,
            background: badgeVisual.background,
            color: badgeVisual.color,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.2,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {status}
        </span>
      </div>

      {(shiftTitle || employerName || locationName || startText || endText) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {shiftTitle && <TimelineMetaPill label="Shift" value={shiftTitle} />}
          {employerName && <TimelineMetaPill label="Employer" value={employerName} />}
          {locationName && <TimelineMetaPill label="Location" value={locationName} />}
          {startText && <TimelineMetaPill label="Start" value={startText} />}
          {endText && <TimelineMetaPill label="End" value={endText} />}
        </div>
      )}

      {status === "replaced" && replacementReason && (
        <div
          style={{
            borderRadius: "var(--wm-radius-chip)",
            border: "1px solid rgba(220, 38, 38, 0.18)",
            background: "rgba(254, 242, 242, 0.72)",
            padding: "10px 12px",
            color: RED_DARK,
            fontSize: 12,
            fontWeight: 850,
            lineHeight: 1.45,
          }}
        >
          Replacement reason: {REPLACEMENT_REASON_LABEL[replacementReason]}
        </div>
      )}
    </header>
  );
}

function TimelineMetaPill({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        borderRadius: "var(--wm-radius-pill)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        background: "rgba(255, 255, 255, 0.88)",
        padding: "6px 9px",
        fontSize: 10,
        fontWeight: 900,
        color: TEXT_DARK,
        maxWidth: "100%",
      }}
      title={`${label}: ${value}`}
    >
      <span style={{ color: MUTED }}>{label}</span>
      <span
        style={{
          maxWidth: 150,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </span>
  );
}
