/** Job Mitra | EmployerTrustBadge.tsx | C:\projects\WorkMitra_Enterprise_v2\src\shared\employerProfile\EmployerTrustBadge.tsx */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  getEmployerQuickInfo,
  EMPLOYER_LEVEL_COLORS,
  EMPLOYER_LEVEL_BG,
} from "./employerPublicProfileService";
import { getEmployerBusinessKey } from "../../features/employer/company/helpers/employerDualId.helpers";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { ratingStorage } from "../rating/ratingStorage";

type Props = {
  /** Pass explicitly if available. Falls back to employerSettingsStorage. */
  employerWmId?: string;
  /** "compact" = inline row (search cards). "full" = stacked with ID. */
  variant?: "compact" | "full";
  /** Domain accent color for star. Defaults to muted. */
  accentColor?: string;
};

export function EmployerTrustBadge({ employerWmId, variant = "compact", accentColor }: Props) {
  const jmId = employerWmId || getEmployerBusinessKey(employerSettingsStorage.get()) || "";

  useSyncExternalStore(
    ratingStorage.subscribe,
    () => JSON.stringify(ratingStorage.getAllWRRatings()),
    () => JSON.stringify(ratingStorage.getAllWRRatings()),
  );

  const info = useMemo(() => (jmId ? getEmployerQuickInfo(jmId) : null), [jmId]);

  if (!info) return null;

  const levelColor = EMPLOYER_LEVEL_COLORS[info.level];
  const levelBg = EMPLOYER_LEVEL_BG[info.level];
  const starColor = accentColor || "#f59e0b";
  const hasRatings = info.totalRatings > 0;

  if (variant === "compact") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 4,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 12,
            fontWeight: 700,
            color: hasRatings ? starColor : "var(--wm-er-muted, #94a3b8)",
          }}
        >
          <span style={{ fontSize: 13 }}>&#9733;</span>
          {hasRatings ? info.averageStars.toFixed(1) : "—"}
        </span>

        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
            background: levelBg,
            color: levelColor,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {info.levelLabel}
        </span>

        <span style={{ fontSize: 11, color: "var(--wm-er-muted, #94a3b8)" }}>
          {info.totalRatings} {info.totalRatings === 1 ? "rating" : "ratings"}
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 13,
            fontWeight: 700,
            color: hasRatings ? starColor : "var(--wm-er-muted, #94a3b8)",
          }}
        >
          <span style={{ fontSize: 14 }}>&#9733;</span>
          {hasRatings ? info.averageStars.toFixed(1) : "—"}
        </span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: 10,
            background: levelBg,
            color: levelColor,
          }}
        >
          {info.levelLabel}
        </span>

        <span style={{ fontSize: 11, color: "var(--wm-er-muted, #94a3b8)" }}>
          {info.totalRatings} {info.totalRatings === 1 ? "rating" : "ratings"}
        </span>
      </div>

      <JmIdCopyable jmId={info.wmId} />
    </div>
  );
}

function JmIdCopyable({ jmId }: { jmId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    try {
      void navigator.clipboard.writeText(jmId);
    } catch {
      /* safe */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [jmId]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy Job Mitra ID"
      style={{
        marginTop: 4,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--wm-er-muted, #94a3b8)",
          letterSpacing: 0.3,
          fontFamily: "monospace",
        }}
      >
        {jmId}
      </span>
      <span style={{ fontSize: 10, color: copied ? "#16a34a" : "var(--wm-er-muted, #94a3b8)" }}>
        {copied ? "✓ Copied" : "📋"}
      </span>
    </button>
  );
}
