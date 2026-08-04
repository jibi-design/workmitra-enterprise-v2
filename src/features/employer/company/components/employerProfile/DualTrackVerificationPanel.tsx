/** Dual-track verification UI — Enterprise (Track A) vs Micro/Trade (Track B). */

import { useMemo, useState, type CSSProperties } from "react";
import type { EmployerProfile } from "../../storage/employerSettings.storage";
import { employerSettingsStorage } from "../../storage/employerSettings.storage";
import {
  EMPTY_ENTERPRISE_TRACK,
  EMPTY_MICRO_TRACK,
  isCorporateDomainEmailMatch,
  isEnterpriseTrackComplete,
  isMicroTrackComplete,
  type EmployerVerificationTrackKind,
  type EnterpriseVerificationTrack,
  type MicroVerificationTrack,
} from "../../helpers/employerVerificationTracks";
import { syncEmployerVerificationToServer } from "../../services/employerVerificationSync.service";
import { useCompaniesHouseCrnLookup } from "../../hooks/useCompaniesHouseCrnLookup";
import { AUTH_BACKEND_ENABLED } from "../../../../../shared/config/authConfig";
import { apiService } from "../../../../../shared/services/apiService";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import { SettingsTextField } from "../SettingsFormFields";

type Props = {
  readonly profile: EmployerProfile;
  readonly editMode: boolean;
  readonly onProfileRefresh: () => void;
  readonly onNotice: (notice: NoticeData) => void;
};

const TRACK_BTN: CSSProperties = {
  flex: 1,
  minWidth: 140,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.28)",
  background: "#fff",
  cursor: "pointer",
  textAlign: "left",
};

