/** Admin About — honest enterprise backend / storage status. */

import { AUTH_BACKEND_ENABLED } from "../../../../../shared/config/authConfig";
import { JobMitraBrandName } from "../../../../../shared/components/brand/BrandName";
import { AdminSettingsAboutRow } from "./AdminSettingsSharedUi";

export function AdminSettingsAboutCard() {
  const backendLabel = AUTH_BACKEND_ENABLED
    ? "Express API (/v1/jobmitra/*) — session cookies + CSRF"
    : "API available (opt-in) — set VITE_AUTH_BACKEND_ENABLED=true";

  const phaseLabel = AUTH_BACKEND_ENABLED
    ? "Hybrid — DB authoritative; encrypted browser cache for profile PII"
    : "Local sealed cache — encrypted profile PII in browser; enable auth for DB SoT";

  const storageLabel = AUTH_BACKEND_ENABLED
    ? "PostgreSQL/API + sealed localStorage profile cache"
    : "Sealed localStorage (PII envelopes) + optional API";

  return (
    <div className="wm-ad-domainCard" style={{ paddingLeft: 20 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <AdminSettingsAboutRow
          label="Application"
          value={<><JobMitraBrandName size="sm" /> Enterprise</>}
        />
        <AdminSettingsAboutRow label="Version" value="1.0.0" />
        <AdminSettingsAboutRow label="Phase" value={phaseLabel} />
        <AdminSettingsAboutRow label="Build" value="React + TypeScript + Vite" />
        <AdminSettingsAboutRow label="Backend" value={backendLabel} />
        <AdminSettingsAboutRow label="Data Storage" value={storageLabel} />
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "12px 14px",
          borderRadius: 10,
          background: "var(--wm-ad-card-inner)",
          border: "1px solid var(--wm-ad-border)",
        }}
      >
        <div style={{ fontSize: 12, color: "var(--wm-ad-navy-400)", lineHeight: 1.6 }}>
          Enterprise stack includes an Express backend under <code>server/</code>. Auth, vault OTP
          (Argon2/hash), and domain APIs activate when auth backend is enabled. Profile PII in the
          browser is sealed (not plaintext). Admin data export redacts/hashes PII. Production SMS
          OTP, payments, and messaging may still be partial — this screen is internal build info.
        </div>
      </div>
    </div>
  );
}
