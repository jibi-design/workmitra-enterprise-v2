// src/features/employee/workVault/components/VaultEmployerProfileCards.tsx
//
// Sub-components for VaultVerifyEmployerTab.
// ProfileCard, StatsCard, TagsCard, ReviewsCard — L-V3 slate elevation.

import type { ReactNode } from "react";
import { StatusBadge } from "../../../../shared/components/enterprise/StatusBadge";
import { TrustStrip } from "../../../../shared/components/enterprise/TrustStrip";
import type { EnterpriseTone } from "../../../../shared/components/enterprise/enterprise.types";
import {
  type EmployerLevel,
  type EmployerPublicProfile,
  type EmployerReview,
} from "../../../../shared/employerProfile/employerPublicProfileService";
import { EmployerVerificationBadges } from "../../../../shared/employerProfile/EmployerVerificationBadges";
import { resolveEmployerVerificationBadges } from "../../../../shared/employerProfile/employerVerificationBadge.helpers";
import { JobMitraBrandName } from "../../../../shared/components/brand/BrandName";

/* ── Helpers ───────────────────────────────────── */

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function fmtRelative(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 86400000);
  if (diff < 1) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff} days ago`;
  return fmtDate(ts);
}

function starString(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function levelTone(level: EmployerLevel): EnterpriseTone {
  switch (level) {
    case "proven":
      return "active";
    case "trusted":
      return "warning";
    case "established":
      return "pending";
    default:
      return "neutral";
  }
}

function trustCopy(profile: EmployerPublicProfile): {
  kind: "info" | "lock" | "compliance";
  tone: EnterpriseTone;
  title: ReactNode;
  message: string;
  badgeLabel: string;
} {
  if (profile.identityBusinessVerified) {
    return {
      kind: "compliance",
      tone: "active",
      title: "Verified Business",
      message: `${profile.identityMaturityLabel}. Star reputation: ${profile.reputationLabel} (${profile.totalRatings} ratings).`,
      badgeLabel: "Verified Business",
    };
  }
  if (profile.contactVerified) {
    return {
      kind: "compliance",
      tone: "pending",
      title: "Contact Verified",
      message: `Phone or email verified. Star reputation: ${profile.reputationLabel}. Documents may still be under review.`,
      badgeLabel: "Contact Verified",
    };
  }
  if (profile.reputationTier === "proven") {
    return {
      kind: "compliance",
      tone: "active",
      title: "Proven Reputation",
      message: `${profile.totalRatings} public ratings · strong history of completed work. Business documents not yet verified.`,
      badgeLabel: "Proven Reputation",
    };
  }
  if (profile.reputationTier === "trusted") {
    return {
      kind: "lock",
      tone: "warning",
      title: "Trusted by ratings",
      message: "Consistently rated by workers. Still review recent comments before applying.",
      badgeLabel: profile.reputationLabel,
    };
  }
  if (profile.reputationTier === "established") {
    return {
      kind: "info",
      tone: "pending",
      title: "Established employer",
      message: "Building a public track record. Check activity and reviews carefully.",
      badgeLabel: profile.reputationLabel,
    };
  }
  return {
    kind: "info",
    tone: "neutral",
    title: (
      <>
        New on <JobMitraBrandName size="sm" />
      </>
    ),
    message: "Limited public ratings so far. Prefer OTP document review and clear job details.",
    badgeLabel: profile.reputationLabel,
  };
}

/* ── ProfileCard ───────────────────────────────── */

export function ProfileCard({ profile }: { profile: EmployerPublicProfile }) {
  const has = profile.totalRatings > 0;
  const trust = trustCopy(profile);
  const verificationFlags = resolveEmployerVerificationBadges({
    contactVerified: profile.contactVerified,
    identityBusinessVerified: profile.identityBusinessVerified,
    reputationTier: profile.reputationTier,
  });

  return (
    <div className="wm-vault-verify-card">
      <TrustStrip
        kind={trust.kind}
        tone={trust.tone}
        title={trust.title}
        message={trust.message}
        badgeLabel={trust.badgeLabel}
      />

      <div className="wm-vault-verify-card__body">
        <div className="wm-vault-verify-card__name">{profile.companyName}</div>
        <div className="wm-vault-verify-card__id">{profile.wmId}</div>

        <div className="wm-vault-verify-card__meta">
          <span
            className={`wm-vault-verify-card__stars${has ? " wm-vault-verify-card__stars--lit" : ""}`}
          >
            ★ {has ? profile.averageStars.toFixed(1) : "—"}
          </span>
          <StatusBadge label={profile.reputationLabel} tone={levelTone(profile.reputationTier)} />
          <EmployerVerificationBadges flags={verificationFlags} size="md" />
          <StatusBadge
            label={`${profile.totalRatings} ${profile.totalRatings === 1 ? "rating" : "ratings"}`}
            tone="neutral"
          />
          {profile.locationCity ? (
            <StatusBadge label={profile.locationCity} tone="neutral" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── StatsCard ─────────────────────────────────── */

export function StatsCard({ profile }: { profile: EmployerPublicProfile }) {
  const rows: { label: string; value: string; badge?: string }[] = [
    { label: "Total shifts posted", value: String(profile.totalShiftPosts), badge: "Shift" },
    { label: "Total career jobs", value: String(profile.totalCareerPosts), badge: "Career" },
    { label: "Workers hired", value: String(profile.totalWorkersHired) },
    { label: "Active job posts", value: String(profile.activeJobPosts) },
  ];
  if (profile.memberSince) {
    rows.push({ label: "Member since", value: fmtDate(profile.memberSince) });
  }
  if (profile.industryType) {
    rows.push({ label: "Industry", value: profile.industryType });
  }
  if (profile.companySize) {
    rows.push({ label: "Company size", value: profile.companySize });
  }

  return (
    <div className="wm-vault-verify-card">
      <div className="wm-vault-verify-card__section-title">Activity & credentials</div>
      <div className="wm-vault-verify-stat-list">
        {rows.map((r) => (
          <div key={r.label} className="wm-vault-verify-stat-row">
            <span className="wm-vault-verify-stat-row__label">
              {r.label}
              {r.badge === "Shift" ? (
                <>
                  {" "}
                  <StatusBadge label="Shift" tone="neutral" accent="shift" />
                </>
              ) : null}
              {r.badge === "Career" ? (
                <>
                  {" "}
                  <StatusBadge label="Career" tone="neutral" accent="career" />
                </>
              ) : null}
            </span>
            <span className="wm-vault-verify-stat-row__value">{r.value}</span>
          </div>
        ))}
      </div>
      {profile.workAgainTotal > 0 ? (
        <div className="wm-vault-verify-card__signal">
          <TrustStrip
            kind="info"
            tone="active"
            title="Would work again"
            message={`${profile.workAgainCount} of ${profile.workAgainTotal} workers said they would work with this employer again.`}
            badgeLabel="Signal"
          />
        </div>
      ) : null}
    </div>
  );
}

/* ── TagsCard ──────────────────────────────────── */

export function TagsCard({ profile }: { profile: EmployerPublicProfile }) {
  const entries = Object.entries(profile.tagCounts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  return (
    <div className="wm-vault-verify-card">
      <div className="wm-vault-verify-card__section-title">What workers say</div>
      <div className="wm-vault-verify-tags">
        {entries.map(([tag, count]) => (
          <StatusBadge key={tag} label={`${tag} (${count})`} tone="neutral" />
        ))}
      </div>
    </div>
  );
}

/* ── ReviewsCard ───────────────────────────────── */

export function ReviewsCard({ reviews }: { reviews: EmployerReview[] }) {
  const visible = reviews.filter((r) => r.comment).slice(0, 10);
  if (visible.length === 0) return null;

  return (
    <div className="wm-vault-verify-card">
      <div className="wm-vault-verify-card__section-title">Worker reviews ({visible.length})</div>
      <div className="wm-vault-verify-review-list">
        {visible.map((r) => (
          <div key={r.id} className="wm-vault-verify-review">
            <div className="wm-vault-verify-review__head">
              <span className="wm-vault-verify-review__stars">{starString(r.stars)}</span>
              <StatusBadge
                label={r.domain === "career" ? "Career" : "Shift"}
                tone="neutral"
                accent={r.domain === "career" ? "career" : "shift"}
              />
            </div>
            {r.comment ? <div className="wm-vault-verify-review__comment">{r.comment}</div> : null}
            <div className="wm-vault-verify-review__meta">
              {r.workAgain ? "Would work again" : "Would not work again"} ·{" "}
              {fmtRelative(r.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
