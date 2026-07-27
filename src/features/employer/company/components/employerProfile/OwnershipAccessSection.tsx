/** Section 4 — Ownership & access (transfer-ready architecture). */

import type { EmployerProfile } from "../../storage/employerSettings.storage";
import { BusinessTransferPanel } from "./BusinessTransferPanel";
import {
  EXECUTIVE_CARD_SHELL,
  EXECUTIVE_HELPER,
  EXECUTIVE_SECTION_KICKER,
  EXECUTIVE_SECTION_TITLE,
} from "../../helpers/employerProfileCard.styles";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";

type Props = {
  readonly data: EmployerProfile;
  readonly onProfileRefresh: () => void;
  readonly onNotice: (notice: NoticeData) => void;
};

export function OwnershipAccessSection({ data, onProfileRefresh, onNotice }: Props) {
  const ownerName = data.fullName.trim() || "Not set";
  const transferStatus = data.transferStatus ?? "none";
  const adminCount = data.businessAdminIds?.length ?? 0;

  return (
    <section style={EXECUTIVE_CARD_SHELL} data-testid="employer-ownership-section">
      <div style={EXECUTIVE_SECTION_KICKER}>Ownership & access</div>
      <h2 style={EXECUTIVE_SECTION_TITLE}>Business access</h2>
      <p style={EXECUTIVE_HELPER}>
        Only business profile ownership can transfer. Your personal account data never transfers.
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
        <Row label="Transfer status" value={formatTransferStatus(transferStatus)} />
        <Row label="Staff admins" value={adminCount > 0 ? `${adminCount} added` : "Coming soon"} />
      </div>

      <BusinessTransferPanel
        profile={data}
        onProfileRefresh={onProfileRefresh}
        onNotice={onNotice}
      />
    </section>
  );
}

function formatTransferStatus(status: string): string {
  if (status === "pending") return "Transfer in progress";
  if (status === "completed") return "Transfer completed";
  if (status === "cancelled") return "Transfer cancelled";
  return "No transfer in progress";
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
