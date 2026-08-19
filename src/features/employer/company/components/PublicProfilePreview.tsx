/** Public profile preview — employee-facing mirror (Phase 0). */

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { EmployerProfile } from "../storage/employerSettings.storage";
import { getEmployerBusinessKey } from "../helpers/employerDualId.helpers";
import {
  computeVerificationLevel,
  getPublicProfilePath,
  resolvePublicHandle,
  VERIFICATION_LEVEL_LABELS,
} from "../helpers/employerIdentity.helpers";
import {
  EMPLOYER_LEVEL_BG,
  EMPLOYER_LEVEL_COLORS,
  getEmployerQuickInfo,
} from "../../../../shared/employerProfile/employerPublicProfileService";
import { EmployerVerificationBadges } from "../../../../shared/employerProfile/EmployerVerificationBadges";
import { resolveEmployerVerificationBadges } from "../../../../shared/employerProfile/employerVerificationBadge.helpers";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { JobMitraBrandName } from "../../../../shared/components/brand/BrandName";

const PURPLE = "#7c3aed";

const PREVIEW_SHELL = {
  marginTop: 12,
  padding: 18,
  borderRadius: "var(--wm-radius-employer-card)",
  background: "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
} as const;

function formatLocation(city: string, state: string): string {
  const parts = [city.trim(), state.trim()].filter(Boolean);
  if (parts.length === 0) return "Location not added";
  return parts.join(", ");
}

export type PublicProfilePreviewProps = {
  readonly profile: EmployerProfile;
};

export function PublicProfilePreview({ profile }: PublicProfilePreviewProps) {
  const businessKey = getEmployerBusinessKey(profile);
  const publicHandle = resolvePublicHandle(profile);
  const publicLink = getPublicProfilePath(publicHandle);
  const verificationLevel = computeVerificationLevel({
    registrationNo: profile.registrationNo,
    contactVerified: profile.contactVerified,
    verificationAudit: profile.verificationAudit,
    verificationTrack: profile.verificationTrack,
    enterpriseTrack: profile.enterpriseTrack,
    microTrack: profile.microTrack,
  });
  const verificationLabel = VERIFICATION_LEVEL_LABELS[verificationLevel];
  const isVerifiedBadge = verificationLevel === 3;

  useSyncExternalStore(
    ratingStorage.subscribe,
    () => JSON.stringify(ratingStorage.getAllWRRatings()),
    () => JSON.stringify(ratingStorage.getAllWRRatings()),
  );

  const trustInfo = useMemo(
    () => (businessKey ? getEmployerQuickInfo(businessKey) : null),
    [businessKey],
  );

  const verificationFlags = resolveEmployerVerificationBadges({
    contactVerified: profile.contactVerified === true || verificationLevel >= 1,
    identityBusinessVerified: isVerifiedBadge,
    reputationTier: trustInfo?.reputationTier,
  });

  const companyName = profile.companyName.trim() || "Your business name";
  const category = profile.industryType.trim() || "Category not set";
  const location = formatLocation(profile.locationCity, profile.locationState);

  const ratingDisplay =
    trustInfo && trustInfo.totalRatings > 0 ? trustInfo.averageStars.toFixed(1) : "—";
  const ratingCountLabel =
    trustInfo && trustInfo.totalRatings > 0
      ? `${trustInfo.totalRatings} ${trustInfo.totalRatings === 1 ? "rating" : "ratings"}`
      : "No ratings yet";

  const levelLabel = trustInfo?.levelLabel ?? "New";
  const levelColor = trustInfo ? EMPLOYER_LEVEL_COLORS[trustInfo.level] : "#64748b";
  const levelBg = trustInfo ? EMPLOYER_LEVEL_BG[trustInfo.level] : "rgba(100,116,139,0.08)";

  return (
    <section
      style={PREVIEW_SHELL}
      data-testid="employer-public-profile-preview"
      aria-label="Public profile preview"
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: PURPLE,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            Public trust preview
          </div>
          <p style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            This is how candidates see your business on <JobMitraBrandName size="sm" />.
          </p>
        </div>
        {profile.companyLogo ? (
          <img
            src={profile.companyLogo}
            alt=""
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--wm-radius-chip)",
              objectFit: "cover",
              border: "1px solid rgba(148,163,184,0.35)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--wm-radius-chip)",
              background: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(99,102,241,0.08))",
              border: "1px dashed rgba(148,163,184,0.45)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 900,
              color: "#7c3aed",
            }}
            aria-hidden
          >
            {(companyName[0] ?? "B").toUpperCase()}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 16,
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(226,232,240,0.75)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 0.7,
          }}
        >
          Company info
        </div>

        <div
          style={{ marginTop: 8, fontSize: 16, fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}
        >
          {companyName}
        </div>

        <div
          style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: "var(--wm-radius-pill)",
              background: isVerifiedBadge ? "rgba(22,163,74,0.12)" : "rgba(100,116,139,0.1)",
              color: isVerifiedBadge ? "#15803d" : "#64748b",
            }}
          >
            {verificationLabel}
          </span>

          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: "var(--wm-radius-pill)",
              background: levelBg,
              color: levelColor,
            }}
          >
            {levelLabel}
          </span>

          <EmployerVerificationBadges flags={verificationFlags} size="md" />
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <PreviewRow label="Category" value={category} />
          <PreviewRow label="Location" value={location} />
          <PreviewRow label="Public profile link" value={publicLink} />
          <PreviewRow
            label="Rating"
            value={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
                <span style={{ fontWeight: 800 }}>{ratingDisplay}</span>
                <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 11 }}>
                  {ratingCountLabel}
                </span>
              </span>
            }
          />
        </div>
      </div>
    </section>
  );
}

function PreviewRow({ label, value }: { readonly label: string; readonly value: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, flexShrink: 0 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          color: "#334155",
          fontWeight: 700,
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {value}
      </span>
    </div>
  );
}
