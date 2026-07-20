/** Admin — review employer registration for verified badge (Level 3). */

import { useCallback, useState, useSyncExternalStore } from "react";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import {
  approveEmployerVerification,
  getEmployerVerificationQueue,
  isEmployerVerifiedBusiness,
  rejectEmployerVerification,
  revokeEmployerVerification,
} from "../services/employerVerificationAdmin.service";

type Props = {
  readonly onNotice: (title: string, message: string, tone: "success" | "warn") => void;
};

export function AdminEmployerVerificationCard({ onNotice }: Props) {
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);

  useSyncExternalStore(
    employerSettingsStorage.subscribe,
    () => employerSettingsStorage.get().updatedAt ?? 0,
    () => 0,
  );

  const queue = getEmployerVerificationQueue();
  const isVerified = isEmployerVerifiedBusiness();
  const profile = employerSettingsStorage.get();
  const [note, setNote] = useState("");

  if (queue.length === 0 && !isVerified) {
    return null;
  }

  return (
    <section
      style={{
        marginBottom: 16,
        padding: 16,
        borderRadius: 18,
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.92))",
        border: "1px solid rgba(226,232,240,0.9)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
      }}
      data-testid="admin-employer-verification-card"
    >
      <div style={{ fontSize: 11, fontWeight: 900, color: "#7c3aed", textTransform: "uppercase" }}>
        Employer trust review
      </div>
      <h2 style={{ marginTop: 4, fontSize: 16, fontWeight: 950, color: "#0f172a" }}>
        Business verification
      </h2>

      {queue.map((item) => (
        <div
          key={item.employerOrgId}
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900 }}>{item.companyName}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
            Owner: {item.ownerName}
            <br />
            Registration: {item.registrationNo}
          </div>
        </div>
      ))}

      {isVerified ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.2)",
            fontSize: 12,
            fontWeight: 700,
            color: "#15803d",
          }}
        >
          {profile.companyName || "Business"} is verified. Badge is active on public surfaces.
        </div>
      ) : null}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Review note (optional)"
        rows={2}
        style={{
          marginTop: 12,
          width: "100%",
          borderRadius: 10,
          border: "1px solid #d1d5db",
          padding: 10,
          fontSize: 12,
          resize: "vertical",
        }}
      />

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {queue.length > 0 ? (
          <>
            <AdminBtn
              label="Approve verified badge"
              tone="green"
              onClick={() => {
                const result = approveEmployerVerification(note);
                if (!result.success) {
                  onNotice("Could not approve", result.reason, "warn");
                  return;
                }
                setNote("");
                refresh();
                onNotice("Approved", "Official verified badge granted.", "success");
              }}
            />
            <AdminBtn
              label="Reject"
              tone="neutral"
              onClick={() => {
                const result = rejectEmployerVerification(note);
                if (!result.success) {
                  onNotice("Could not reject", result.reason, "warn");
                  return;
                }
                setNote("");
                refresh();
                onNotice("Rejected", "Verification rejected. Employer stays unverified.", "warn");
              }}
            />
          </>
        ) : null}

        {isVerified ? (
          <AdminBtn
            label="Revoke verification"
            tone="warn"
            onClick={() => {
              const result = revokeEmployerVerification(note);
              if (!result.success) {
                onNotice("Could not revoke", result.reason, "warn");
                return;
              }
              setNote("");
              refresh();
              onNotice("Revoked", "Verified badge removed.", "warn");
            }}
          />
        ) : null}
      </div>
    </section>
  );
}

function AdminBtn({
  label,
  tone,
  onClick,
}: {
  readonly label: string;
  readonly tone: "green" | "neutral" | "warn";
  readonly onClick: () => void;
}) {
  const styles =
    tone === "green"
      ? { background: "#16a34a", color: "#fff", border: "none" }
      : tone === "warn"
        ? {
            background: "rgba(239,68,68,0.1)",
            color: "#b91c1c",
            border: "1px solid rgba(239,68,68,0.25)",
          }
        : { background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0" };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles,
        height: 36,
        borderRadius: 10,
        padding: "0 14px",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
