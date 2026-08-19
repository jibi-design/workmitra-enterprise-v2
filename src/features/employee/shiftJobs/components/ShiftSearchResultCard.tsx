/** Shift search result card */

import type { KeyboardEvent, MouseEvent } from "react";
import { memo } from "react";
import { experienceLabel, formatShiftDateRange } from "../helpers/shiftSearchViewHelpers";
import type { ShiftPayBasis, ShiftPostDemo } from "../types/shiftSearch.types";

const SHIFT_GREEN = "var(--wm-shift-accent, #16a34a)";
const TEXT_DARK = "#0f172a";

type Props = {
  post: ShiftPostDemo;
  applied: boolean;
  quickApplyEnabled: boolean;
  onOpenDetails: (postId: string) => void;
  onQuickApply: (event: MouseEvent, postId: string) => void;
};

function ShiftSearchResultCardInner({
  post,
  applied,
  quickApplyEnabled,
  onOpenDetails,
  onQuickApply,
}: Props) {
  const jobTitle = getSafeText(post.jobName, "Shift work");
  const employerName = getSafeEntityText(post.companyName, "Employer not specified");
  const locationText = formatLocation(
    getSafeEntityText(post.locationName, "Location not specified"),
    post.distanceKm,
  );
  const payUi = getPayUi(post.payPerDay, post.payBasis);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter") onOpenDetails(post.id);
  }

  return (
    <article
      className="wm-shift-card wm-shift-pressable"
      role="button"
      tabIndex={0}
      data-shift-result-card={post.id}
      data-testid={`shift-search-result-${post.id}`}
      onClick={() => onOpenDetails(post.id)}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer", padding: 14, borderLeft: `4px solid ${SHIFT_GREEN}` }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, minWidth: 0, flex: 1 }}>
          <div className="wm-shift-logo" aria-hidden="true">
            {companyInitials(employerName)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, lineHeight: 1.25 }}>
              {jobTitle}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--wm-emp-muted, #64748b)",
              }}
            >
              {formatShiftDateRange(post.startAt, post.endAt)} • {locationText}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
      >
        <span className="wm-shift-pill wm-shift-pill--pay">
          {payUi.main}
          {!payUi.isTextOnly ? ` ${payUi.sub}` : ""}
        </span>
        <span className="wm-shift-pill wm-shift-pill--outline">
          {experienceLabel(post.experience)}
        </span>
        {applied ? (
          <span className="wm-shift-pill wm-shift-pill--applied">Already applied</span>
        ) : null}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button
          type="button"
          className="wm-shift-cta wm-shift-cta--ghost"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetails(post.id);
          }}
          style={{ flex: 1 }}
        >
          View Details
        </button>
        {quickApplyEnabled && (
          <button
            type="button"
            className="wm-shift-cta"
            disabled={applied}
            onClick={(event) => onQuickApply(event, post.id)}
            style={{ flex: 1, opacity: applied ? 0.6 : 1 }}
          >
            {applied ? "Applied ✓" : "Quick Apply"}
          </button>
        )}
      </div>
    </article>
  );
}

export const ShiftSearchResultCard = memo(ShiftSearchResultCardInner);

function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function getPayUi(
  amount: number,
  payBasis: ShiftPayBasis | undefined,
): { main: string; sub: string; isTextOnly: boolean } {
  if (payBasis === "not_listed") return { main: "Pay", sub: "not listed", isTextOnly: true };
  if (payBasis === "per_hour")
    return {
      main: amount > 0 ? String(amount) : "Pay",
      sub: amount > 0 ? "per hour" : "not listed",
      isTextOnly: amount <= 0,
    };
  if (payBasis === "fixed_total")
    return {
      main: amount > 0 ? String(amount) : "Pay",
      sub: amount > 0 ? "total" : "not listed",
      isTextOnly: amount <= 0,
    };
  return {
    main: amount > 0 ? String(amount) : "Pay",
    sub: amount > 0 ? "per day" : "not listed",
    isTextOnly: amount <= 0,
  };
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
  return getSafeText(value, fallback);
}
