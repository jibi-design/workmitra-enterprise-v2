// src/features/employee/employment/components/EmployeeAvailabilitySection.tsx
//
// Employee side — Availability Requests section (Root Map 7.4.13).
// Shows pending requests (need response) + past request history.

import { useState } from "react";
import { useEmployeeAvailability } from "../../../employer/hrManagement/helpers/staffAvailabilityHooks";
import { staffAvailabilityStorage } from "../../../employer/hrManagement/storage/staffAvailability.storage";
import type { StaffAvailabilityRequest } from "../../../employer/hrManagement/types/staffAvailability.types";
import { REQUEST_STATUS_CONFIG } from "../../../employer/hrManagement/helpers/staffAvailabilityConstants";
import { EmployeeAvailabilityResponseModal } from "./EmployeeAvailabilityResponseModal";

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

function getMyStatus(
  request: StaffAvailabilityRequest,
  hrCandidateId: string,
): "pending" | "accepted" | "declined" | null {
  if (request.mode === "simple") {
    const emp = request.employees.find((e) => e.hrCandidateId === hrCandidateId);
    return emp?.status ?? null;
  }
  for (const batch of request.batches) {
    const emp = batch.employees.find((e) => e.hrCandidateId === hrCandidateId);
    if (emp) return emp.status;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  hrCandidateId: string;
};

export function EmployeeAvailabilitySection({ hrCandidateId }: Props) {
  const { allRequests, pendingRequests } = useEmployeeAvailability(hrCandidateId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Don't render if no requests at all
  if (allRequests.length === 0) return null;

  const selectedRequest = selectedId
    ? staffAvailabilityStorage.getById(selectedId)
    : null;

  // Past requests (already responded or closed)
  const pastRequests = allRequests.filter((r) => {
    const myStatus = getMyStatus(r, hrCandidateId);
    return myStatus !== "pending" || r.status !== "open";
  });

  return (
    <div className="wm-ee-card">
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
          Availability Requests
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
          Your employer is checking if you are available for work
        </div>
      </div>

      {/* Pending Requests (need action) */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#d97706",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 6,
          }}>
            Needs Your Response ({pendingRequests.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pendingRequests.map((req) => (
              <button
                key={req.id}
                type="button"
                onClick={() => setSelectedId(req.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "2px solid #fde68a",
                  background: "#fffbeb",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
                  {req.title}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
                  <span>📅 {formatDate(req.dateNeeded)}</span>
                  {req.timeNeeded && <span>🕐 {req.timeNeeded}</span>}
                  {req.location && <span>📍 {req.location}</span>}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#d97706", marginTop: 2 }}>
                  Tap to respond →
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Past Requests */}
      {pastRequests.length > 0 && (
        <div>
          {pendingRequests.length > 0 && (
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--wm-emp-muted, var(--wm-er-muted))",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}>
              Past Requests
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {pastRequests.map((req) => {
              const myStatus = getMyStatus(req, hrCandidateId);
              const sCfg = REQUEST_STATUS_CONFIG[req.status];
              const statusColor = myStatus === "accepted" ? "#15803d" : myStatus === "declined" ? "#dc2626" : "#6b7280";
              const statusLabel = myStatus === "accepted" ? "You accepted" : myStatus === "declined" ? "You declined" : sCfg.label;

              return (
                <div
                  key={req.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-emp-muted, var(--wm-er-muted))", flex: 1 }}>
                      {req.title}
                    </div>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 800,
                      background: `${statusColor}15`,
                      color: statusColor,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 4, display: "flex", gap: 8 }}>
                    <span>📅 {formatDate(req.dateNeeded)}</span>
                    {req.location && <span>📍 {req.location}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {selectedRequest && (
        <EmployeeAvailabilityResponseModal
          request={selectedRequest}
          hrCandidateId={hrCandidateId}
          open={!!selectedRequest}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}