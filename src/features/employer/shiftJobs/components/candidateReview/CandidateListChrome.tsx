/** EmployerShiftCandidateList chrome helpers */

import { JobMitraBrandName } from "../../../../../shared/components/brand/BrandName";

type CompareModeBarProps = {
  enabled: boolean;
  selectedCount: number;
  onToggle: () => void;
  onOpenCompare: () => void;
};

export function CompareModeBar({
  enabled,
  selectedCount,
  onToggle,
  onOpenCompare,
}: CompareModeBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "10px 11px",
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid rgba(22,163,74,0.14)",
        background: "linear-gradient(180deg, rgba(240,253,244,0.64), rgba(255,255,255,0.98))",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          border: "1px solid rgba(22,163,74,0.18)",
          background: enabled ? "#16a34a" : "#ffffff",
          color: enabled ? "#ffffff" : "#166534",
          borderRadius: "var(--wm-radius-pill)",
          padding: "8px 11px",
          fontSize: 11,
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        {enabled ? "Exit Compare" : "Compare Applicants"}
      </button>

      <button
        type="button"
        onClick={onOpenCompare}
        disabled={selectedCount < 2}
        style={{
          border: "none",
          background: selectedCount >= 2 ? "#0f172a" : "rgba(15,23,42,0.12)",
          color: "#ffffff",
          borderRadius: "var(--wm-radius-pill)",
          padding: "8px 11px",
          fontSize: 11,
          fontWeight: 900,
          cursor: selectedCount >= 2 ? "pointer" : "not-allowed",
        }}
      >
        Open Compare ({selectedCount}/3)
      </button>

      <div style={{ fontSize: 11, fontWeight: 750, color: "var(--wm-er-muted)" }}>
        Select 2–3 applicants to compare answers and profile snapshots.
      </div>
    </div>
  );
}

export function BackupPromotionHint() {
  return (
    <div
      className="wm-er-card"
      style={{
        padding: 14,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(217,119,6,0.18)",
        background: "linear-gradient(180deg, rgba(255,251,235,0.9), rgba(255,255,255,0.98))",
        boxShadow: "0 12px 26px rgba(217,119,6,0.08)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 950, color: "#92400e" }}>
        Backup candidates are ready
      </div>
      <div
        style={{ marginTop: 6, fontSize: 11, fontWeight: 750, color: "#b45309", lineHeight: 1.5 }}
      >
        If a confirmed worker is replaced, review this list and use Confirm manually.{" "}
        <JobMitraBrandName size="sm" /> will not auto-confirm a backup worker without employer
        action.
      </div>
    </div>
  );
}