export function DualTrackVerificationPanel({
  profile,
  editMode,
  onProfileRefresh,
  onNotice,
}: Props) {
  const [trackKind, setTrackKind] = useState<EmployerVerificationTrackKind>(
    profile.verificationTrack === "enterprise" || profile.verificationTrack === "micro"
      ? profile.verificationTrack
      : "enterprise",
  );
  const [enterprise, setEnterprise] = useState<EnterpriseVerificationTrack>(
    () => profile.enterpriseTrack ?? { ...EMPTY_ENTERPRISE_TRACK, corporateEmail: profile.email },
  );
  const [micro, setMicro] = useState<MicroVerificationTrack>(
    () => profile.microTrack ?? { ...EMPTY_MICRO_TRACK },
  );
  const [submitting, setSubmitting] = useState(false);
  const {
    lookup: lookupCrnApi,
    loading: lookingUpCrn,
    company: crnCompany,
    error: crnError,
    reset: resetCrnLookup,
  } = useCompaniesHouseCrnLookup();

  const emailMatch = useMemo(
    () => isCorporateDomainEmailMatch(enterprise.corporateEmail, enterprise.corporateDomain),
    [enterprise.corporateEmail, enterprise.corporateDomain],
  );

  async function lookupCrn(): Promise<void> {
    const company = await lookupCrnApi(enterprise.companiesHouseCrn);
    if (!company) return;
    setEnterprise((p) => ({
      ...p,
      companiesHouseCrn: company.companyNumber,
      registeredAddress: p.registeredAddress.trim()
        ? p.registeredAddress
        : (company.registeredOfficeAddress ?? p.registeredAddress),
    }));
    if (company.companyStatus !== "active") {
      onNotice({
        title: "Company not active",
        message: `${company.companyName} is marked ${company.companyStatus} at Companies House.`,
        tone: "warn",
      });
    }
  }

  async function submitEnterprise(): Promise<void> {
    if (!profile.contactVerified) {
      onNotice({
        title: "Contact verification required",
        message: "Verify phone or email first, then submit the Enterprise track.",
        tone: "warn",
      });
      return;
    }
    if (!isEnterpriseTrackComplete(enterprise)) {
      onNotice({
        title: "Incomplete Enterprise track",
        message:
          "Provide Companies House CRN, VAT ID, registered address, and a corporate-domain email.",
        tone: "warn",
      });
      return;
    }

    setSubmitting(true);
    const payload = { ...enterprise, submittedAt: Date.now() };
    employerSettingsStorage.savePartial({
      verificationTrack: "enterprise",
      enterpriseTrack: payload,
      registrationNo: payload.companiesHouseCrn,
    });

    if (AUTH_BACKEND_ENABLED) {
      try {
        await apiService.post("/v1/jobmitra/employer/verification/tracks/enterprise", payload);
      } catch (err) {
        setSubmitting(false);
        onNotice({
          title: "Submission failed",
          message: err instanceof Error ? err.message : "Could not submit Enterprise track.",
          tone: "warn",
        });
        return;
      }
    }

    const saved = employerSettingsStorage.get();
    void syncEmployerVerificationToServer(saved);
    setSubmitting(false);
    onProfileRefresh();
    onNotice({
      title: "Enterprise track submitted",
      message:
        "Documents are under review. Maturity is now document_submitted when contact is verified — publishing stays unlocked.",
      tone: "success",
    });
  }

  async function submitMicro(): Promise<void> {
    if (!profile.contactVerified) {
      onNotice({
        title: "Contact verification required",
        message: "Verify phone or email first (Micro track builds on contact OTP).",
        tone: "warn",
      });
      return;
    }
    if (!isMicroTrackComplete(micro)) {
      onNotice({
        title: "Incomplete Micro track",
        message:
          "Attest owner government ID and provide trade/shop proof or GPS/location proof (CRN not required).",
        tone: "warn",
      });
      return;
    }

    setSubmitting(true);
    const payload = { ...micro, submittedAt: Date.now() };
    employerSettingsStorage.savePartial({
      verificationTrack: "micro",
      microTrack: payload,
    });

    if (AUTH_BACKEND_ENABLED) {
      try {
        await apiService.post("/v1/jobmitra/employer/verification/tracks/micro", payload);
      } catch (err) {
        setSubmitting(false);
        onNotice({
          title: "Submission failed",
          message: err instanceof Error ? err.message : "Could not submit Micro track.",
          tone: "warn",
        });
        return;
      }
    }

    const saved = employerSettingsStorage.get();
    void syncEmployerVerificationToServer(saved);
    setSubmitting(false);
    onProfileRefresh();
    onNotice({
      title: "Micro track submitted",
      message:
        "Trade evidence is under review. Contact-verified employers can publish; verified business badge still needs admin approval.",
      tone: "success",
    });
  }

  const activeSubmitted =
    profile.verificationTrack === "enterprise" || profile.verificationTrack === "micro";

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(255,255,255,0.82)",
        border: "1px solid rgba(226,232,240,0.9)",
      }}
      data-testid="dual-track-verification"
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
        Choose verification track
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Enterprise track for registered companies (CRN/VAT). Micro track for shops, catering,
        contractors — no CRN required.
      </div>

      {activeSubmitted ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--wm-brand-700, #1d4ed8)",
          }}
        >
          Active track:{" "}
          {profile.verificationTrack === "enterprise" ? "Enterprise (Track A)" : "Micro (Track B)"}
          {profile.verificationAudit?.status === "pending" ? " · under review" : ""}
        </div>
      ) : null}

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          style={{
            ...TRACK_BTN,
            borderColor:
              trackKind === "enterprise"
                ? "color-mix(in srgb, var(--wm-brand-600, #2563eb) 35%, transparent)"
                : "rgba(148,163,184,0.28)",
            background:
              trackKind === "enterprise"
                ? "color-mix(in srgb, var(--wm-brand-600, #2563eb) 8%, #fff)"
                : "#fff",
          }}
          onClick={() => setTrackKind("enterprise")}
          disabled={!editMode}
        >
          <div style={{ fontSize: 12, fontWeight: 800 }}>Track A · Enterprise</div>
          <div style={{ marginTop: 2, fontSize: 11, color: "var(--wm-er-muted)" }}>
            CRN, VAT, address, corporate email
          </div>
        </button>
        <button
          type="button"
          style={{
            ...TRACK_BTN,
            borderColor:
              trackKind === "micro"
                ? "color-mix(in srgb, var(--wm-brand-600, #2563eb) 35%, transparent)"
                : "rgba(148,163,184,0.28)",
            background:
              trackKind === "micro"
                ? "color-mix(in srgb, var(--wm-brand-600, #2563eb) 8%, #fff)"
                : "#fff",
          }}
          onClick={() => setTrackKind("micro")}
          disabled={!editMode}
        >
          <div style={{ fontSize: 12, fontWeight: 800 }}>Track B · Micro / Trade</div>
          <div style={{ marginTop: 2, fontSize: 11, color: "var(--wm-er-muted)" }}>
            Phone OTP + ID + trade or GPS proof
          </div>
        </button>
      </div>

      {trackKind === "enterprise" ? (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <SettingsTextField
            label="Companies House CRN"
            value={enterprise.companiesHouseCrn}
            disabled={!editMode}
            onChange={(v) => {
              resetCrnLookup();
              setEnterprise((p) => ({ ...p, companiesHouseCrn: v }));
            }}
            placeholder="e.g. 01234567 or SC123456"
          />
          {editMode ? (
            <button
              type="button"
              className="wm-outlineBtn"
              disabled={lookingUpCrn || !enterprise.companiesHouseCrn.trim()}
              onClick={() => void lookupCrn()}
              style={{ justifySelf: "start" }}
            >
              {lookingUpCrn ? "Looking up…" : "Look up Companies House"}
            </button>
          ) : null}
          {crnCompany ? (
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1" }}>
              {crnCompany.companyName} · {crnCompany.companyStatus} ({crnCompany.source} registry)
            </div>
          ) : crnError ? (
            <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309" }}>{crnError}</div>
          ) : (
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
              Mock CRNs: 01234567, 09876543, SC123456
            </div>
          )}
          <SettingsTextField
            label="VAT ID"
            value={enterprise.vatId}
            disabled={!editMode}
            onChange={(v) => setEnterprise((p) => ({ ...p, vatId: v }))}
            placeholder="e.g. GB123456789"
          />
          <SettingsTextField
            label="Registered address"
            value={enterprise.registeredAddress}
            disabled={!editMode}
            onChange={(v) => setEnterprise((p) => ({ ...p, registeredAddress: v }))}
            placeholder="Registered office address"
          />
          <SettingsTextField
            label="Corporate email"
            value={enterprise.corporateEmail}
            disabled={!editMode}
            onChange={(v) => setEnterprise((p) => ({ ...p, corporateEmail: v }))}
            placeholder="name@company.co.uk"
          />
          <SettingsTextField
            label="Declared company domain (optional)"
            value={enterprise.corporateDomain}
            disabled={!editMode}
            onChange={(v) => setEnterprise((p) => ({ ...p, corporateDomain: v }))}
            placeholder="company.co.uk"
          />
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: emailMatch ? "#15803d" : "#b45309",
            }}
          >
            {emailMatch
              ? "Corporate domain email match: OK"
              : "Corporate domain email match: use a non-free company mailbox"}
          </div>
          {editMode ? (
            <button
              type="button"
              className="wm-primarybtn"
              disabled={submitting}
              onClick={() => void submitEnterprise()}
            >
              {submitting ? "Submitting…" : "Submit Enterprise track"}
            </button>
          ) : null}
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12 }}>
            <input
              type="checkbox"
              checked={micro.ownerGovIdAttested}
              disabled={!editMode}
              onChange={(e) => setMicro((p) => ({ ...p, ownerGovIdAttested: e.target.checked }))}
            />
            <span>
              I attest that the owner&apos;s government photo ID is verified on this account (Phase
              1 attestation — no file upload yet).
            </span>
          </label>
          <SettingsTextField
            label="Owner ID reference (optional)"
            value={micro.ownerGovIdRef}
            disabled={!editMode}
            onChange={(v) => setMicro((p) => ({ ...p, ownerGovIdRef: v }))}
            placeholder="Internal reference / last-4 only"
          />
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12 }}>
            <input
              type="checkbox"
              checked={micro.tradeProofAttested}
              disabled={!editMode}
              onChange={(e) => setMicro((p) => ({ ...p, tradeProofAttested: e.target.checked }))}
            />
            <span>Trade / shop license or municipal permit available</span>
          </label>
          <SettingsTextField
            label="Trade / shop proof note"
            value={micro.tradeProofNote}
            disabled={!editMode}
            onChange={(v) => setMicro((p) => ({ ...p, tradeProofNote: v }))}
            placeholder="License type, number, issuing body"
          />
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12 }}>
            <input
              type="checkbox"
              checked={micro.gpsProofAttested}
              disabled={!editMode}
              onChange={(e) => setMicro((p) => ({ ...p, gpsProofAttested: e.target.checked }))}
            />
            <span>GPS / location proof of business premises</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <SettingsTextField
              label="Latitude"
              value={micro.gpsLat}
              disabled={!editMode}
              onChange={(v) => setMicro((p) => ({ ...p, gpsLat: v }))}
              placeholder="e.g. 51.5074"
            />
            <SettingsTextField
              label="Longitude"
              value={micro.gpsLng}
              disabled={!editMode}
              onChange={(v) => setMicro((p) => ({ ...p, gpsLng: v }))}
              placeholder="e.g. -0.1278"
            />
          </div>
          <SettingsTextField
            label="Location proof note"
            value={micro.locationProofNote}
            disabled={!editMode}
            onChange={(v) => setMicro((p) => ({ ...p, locationProofNote: v }))}
            placeholder="Shop landmark / what3words / address confirmation"
          />
          {editMode ? (
            <button
              type="button"
              className="wm-primarybtn"
              disabled={submitting}
              onClick={() => void submitMicro()}
            >
              {submitting ? "Submitting…" : "Submit Micro track"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
