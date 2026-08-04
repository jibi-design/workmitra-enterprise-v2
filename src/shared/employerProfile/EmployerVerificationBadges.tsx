/** Explicit worker-facing verification chips — Contact Verified / Verified Business / Proven Reputation. */

import type { CSSProperties } from "react";
import {
  EMPLOYER_VERIFICATION_BADGE_LABELS,
  listActiveVerificationBadgeKinds,
  type EmployerVerificationBadgeFlags,
  type EmployerVerificationBadgeKind,
} from "./employerVerificationBadge.helpers";

type Props = {
  readonly flags: EmployerVerificationBadgeFlags;
  readonly size?: "sm" | "md";
  readonly style?: CSSProperties;
  /** When true, always reserve a row so layout does not jump when flags appear. */
  readonly showEmptyHint?: boolean;
};

const CHIP_STYLE: Record<
  EmployerVerificationBadgeKind,
  { background: string; color: string; border: string }
> = {
  contact_verified: {
    background: "rgba(14, 165, 233, 0.14)",
    color: "#0c4a6e",
    border: "1px solid rgba(14, 165, 233, 0.35)",
  },
  verified_business: {
    background: "rgba(37, 99, 235, 0.14)",
    color: "#1e3a8a",
    border: "1px solid rgba(37, 99, 235, 0.35)",
  },
  proven_reputation: {
    background: "rgba(22, 163, 74, 0.14)",
    color: "#14532d",
    border: "1px solid rgba(22, 163, 74, 0.35)",
  },
};

export function EmployerVerificationBadges({
  flags,
  size = "sm",
  style,
  showEmptyHint = false,
}: Props) {
  const kinds = listActiveVerificationBadgeKinds(flags);
  if (kinds.length === 0) {
    if (!showEmptyHint) return null;
    return (
      <div
        data-testid="employer-verification-badges"
        aria-label="No verification badges yet"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          ...style,
        }}
      >
        <span
          style={{
            fontSize: size === "md" ? 11 : 10,
            fontWeight: 700,
            padding: size === "md" ? "3px 10px" : "2px 8px",
            borderRadius: 10,
            background: "rgba(148,163,184,0.12)",
            color: "#64748b",
            border: "1px solid rgba(148,163,184,0.28)",
          }}
        >
          Verification pending
        </span>
      </div>
    );
  }

  const fontSize = size === "md" ? 11 : 10;
  const padding = size === "md" ? "3px 10px" : "2px 8px";
  const label = kinds.map((k) => EMPLOYER_VERIFICATION_BADGE_LABELS[k]).join(", ");

  return (
    <div
      data-testid="employer-verification-badges"
      role="group"
      aria-label={`Employer verification: ${label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        ...style,
      }}
    >
      {kinds.map((kind) => {
        const tone = CHIP_STYLE[kind];
        return (
          <span
            key={kind}
            data-badge={kind}
            title={EMPLOYER_VERIFICATION_BADGE_LABELS[kind]}
            style={{
              fontSize,
              fontWeight: 850,
              padding,
              borderRadius: 10,
              background: tone.background,
              color: tone.color,
              border: tone.border,
              letterSpacing: 0.15,
              whiteSpace: "nowrap",
              lineHeight: 1.35,
            }}
          >
            {EMPLOYER_VERIFICATION_BADGE_LABELS[kind]}
          </span>
        );
      })}
    </div>
  );
}
