// src/shared/employerProfile/EmployerTrustBadge.tsx
//
// Reusable employer trust badge for search cards, workspace, vault.
// Shows: ★ average + level badge + rating count + WM ID (optional).
// Reads from employerPublicProfileService.

import { useCallback, useMemo, useState } from "react";
import {
  getEmployerQuickInfo,
  EMPLOYER_LEVEL_COLORS,
  EMPLOYER_LEVEL_BG,
} from "./employerPublicProfileService";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";

/* ── Props ─────────────────────────────────────── */

type Props = {
  /** Pass explicitly if available. Falls back to employerSettingsStorage. */
  employerWmId?: string;
  /** "compact" = inline row (search cards). "full" = stacked with WM ID. */
  variant?: "compact" | "full";
  /** Domain accent color for star. Defaults to muted. */
  accentColor?: string;
};

/* ── Component ─────────────────────────────────── */

export function EmployerTrustBadge({
  employerWmId,
  variant = "compact",
  accentColor,
}: Props) {
  const wmId = employerWmId || employerSettingsStorage.get().uniqueId || "";

  const info = useMemo(
    () => (wmId ? getEmployerQuickInfo(wmId) : null),
    [wmId],
  );

  if (!info) return null;

  const levelColor = EMPLOYER_LEVEL_COLORS[info.level];
  const levelBg = EMPLOYER_LEVEL_BG[info.level];
  const starColor = accentColor || "#f59e0b";
  const hasRatings = info.totalRatings > 0;

  if (variant === "compact") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        flexWrap: "wrap", marginTop: 4,
      }}>
        {/* Star + Average */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 12, fontWeight: 700, color: hasRatings ? starColor : "var(--wm-er-muted, #94a3b8)",
        }}>
          <span style={{ fontSize: 13 }}>&#9733;</span>
          {hasRatings ? info.averageStars.toFixed(1) : "—"}
        </span>

        {/* Level badge */}
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: "2px 8px", borderRadius: 10,
          background: levelBg, color: levelColor,
          display: "inline-flex", alignItems: "center",
        }}>
          {info.levelLabel}
        </span>

        {/* Rating count */}
        <span style={{ fontSize: 11, color: "var(--wm-er-muted, #94a3b8)" }}>
          {info.totalRatings} {info.totalRatings === 1 ? "rating" : "ratings"}
        </span>
      </div>
    );
  }

  /* variant === "full" */
  return (
    <div style={{ marginTop: 6 }}>
      {/* Row 1: Star + Level + Count */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 13, fontWeight: 700, color: hasRatings ? starColor : "var(--wm-er-muted, #94a3b8)",
        }}>
          <span style={{ fontSize: 14 }}>&#9733;</span>
          {hasRatings ? info.averageStars.toFixed(1) : "—"}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: "2px 10px", borderRadius: 10,
          background: levelBg, color: levelColor,
        }}>
          {info.levelLabel}
        </span>
        <span style={{ fontSize: 11, color: "var(--wm-er-muted, #94a3b8)" }}>
          {info.totalRatings} {info.totalRatings === 1 ? "rating" : "ratings"}
        </span>
      </div>

      {/* Row 2: WM ID — tap to copy */}
      <WmIdCopyable wmId={info.wmId} />
    </div>
  );
  }

/* ── WM ID with tap-to-copy ────────────────────── */

function WmIdCopyable({ wmId }: { wmId: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    try { navigator.clipboard.writeText(wmId); } catch { /* safe */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [wmId]);
  return (
    <button type="button" onClick={handleCopy} aria-label="Copy WorkMitra ID" style={{
      marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6,
      background: "none", border: "none", padding: 0, cursor: "pointer",
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted, #94a3b8)", letterSpacing: 0.3, fontFamily: "monospace" }}>
        {wmId}
      </span>
      <span style={{ fontSize: 10, color: copied ? "#16a34a" : "var(--wm-er-muted, #94a3b8)" }}>
        {copied ? "✓ Copied" : "📋"}
      </span>
    </button>
  );
}