// App name: Job Mitra
// File name: ShiftSearchResultsList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchResultsList.tsx

import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { isAlreadyApplied } from "../../shiftJobs/helpers/shiftSearchHelpers";
import { experienceLabel, formatShiftDateRange } from "../helpers/shiftSearchViewHelpers";
import type { ShiftPayBasis, ShiftPostDemo } from "../types/shiftSearch.types";

const SHIFT_GREEN = "#16a34a";
const TEXT_DARK = "#0f172a";

type Props = {
  discoverableCount: number;
  filteredPosts: ShiftPostDemo[];
  hasFilters: boolean;
  quickApplyEnabled: boolean;
  appliedIds: Set<string>;
  onOpenDetails: (postId: string) => void;
  onQuickApply: (event: MouseEvent, postId: string) => void;
  onClearFilters: () => void;
  onOpenProfile: () => void;
};

const SECTION_HEADER_STYLE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "0 2px",
};

const RESULT_CARD_STYLE: CSSProperties = {
  cursor: "pointer",
  borderLeft: `5px solid ${SHIFT_GREEN}`,
  borderRadius: 26,
  border: "1px solid rgba(148,163,184,0.22)",
  background:
    "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.99) 48%, rgba(240,253,244,0.62))",
  boxShadow: "0 20px 46px rgba(15,23,42,0.11)",
};

const PAY_BADGE_STYLE: CSSProperties = {
  minWidth: 72,
  padding: "11px 11px",
  borderRadius: 20,
  background: "linear-gradient(180deg, rgba(22,163,74,0.16), rgba(240,253,244,0.98))",
  border: "1px solid rgba(22,163,74,0.24)",
  textAlign: "center",
  flexShrink: 0,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.82), 0 8px 18px rgba(22,163,74,0.08)",
};

const META_GRID_STYLE: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
};

function EmptyResults({
  hasFilters,
  onClearFilters,
  onOpenProfile,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 14,
        textAlign: "left",
        borderRadius: 24,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 950, color: TEXT_DARK }}>
        No matching shifts found
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        {hasFilters
          ? "Your filters may be too narrow. Try changing date, category, worker type, or area keyword."
          : "New shifts will appear here when employers post matching opportunities."}
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          borderRadius: 14,
          background: "rgba(240,253,244,0.7)",
          border: "1px solid rgba(22,163,74,0.16)",
          fontSize: 12,
          color: "var(--wm-er-muted)",
          fontWeight: 750,
          lineHeight: 1.5,
        }}
      >
        Tip: try a wider date range, a nearby area keyword, or clear filters to see more available
        shifts.
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: hasFilters ? "1fr 1fr" : "1fr",
          gap: 8,
        }}
      >
        {hasFilters && (
          <button className="wm-primarybtn" type="button" onClick={onClearFilters}>
            Clear Filters
          </button>
        )}

        <button
          className="wm-outlineBtn"
          type="button"
          onClick={onOpenProfile}
          style={{ transition: "transform 0.2s ease" }}
          onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
          onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Update Profile
        </button>
      </div>
    </section>
  );
}

export function ShiftSearchResultsList({
  discoverableCount,
  filteredPosts,
  hasFilters,
  quickApplyEnabled,
  appliedIds,
  onOpenDetails,
  onQuickApply,
  onClearFilters,
  onOpenProfile,
}: Props) {
  return (
    <section style={{ marginTop: 18, marginBottom: 20 }}>
      <div style={SECTION_HEADER_STYLE}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 950, color: TEXT_DARK }}>Available Shifts</div>
          <div style={{ marginTop: 3, fontSize: 12, color: "var(--wm-er-muted)" }}>
            {filteredPosts.length} of {discoverableCount} shift{discoverableCount !== 1 ? "s" : ""}{" "}
            shown
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              border: "1px solid rgba(22,163,74,0.2)",
              background: "rgba(22,163,74,0.08)",
              color: SHIFT_GREEN,
              fontSize: 11,
              fontWeight: 950,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyResults
          hasFilters={hasFilters}
          onClearFilters={onClearFilters}
          onOpenProfile={onOpenProfile}
        />
      ) : (
        <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
          {filteredPosts.map((post) => {
            const applied = appliedIds.has(post.id) || isAlreadyApplied(post.id);

            return (
              <ShiftResultCard
                key={post.id}
                post={post}
                applied={applied}
                quickApplyEnabled={quickApplyEnabled}
                onOpenDetails={onOpenDetails}
                onQuickApply={onQuickApply}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function ShiftResultCard({
  post,
  applied,
  quickApplyEnabled,
  onOpenDetails,
  onQuickApply,
}: {
  post: ShiftPostDemo;
  applied: boolean;
  quickApplyEnabled: boolean;
  onOpenDetails: (postId: string) => void;
  onQuickApply: (event: MouseEvent, postId: string) => void;
}) {
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
      className="wm-ee-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(post.id)}
      onKeyDown={handleKeyDown}
      style={RESULT_CARD_STYLE}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 950,
              color: TEXT_DARK,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {jobTitle}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 850,
              color: "var(--wm-er-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {employerName}
          </div>
        </div>

        <div style={PAY_BADGE_STYLE}>
          <div
            style={{
              fontSize: payUi.isTextOnly ? 13 : 19,
              fontWeight: 950,
              color: SHIFT_GREEN,
              lineHeight: 1,
            }}
          >
            {payUi.main}
          </div>
          <div style={{ marginTop: 5, fontSize: 10, fontWeight: 900, color: "var(--wm-er-muted)" }}>
            {payUi.sub}
          </div>
        </div>
      </div>

      <div style={META_GRID_STYLE}>
        <MiniInfo label="Location" value={locationText} />
        <MiniInfo label="Date" value={formatShiftDateRange(post.startAt, post.endAt)} />
        <MiniInfo label="Worker type" value={experienceLabel(post.experience)} />
      </div>

      <div
        style={{ marginTop: 8, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}
      >
        {applied && (
          <span
            style={{
              padding: "4px 9px",
              borderRadius: 999,
              background: "rgba(22,163,74,0.09)",
              border: "1px solid rgba(22,163,74,0.18)",
              color: SHIFT_GREEN,
              fontSize: 11,
              fontWeight: 950,
            }}
          >
            Already applied
          </span>
        )}

        {applied && (
          <span
            style={{
              padding: "4px 9px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.04)",
              border: "1px solid rgba(148,163,184,0.18)",
              color: "var(--wm-er-muted)",
              fontSize: 11,
              fontWeight: 850,
            }}
          >
            Track status in My Applications
          </span>
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetails(post.id);
          }}
          style={{
            flex: 1,
            minHeight: 42,
            borderRadius: 16,
            border: "1px solid rgba(22,163,74,0.2)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,253,244,0.86))",
            color: TEXT_DARK,
            fontSize: 14,
            fontWeight: 950,
            cursor: "pointer",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78), 0 8px 18px rgba(15,23,42,0.055)",
          }}
        >
          View Details
        </button>

        {quickApplyEnabled && (
          <button
            className={`wm-primarybtn wm-press-btn${applied ? " wm-actionLocked" : ""}`}
            type="button"
            disabled={applied}
            onClick={(event) => onQuickApply(event, post.id)}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 16,
            }}
          >
            {applied ? "Applied ✓" : "Quick Apply"}
          </button>
        )}
      </div>
    </article>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 9px",
        borderRadius: 15,
        background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.96))",
        border: "1px solid rgba(203,213,225,0.86)",
        minWidth: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 950,
          color: TEXT_DARK,
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
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
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
