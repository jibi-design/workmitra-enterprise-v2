/** Transfer business profile — initiate, accept, cancel (Phase 0). */

import { useState, type CSSProperties } from "react";
import type { EmployerProfile } from "../../storage/employerSettings.storage";
import {
  acceptBusinessTransfer,
  cancelBusinessTransfer,
  initiateBusinessTransfer,
} from "../../services/employerBusinessTransfer.service";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";

type Props = {
  readonly profile: EmployerProfile;
  readonly onProfileRefresh: () => void;
  readonly onNotice: (notice: NoticeData) => void;
};

export function BusinessTransferPanel({ profile, onProfileRefresh, onNotice }: Props) {
  const [toOwnerName, setToOwnerName] = useState("");
  const [toOwnerEmail, setToOwnerEmail] = useState("");
  const [toOwnerPhone, setToOwnerPhone] = useState("");
  const [reason, setReason] = useState("");
  const [acceptCode, setAcceptCode] = useState("");

  const pending = profile.pendingTransfer;
  const isPending = profile.transferStatus === "pending" && Boolean(pending);
  const auditLog = profile.ownershipAuditLog ?? [];

  function handleInitiate(): void {
    const result = initiateBusinessTransfer({
      toOwnerName,
      toOwnerEmail,
      toOwnerPhone,
      reason,
    });

    if (!result.success) {
      onNotice({ title: "Could not start transfer", message: result.reason, tone: "warn" });
      return;
    }

    onProfileRefresh();
    onNotice({
      title: "Transfer started",
      message: `Share this code with the new owner: ${result.transferCode}\nValid until ${new Date(result.expiresAt).toLocaleDateString()}.`,
      tone: "success",
    });
  }

  function handleCancel(): void {
    const result = cancelBusinessTransfer();
    if (!result.success) {
      onNotice({ title: "Could not cancel", message: result.reason, tone: "warn" });
      return;
    }
    onProfileRefresh();
    onNotice({
      title: "Transfer cancelled",
      message: "Business transfer was cancelled.",
      tone: "success",
    });
  }

  function handleAccept(): void {
    const result = acceptBusinessTransfer(acceptCode);
    if (!result.success) {
      onNotice({ title: "Could not complete transfer", message: result.reason, tone: "warn" });
      return;
    }
    setAcceptCode("");
    onProfileRefresh();
    onNotice({
      title: "Transfer complete",
      message: "Business profile ownership updated. Personal account data was not moved.",
      tone: "success",
    });
  }

  return (
    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
      {isPending && pending ? (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.22)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: "#b45309" }}>
            Transfer in progress
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
            New owner: {pending.toOwnerName}
            <br />
            Code: <strong>{pending.code}</strong>
          </div>
          <button type="button" onClick={handleCancel} style={secondaryBtn}>
            Cancel transfer
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <Field
            label="New owner name"
            value={toOwnerName}
            onChange={setToOwnerName}
            placeholder="Full name"
          />
          <Field
            label="New owner email"
            value={toOwnerEmail}
            onChange={setToOwnerEmail}
            placeholder="Email"
          />
          <Field
            label="New owner phone"
            value={toOwnerPhone}
            onChange={setToOwnerPhone}
            placeholder="Phone"
          />
          <Field
            label="Reason"
            value={reason}
            onChange={setReason}
            placeholder="Why is ownership changing?"
          />
          <button type="button" onClick={handleInitiate} style={primaryBtn}>
            Start transfer
          </button>
        </div>
      )}

      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: "rgba(248,250,252,0.95)",
          border: "1px solid rgba(226,232,240,0.9)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a" }}>Accept transfer</div>
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          New owner enters the transfer code shared by the current owner.
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input
            type="text"
            value={acceptCode}
            onChange={(e) => setAcceptCode(e.target.value.toUpperCase())}
            placeholder="Transfer code"
            style={inputStyle}
          />
          <button type="button" onClick={handleAccept} style={primaryBtn}>
            Accept
          </button>
        </div>
      </div>

      {auditLog.length > 0 ? (
        <div>
          <div
            style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}
          >
            Ownership history
          </div>
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {auditLog
              .slice()
              .reverse()
              .slice(0, 3)
              .map((entry) => (
                <div key={entry.id} style={{ fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>
                  {new Date(entry.timestamp).toLocaleDateString()} — {entry.fromOwnerName} →{" "}
                  {entry.toOwnerName}
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder: string;
}) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  );
}

const inputStyle: CSSProperties = {
  height: 38,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  padding: "0 12px",
  fontSize: 13,
};

const primaryBtn: CSSProperties = {
  height: 38,
  borderRadius: 10,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontSize: 12,
  fontWeight: 800,
  padding: "0 16px",
  cursor: "pointer",
};

const secondaryBtn: CSSProperties = {
  ...primaryBtn,
  marginTop: 10,
  background: "rgba(15,23,42,0.08)",
  color: "#334155",
};
