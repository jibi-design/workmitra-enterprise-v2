// App name: Job Mitra
// File name: ShiftSearchSections.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchSections.tsx

export type { ShiftCardData } from "../types/shiftSearchSection.types";

import { useState } from "react";
import type { ReactNode } from "react";
import type { ShiftCardData } from "../types/shiftSearchSection.types";
import { HorizontalShiftCardRail } from "./HorizontalShiftCardRail";
import { shiftSearchSectionWrapStyle } from "./ShiftSearchSectionStyles";

type SectionRailProps = {
  cards: ShiftCardData[];
  onOpen: (id: string) => void;
};

type RecommendedProps = SectionRailProps & {
  title: string;
  subtitle: string;
};

export function RecommendedSection({ cards, title, subtitle, onOpen }: RecommendedProps) {
  if (cards.length === 0) return null;

  return (
    <SearchSectionShell title={title} subtitle={subtitle} cards={cards}>
      <HorizontalShiftCardRail cards={cards} onOpen={onOpen} getSubtitle={getRecommendedSubtitle} />
    </SearchSectionShell>
  );
}

export function RecentlyViewedSection({ cards, onOpen }: SectionRailProps) {
  if (cards.length === 0) return null;

  return (
    <SearchSectionShell
      title="Recently Viewed"
      subtitle="Shifts opened recently on this device"
      cards={cards}
      collapsedByDefault
    >
      <HorizontalShiftCardRail
        cards={cards}
        onOpen={onOpen}
        getSubtitle={getRecommendedSubtitle}
        getFooter={() => "Opened on this device"}
      />
    </SearchSectionShell>
  );
}

export function StarredShiftsSection({ cards, onOpen }: SectionRailProps) {
  if (cards.length === 0) return null;

  return (
    <SearchSectionShell
      title="Saved Shifts"
      subtitle="Shifts saved on this device for quick review"
      cards={cards}
      collapsedByDefault
    >
      <HorizontalShiftCardRail
        cards={cards}
        onOpen={onOpen}
        getSubtitle={getRecommendedSubtitle}
        getFooter={() => "Saved on this device"}
      />
    </SearchSectionShell>
  );
}

function SearchSectionShell({
  title,
  subtitle,
  cards,
  children,
  collapsedByDefault = false,
}: {
  title: string;
  subtitle: string;
  cards: ShiftCardData[];
  children: ReactNode;
  collapsedByDefault?: boolean;
}) {
  const [expanded, setExpanded] = useState(!collapsedByDefault);
  const firstCard = cards[0];
  const previewText = firstCard
    ? `${getSafeEntityText(firstCard.jobName, "Shift work")} · ${getSafeEntityText(firstCard.companyName, "Employer not specified")}`
    : "No shifts yet";

  return (
    <div
      style={{
        ...shiftSearchSectionWrapStyle,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(22,163,74,0.16)",
        background: "linear-gradient(180deg, rgba(240,253,244,0.72), rgba(255,255,255,0.98))",
        boxShadow: "0 12px 28px rgba(15,23,42,0.055)",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>{title}</div>

            <div
              style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, lineHeight: 1.45 }}
            >
              {subtitle}
            </div>

            {collapsedByDefault && (
              <div
                style={{
                  marginTop: 9,
                  fontSize: 12,
                  fontWeight: 900,
                  color: "var(--wm-er-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 260,
                }}
              >
                {previewText}
              </div>
            )}
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 82,
              height: 34,
              padding: "0 12px",
              borderRadius: "var(--wm-radius-pill)",
              border: "1px solid rgba(22,163,74,0.2)",
              background: expanded
                ? "linear-gradient(180deg, rgba(22,163,74,0.14), rgba(240,253,244,0.9))"
                : "rgba(255,255,255,0.9)",
              color: "var(--wm-er-accent-shift, #16a34a)",
              fontSize: 11,
              fontWeight: 950,
              whiteSpace: "nowrap",
              boxShadow: "0 6px 14px rgba(15,23,42,0.045)",
            }}
          >
            {expanded ? "Hide" : `Show ${cards.length}`}
          </div>
        </div>
      </button>

      {expanded && children}
    </div>
  );
}

function getRecommendedSubtitle(card: ShiftCardData): string {
  const parts = [getSafeEntityText(card.companyName, "Employer not specified")];
  const locationName = getSafeEntityText(card.locationName, "Location not specified");

  if (locationName) {
    parts.push(locationName);
  }

  if (card.distanceKm > 0 && locationName !== "Location not specified") {
    parts.push(`${card.distanceKm} km`);
  }

  return parts.join(" · ");
}

function getSafeEntityText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
