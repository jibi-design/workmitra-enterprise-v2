// src/features/employer/hrManagement/components/StaffAvailabilityRequestCard.tsx
//
// Individual request card for Staff Availability (Root Map Section 7.4.13).
// Shows title, status, mode, date, time, response summary.
// Tap opens detail modal.

import type { StaffAvailabilityRequest } from "../types/staffAvailability.types";
import { REQUEST_STATUS_CONFIG, MODE_CONFIG } from "../helpers/staffAvailabilityConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  request: StaffAvailabilityRequest;
  onOpen: (id: string) => void;
};

export function StaffAvailabilityRequestCard({ request, onOpen }: Props) {
  const sCfg = REQUEST_STATUS_CONFIG[request.status];
  const mCfg = MODE_CONFIG[request.mode];
  const isPast = request.status !== "open";

  return (
    <button
      type="button"
      onClick={() => onOpen(request.id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: 10,
        border: `1px solid ${request.status === "open" ? "#bfdbfe" : "var(--wm-er-border, #e5e7eb)"}`,
        background: isPast ? "#fafafa" : "#fff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* Row 1: Title + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: isPast
              ? "var(--wm-er-muted)"
              : "var(--wm-er-text)",
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {request.title}
        </div>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 800,
            background: sCfg.bg,
            color: sCfg.color,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {sCfg.label}
        </span>
      </div>

      {/* Row 2: Meta info */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 11,
          color: "var(--wm-er-muted)",
        }}
      >
        <span>📅 {formatDate(request.dateNeeded)}</span>
        {request.timeNeeded && <span>🕐 {request.timeNeeded}</span>}
        {request.location && <span>📍 {request.location}</span>}
        <span>{mCfg.icon} {mCfg.label}</span>
      </div>

      {/* Row 3: Response summary */}
      <div
        style={{
          display: "flex",
          gap: 10,
          fontSize: 11,
          fontWeight: 700,
          marginTop: 2,
        }}
      >
        <span style={{ color: "#15803d" }}>
          ✅ {request.acceptedCount}/{request.requiredCount} accepted
        </span>
        {request.mode === "batch" && request.status === "open" && (
          <span style={{ color: "#0369a1" }}>
            Batch {request.activeBatchNumber}/{request.batches.length}
          </span>
        )}
      </div>
    </button>
  );
}
