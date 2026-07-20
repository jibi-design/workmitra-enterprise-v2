/** Section 3 — Verification ladder (progressive trust). */

import type { EmployerProfile } from "../../storage/employerSettings.storage";
import { SettingsTextField } from "../SettingsFormFields";
import { ContactVerificationPanel } from "./ContactVerificationPanel";
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
  readonly onNotice?: (notice: NoticeData) => void;
};

const LEVEL_STEPS = [0, 1, 2, 3] as const;

export function VerificationSection({
  data,
  editMode,
  onFieldChange,
  onContactVerified,
  onNotice,
}: Props) {
  const level = computeVerificationLevel({
    registrationNo: data.registrationNo,
    contactVerified: data.contactVerified,
    verificationAudit: data.verificationAudit,
  });
  const statusLabel = VERIFICATION_LEVEL_LABELS[level];
  const showVerifiedBadge = level === 3;
  const auditStatus = data.verificationAudit?.status;

  return (
    <section style={EXECUTIVE_CARD_SHELL} data-testid="employer-verification-section">
      <div style={EXECUTIVE_SECTION_KICKER}>Verification</div>
      <h2 style={EXECUTIVE_SECTION_TITLE}>Verification status</h2>
      <p style={EXECUTIVE_HELPER}>
        Start with basic access. Add your registration number when you are ready for a trust
        upgrade.
      </p>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 16,
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
              ? "Document submitted — waiting for admin review. Verified badge appears only after approval."
              : auditStatus === "rejected"
                ? "Verification was not approved. Update your registration number and save to resubmit."
                : "Verified badge appears only after document review. Unverified businesses cannot show as verified."}
          </div>
        ) : (
          <div style={{ marginTop: 6, fontSize: 11, color: "#15803d", fontWeight: 700 }}>
            Official verified badge active on your public profile.
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
                borderRadius: 12,
                background: active ? "rgba(124,58,237,0.06)" : "rgba(248,250,252,0.9)",
                border: `1px solid ${active ? "rgba(124,58,237,0.15)" : "rgba(226,232,240,0.8)"}`,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  background: active ? "#7c3aed" : "#e2e8f0",
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

      <div style={{ ...fieldGroupStyle, marginTop: 14 }}>
        <SettingsTextField
          label="Registration / license number"
          value={data.registrationNo}
          disabled={!editMode}
          onChange={(v) => onFieldChange("registrationNo", v)}
          placeholder="GST, CIN, or local trade license"
        />
        <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          Optional at signup. Required later for verified badge and premium trust features.
        </div>
      </div>
    </section>
  );
}
