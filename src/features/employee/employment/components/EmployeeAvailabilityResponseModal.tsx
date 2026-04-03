// src/features/employee/employment/components/EmployeeAvailabilityResponseModal.tsx
//
// Employee side — Accept/Decline availability request (Root Map 7.4.13).
// Shows request details + optional note field.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { staffAvailabilityStorage } from "../../../employer/hrManagement/storage/staffAvailability.storage";
import type { StaffAvailabilityRequest } from "../../../employer/hrManagement/types/staffAvailability.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  request: StaffAvailabilityRequest;
  hrCandidateId: string;
  open: boolean;
  onClose: () => void;
};

export function EmployeeAvailabilityResponseModal({ request, hrCandidateId, open, onClose }: Props) {
  const [note, setNote] = useState("");
  const [responded, setResponded] = useState(false);
  const [responseType, setResponseType] = useState<"accepted" | "declined" | null>(null);

  const handleRespond = (response: "accepted" | "declined") => {
    staffAvailabilityStorage.respond(request.id, hrCandidateId, response, note);
    setResponseType(response);
    setResponded(true);
  };

  const handleClose = () => {
    setNote("");
    setResponded(false);
    setResponseType(null);
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Availability Request" maxWidth={440}>
      <div style={{ padding: 20 }}>
        {/* Success State */}
        {responded && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>
              {responseType === "accepted" ? "✅" : "❌"}
            </div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
              {responseType === "accepted" ? "You accepted!" : "You declined"}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 4 }}>
              {responseType === "accepted"
                ? "Your employer has been notified. Please be available on the requested date."
                : "Your employer has been notified of your response."}
            </div>
            <button
              className="wm-outlineBtn"
              type="button"
              onClick={handleClose}
              style={{ marginTop: 16 }}
            >
              Close
            </button>
          </div>
        )}

        {/* Request Details + Response */}
        {!responded && (
          <>
            <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-emp-text, var(--wm-er-text))", marginBottom: 4 }}>
              {request.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginBottom: 14 }}>
              Your employer is checking if you are available.
            </div>

            {/* Info Card */}
            <div style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "#f9fafb",
              border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
              marginBottom: 14,
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
                <span>📅 {formatDate(request.dateNeeded)}</span>
                {request.timeNeeded && <span>🕐 {request.timeNeeded}</span>}
                {request.location && <span>📍 {request.location}</span>}
              </div>
              {request.description && (
                <div style={{
                  fontSize: 13,
                  color: "var(--wm-emp-text, var(--wm-er-text))",
                  lineHeight: 1.6,
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                }}>
                  {request.description}
                </div>
              )}
            </div>

            {/* Note */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--wm-emp-text, var(--wm-er-text))",
                display: "block",
                marginBottom: 4,
              }}>
                Add a note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. I can come but only after 2 PM..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 13,
                  border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                  borderRadius: 8,
                  outline: "none",
                  background: "#fff",
                  color: "var(--wm-emp-text, var(--wm-er-text))",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => handleRespond("declined")}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#dc2626",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => handleRespond("accepted")}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fff",
                  background: "#15803d",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Accept
              </button>
            </div>
          </>
        )}
      </div>
    </CenterModal>
  );
}