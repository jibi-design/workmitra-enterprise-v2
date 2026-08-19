/** Section 4 — Ownership display (single-employer Pro · transfer UI removed). */

import { useAuthStore } from "../../../../../shared/store/authStore";
import type { EmployerProfile } from "../../storage/employerSettings.storage";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import {
  EXECUTIVE_CARD_SHELL,
  EXECUTIVE_HELPER,
  EXECUTIVE_SECTION_KICKER,
  EXECUTIVE_SECTION_TITLE,
} from "../../helpers/employerProfileCard.styles";

type Props = {
  readonly data: EmployerProfile;
  readonly onProfileRefresh?: () => void;
  readonly onNotice?: (notice: NoticeData) => void;
};

export function OwnershipAccessSection({ data }: Props) {
  const user = useAuthStore((s) => s.user);
  const ownerName = user?.fullName?.trim() || data.fullName.trim() || "Not set";
  const ownerEmail = user?.email?.trim() || data.email.trim() || "—";

  return (
    <section style={EXECUTIVE_CARD_SHELL} data-testid="employer-ownership-section">
      <div style={EXECUTIVE_SECTION_KICKER}>Ownership & access</div>
      <h2 style={EXECUTIVE_SECTION_TITLE}>Business owner</h2>
      <p style={EXECUTIVE_HELPER}>
        Single-employer Pro · ownership transfer and admin sharing are disabled on this surface.
      </p>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(226,232,240,0.8)",
          display: "grid",
          gap: 10,
        }}
      >
        <Row label="Current owner" value={ownerName} />
        <Row label="Sign-in email" value={ownerEmail} />
        <Row label="Auth user ID" value={user?.id ?? "—"} />
        <Row label="Staff admins" value="Not available (single-owner)" />
      </div>
    </section>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 800, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}
