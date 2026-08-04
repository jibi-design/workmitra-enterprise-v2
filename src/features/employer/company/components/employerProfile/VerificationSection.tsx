/** Section 3 — Verification ladder + dual tracks (Enterprise / Micro). */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { EmployerProfile } from "../../storage/employerSettings.storage";
import { SettingsTextField } from "../SettingsFormFields";
import { ContactVerificationPanel } from "./ContactVerificationPanel";
import { DualTrackVerificationPanel } from "./DualTrackVerificationPanel";
import {
  computeVerificationLevel,
  VERIFICATION_LEVEL_LABELS,
} from "../../helpers/employerIdentity.helpers";
import {
  EXECUTIVE_CARD_SHELL,
  EXECUTIVE_HELPER,
  EXECUTIVE_SECTION_KICKER,
  EXECUTIVE_SECTION_TITLE,
} from "../../helpers/employerProfileCard.styles";
import { fieldGroupStyle } from "../../helpers/settingsStyles";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";

type Props = {
  readonly data: EmployerProfile;
  readonly editMode: boolean;
  readonly onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
  readonly onContactVerified?: () => void;
  readonly onProfileRefresh?: () => void;
  readonly onNotice?: (notice: NoticeData) => void;
};

const LEVEL_STEPS = [0, 1, 2, 3] as const;

export function VerificationSection({
  data,
  editMode,
  onFieldChange,
  onContactVerified,
  onProfileRefresh,
  onNotice,
}: Props) {
  const nav = useNavigate();
  const level = computeVerificationLevel({
    registrationNo: data.registrationNo,
    contactVerified: data.contactVerified,
    verificationAudit: data.verificationAudit,
    verificationTrack: data.verificationTrack,
    enterpriseTrack: data.enterpriseTrack,
    microTrack: data.microTrack,
  });
  const statusLabel = VERIFICATION_LEVEL_LABELS[level];
  const showVerifiedBadge = level === 3;
  const auditStatus = data.verificationAudit?.status;

  return (
    <section style={EXECUTIVE_CARD_SHELL} data-testid="employer-verification-section">
      <div style={EXECUTIVE_SECTION_KICKER}>Verification</div>
      <h2 style={EXECUTIVE_SECTION_TITLE}>Verification status</h2>
      <p style={EXECUTIVE_HELPER}>
        Start with contact OTP to publish. Then choose Enterprise (CRN/VAT) or Micro/Trade track for
        stronger trust — CRN is not required for micro businesses.
      </p>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(226,232,240,0.8)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>{statusLabel}</div>
        {!showVerifiedBadge ? (
          <div
            style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
          >
            {auditStatus === "pending"
              ? "Document track submitted — waiting for admin review. Verified business badge appears only after approval."
              : auditStatus === "rejected"
                ? "Verification was not approved. Update your track evidence and resubmit."
                : "Verified business badge appears only after document review. Contact verification alone unlocks publishing."}
          </div>
        ) : (
          <div style={{ marginTop: 6, fontSize: 11, color: "#15803d", fontWeight: 700 }}>
            Official verified business badge active on your public profile.
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        {LEVEL_STEPS.map((step) => {
          const active = level >= step;
          return (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: "var(--wm-radius-button)",
                background: active
                  ? "color-mix(in srgb, var(--wm-brand-600, #2563eb) 8%, #fff)"
                  : "rgba(248,250,252,0.9)",
                border: `1px solid ${
                  active
                    ? "color-mix(in srgb, var(--wm-brand-600, #2563eb) 22%, transparent)"
                    : "rgba(226,232,240,0.8)"
                }`,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "var(--wm-radius-pill)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  background: active ? "var(--wm-brand-600, #2563eb)" : "#e2e8f0",
                  color: active ? "#fff" : "#64748b",
                  flexShrink: 0,
                }}
              >
                {step}
              </span>
              <span
                style={{ fontSize: 12, fontWeight: 700, color: active ? "#0f172a" : "#64748b" }}
              >
                {VERIFICATION_LEVEL_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      {onNotice && onContactVerified ? (
        <ContactVerificationPanel
          profile={data}
          onVerified={onContactVerified}
          onNotice={onNotice}
        />
      ) : null}

      {onNotice && onProfileRefresh ? (
        <DualTrackVerificationPanel
          profile={data}
          editMode={editMode}
          onProfileRefresh={onProfileRefresh}
          onNotice={onNotice}
        />
      ) : null}

      <button
        type="button"
        className="wm-compEntryBtn"
        data-testid="open-business-compliance-hub"
        onClick={() => nav(ROUTE_PATHS.employerCompliance)}
        style={{
          marginTop: 14,
          width: "100%",
          padding: "12px 14px",
          borderRadius: "var(--wm-radius-button)",
          border: "1px solid color-mix(in srgb, var(--wm-brand-600, #2563eb) 28%, transparent)",
          background: "color-mix(in srgb, var(--wm-brand-600, #2563eb) 8%, #fff)",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
          Business Compliance Hub →
        </div>
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--wm-er-muted)", lineHeight: 1.4 }}>
          Insurance, H&amp;S, Companies House pack, and employer RTW audit evidence — not Worker
          Vault.
        </div>
      </button>

      <div style={{ ...fieldGroupStyle, marginTop: 14 }}>
        <SettingsTextField
          label="Legacy registration / license number (optional)"
          value={data.registrationNo}
          disabled={!editMode}
          onChange={(v) => onFieldChange("registrationNo", v)}
          placeholder="Still accepted as document evidence"
        />
        <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          Prefer Track A or Track B above. This free-text field remains for backwards compatibility.
        </div>
      </div>
    </section>
  );
}
