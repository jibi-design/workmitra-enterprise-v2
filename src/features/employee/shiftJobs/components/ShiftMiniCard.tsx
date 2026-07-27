// App name: Job Mitra
// File name: ShiftMiniCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftMiniCard.tsx

import type { CSSProperties, KeyboardEvent } from "react";
import type { ShiftCardData } from "../types/shiftSearchSection.types";
import {
  SHIFT_SEARCH_GREEN,
  shiftSearchAppliedBadgeStyle,
  shiftSearchMiniCardStyle,
} from "./ShiftSearchSectionStyles";

type ShiftMiniCardProps = {
  card: ShiftCardData;
  subtitle: string;
  footer?: string;
  onOpen: (id: string) => void;
};

const META_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 6,
  marginTop: 10,
};

const ACTION_ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 12,
};

const OPEN_TEXT_STYLE: CSSProperties = {
  minHeight: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 10px",
  borderRadius: "var(--wm-radius-pill)",
  border: "1px solid rgba(22,163,74,0.18)",
  background: "rgba(22,163,74,0.07)",
  fontSize: 11,
  fontWeight: 950,
  color: SHIFT_SEARCH_GREEN,
  whiteSpace: "nowrap",
};

export function ShiftMiniCard({ card, subtitle, footer, onOpen }: ShiftMiniCardProps) {
  const jobTitle = getSafeText(card.jobName, "Shift work");
  const employerName = getSafeEntityText(card.companyName, "Employer not specified");
  const locationName = getSafeEntityText(card.locationName, "Location not specified");
  const categoryName = getSafeText(card.category, "General work");

  function openCard() {
    onOpen(card.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter") openCard();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      style={shiftSearchMiniCardStyle}
      onClick={openCard}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 950,
              color: "var(--wm-er-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.25,
            }}
          >
            {jobTitle}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 750,
              color: "var(--wm-er-muted)",
              marginTop: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {employerName}
          </div>
        </div>

        {card.isApplied ? <span style={shiftSearchAppliedBadgeStyle}>Applied</span> : null}
      </div>

      <div style={{ fontSize: 12, fontWeight: 950, color: SHIFT_SEARCH_GREEN, marginTop: 9 }}>
        Pay: {card.payPerDay} / day
      </div>

      <div style={META_GRID_STYLE}>
        <MiniMeta label="Location" value={formatLocation(locationName, card.distanceKm)} />
        <MiniMeta label="Date" value={card.dateLabel} />
        <MiniMeta label="Timing" value={card.timingLabel} />
        <MiniMeta label="Duration" value={card.durationLabel} />
        <MiniMeta label="Worker type" value={card.workerTypeLabel} />
      </div>

      <div style={ACTION_ROW_STYLE}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 850,
            color: "var(--wm-er-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {footer || `Category: ${categoryName}` || subtitle}
        </span>

        <span style={OPEN_TEXT_STYLE}>View Details</span>
      </div>
    </article>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "76px minmax(0, 1fr)",
        gap: 8,
        alignItems: "center",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.25,
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: 11,
          fontWeight: 850,
          color: "var(--wm-er-text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatLocation(locationName: string, distanceKm: number): string {
  if (locationName === "Location not specified") return locationName;
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return locationName;
  return `${locationName} - ${distanceKm} km`;
}

function getSafeText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function getSafeEntityText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
