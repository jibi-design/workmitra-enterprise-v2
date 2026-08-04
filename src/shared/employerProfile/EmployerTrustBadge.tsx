/** Job Mitra | EmployerTrustBadge.tsx — stars + explicit verification chips for workers */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  getEmployerQuickInfo,
  EMPLOYER_LEVEL_COLORS,
  EMPLOYER_LEVEL_BG,
} from "./employerPublicProfileService";
import { getEmployerBusinessKey } from "../../features/employer/company/helpers/employerDualId.helpers";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { ratingStorage } from "../rating/ratingStorage";
import { EmployerVerificationBadges } from "./EmployerVerificationBadges";
import {
  listActiveVerificationBadgeKinds,
  resolveEmployerVerificationBadges,
  resolveLocalEmployerVerificationFlags,
} from "./employerVerificationBadge.helpers";

type Props = {
  /** Pass explicitly if available. Falls back to employerSettingsStorage. */
  employerMlId?: string;
  /** "compact" = cards. "full" = details. "badges" = verification chips only. */
  variant?: "compact" | "full" | "badges";
  /** Domain accent color for star. Defaults to muted. */
  accentColor?: string;
  /** Show "Verification pending" when no chips apply. */
  showEmptyHint?: boolean;
};

export function EmployerTrustBadge({
  employerMlId,
  variant = "compact",
  accentColor,
  showEmptyHint = false,
}: Props) {
  const profileSnap = useSyncExternalStore(
    employerSettingsStorage.subscribe,
    () => JSON.stringify(employerSettingsStorage.get()),
    () => "",
  );

  useSyncExternalStore(
    ratingStorage.subscribe,
    () => JSON.stringify(ratingStorage.getAllWRRatings()),
    () => JSON.stringify(ratingStorage.getAllWRRatings()),
  );

  const mlId = useMemo(() => {
    void profileSnap;
    return employerMlId || getEmployerBusinessKey(employerSettingsStorage.get()) || "";
  }, [employerMlId, profileSnap]);

  const info = useMemo(() => (mlId ? getEmployerQuickInfo(mlId) : null), [mlId]);

  const verificationFlags = useMemo(() => {
    if (info) {
      return resolveEmployerVerificationBadges({
        contactVerified: info.contactVerified,
        identityBusinessVerified: info.identityBusinessVerified,
        reputationTier: info.reputationTier,
      });
    }
    void profileSnap;
    return resolveLocalEmployerVerificationFlags();
  }, [info, profileSnap]);

  const hasVerification = listActiveVerificationBadgeKinds(verificationFlags).length > 0;

  if (variant === "badges") {
    return (
      <EmployerVerificationBadges
        flags={verificationFlags}
        size="md"
        showEmptyHint={showEmptyHint}
        style={{ marginTop: 6 }}
      />
    );
  }

  if (!info && !hasVerification && !showEmptyHint) return null;

  const levelColor = info ? EMPLOYER_LEVEL_COLORS[info.level] : "#64748b";
  const levelBg = info ? EMPLOYER_LEVEL_BG[info.level] : "rgba(100,116,139,0.08)";
  const starColor = accentColor || "#f59e0b";
  const hasRatings = Boolean(info && info.totalRatings > 0);
  const reputationLabel = info?.reputationLabel ?? "New";
  const totalRatings = info?.totalRatings ?? 0;
  const averageStars = info?.averageStars ?? 0;
  const wmId = info?.wmId ?? mlId;

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
        data-testid="employer-trust-badge"
      >
        {info ? (
          <>
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
              {hasRatings ? averageStars.toFixed(1) : "—"}
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
              title="Star reputation tier (not business verification)"
            >
              {reputationLabel}
            </span>
          </>
        ) : null}

        <EmployerVerificationBadges
          flags={verificationFlags}
          size="sm"
          showEmptyHint={showEmptyHint}
        />

        {info ? (
          <span style={{ fontSize: 11, color: "var(--wm-er-muted, #94a3b8)" }}>
            {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 6 }} data-testid="employer-trust-badge">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {info ? (
          <>
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
              {hasRatings ? averageStars.toFixed(1) : "—"}
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
              title="Star reputation tier (not business verification)"
            >
              {reputationLabel}
            </span>
          </>
        ) : null}

        <EmployerVerificationBadges
          flags={verificationFlags}
          size="md"
          showEmptyHint={showEmptyHint}
        />

        {info ? (
          <span style={{ fontSize: 11, color: "var(--wm-er-muted, #94a3b8)" }}>
            {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
          </span>
        ) : null}
      </div>

      {wmId ? <MlIdCopyable mlId={wmId} /> : null}
    </div>
  );
}

function MlIdCopyable({ mlId }: { mlId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    try {
      void navigator.clipboard.writeText(mlId);
    } catch {
      /* safe */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [mlId]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy Mitra Labs ID"
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
        {mlId}
      </span>
      <span style={{ fontSize: 10, color: copied ? "#16a34a" : "var(--wm-er-muted, #94a3b8)" }}>
        {copied ? "✓ Copied" : "📋"}
      </span>
    </button>
  );
}
