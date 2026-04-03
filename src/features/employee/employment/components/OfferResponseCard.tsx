// src/features/employee/employment/components/OfferResponseCard.tsx
//
// Shows on Employee Home when there's a pending offer (status = "offered").
// Tapping opens the OfferResponseModal.

import { useState } from "react";
import type { HRCandidateRecord } from "../../../employer/hrManagement/types/hrManagement.types";
import { hrManagementStorage } from "../../../employer/hrManagement/storage/hrManagement.storage";
import { OfferResponseModal } from "./OfferResponseModal";

type Props = {
  record: HRCandidateRecord;
};

export function OfferResponseCard({ record }: Props) {
  const [showModal, setShowModal] = useState(false);

  const handleAccept = () => {
    hrManagementStorage.acceptOffer(record.id);
  };

  const handleReject = (reason: string) => {
    hrManagementStorage.rejectOffer(record.id, reason || undefined);
  };

  return (
    <>
      <section
        className="wm-ee-card"
        role="button"
        tabIndex={0}
        onClick={() => setShowModal(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowModal(true); }}
        style={{
          borderLeft: "4px solid #2563eb",
          cursor: "pointer",
        }}
        aria-label="View and respond to offer"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(37, 99, 235, 0.08)",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 14, color: "#2563eb" }}>
              Offer Received!
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text, var(--wm-er-text))", marginTop: 2 }}>
              {record.jobTitle}{record.department ? ` · ${record.department}` : ""}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
              Tap to view offer details and respond
            </div>
            <div style={{ marginTop: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(37, 99, 235, 0.08)",
                  color: "#2563eb",
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                }}
              >
                Action Required
              </span>
            </div>
          </div>
          <span style={{ fontSize: 18, color: "var(--wm-emp-muted, var(--wm-er-muted))", flexShrink: 0 }}>›</span>
        </div>
      </section>

      <OfferResponseModal
        open={showModal}
        record={record}
        onAccept={handleAccept}
        onReject={handleReject}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}