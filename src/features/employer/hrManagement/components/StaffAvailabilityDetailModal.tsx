// src/features/employer/hrManagement/components/StaffAvailabilityDetailModal.tsx
//
// Full detail modal for Staff Availability Request.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { staffAvailabilityStorage } from "../storage/staffAvailability.storage";
import type { StaffAvailabilityRequest } from "../types/staffAvailability.types";
import {
  REQUEST_STATUS_CONFIG,
  MODE_CONFIG,
} from "../helpers/staffAvailabilityConstants";
import { ResponseRow } from "./AvailabilityResponseRow";
import { formatAvailDate } from "../helpers/availabilityDateHelpers";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  request: StaffAvailabilityRequest;
  open: boolean;
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function StaffAvailabilityDetailModal({ request, open, onClose }: Props) {
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const [confirmAction, setConfirmAction] = useState<"cancel" | "advance" | null>(null);

  const sCfg = REQUEST_STATUS_CONFIG[request.status];
  const mCfg = MODE_CONFIG[request.mode];
  const isOpen = request.status === "open";

  const handleCancelRequest = () => {
    setConfirmAction("cancel");
    setConfirm({
      title: "Cancel Request",
      message: `Are you sure you want to cancel "${request.title}"? Employees who haven't responded yet will no longer see this request.`,
      tone: "danger",
      confirmLabel: "Cancel Request",
      cancelLabel: "Keep Open",
    });
  };

  const handleForceAdvance = () => {
    setConfirmAction("advance");
    setConfirm({
      title: "Advance to Next Batch",
      message: "This will skip remaining pending responses in the current batch and activate the next batch. Are you sure?",
      tone: "neutral",
      confirmLabel: "Advance Batch",
      cancelLabel: "Wait",
    });
  };

  const handleConfirm = () => {
    if (confirmAction === "cancel") {
      staffAvailabilityStorage.cancelRequest(request.id);
    } else if (confirmAction === "advance") {
      staffAvailabilityStorage.forceAdvanceBatch(request.id);
    }
    setConfirm(null);
    setConfirmAction(null);
  };

  const canAdvance =
    isOpen &&
    request.mode === "batch" &&
    request.activeBatchNumber < request.batches.length;

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Request Details" maxWidth={500}>
      <div style={{ padding: 20, maxHeight: "85vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)", lineHeight: 1.4, flex: 1 }}>
            {request.title}
          </div>
          <span style={{
            padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800,
            background: sCfg.bg, color: sCfg.color,
            textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {sCfg.label}
          </span>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 14 }}>
          <span>{formatAvailDate(request.dateNeeded)}</span>
          {request.timeNeeded && <span>{request.timeNeeded}</span>}
          {request.location && <span>{request.location}</span>}
          <span>{mCfg.icon} {mCfg.label}</span>
          <span>{request.acceptedCount}/{request.requiredCount} accepted</span>
        </div>

        {/* Description */}
        {request.description && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Details
            </div>
            <div style={{
              fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.6,
              padding: "10px 12px", borderRadius: 8,
              background: "#f9fafb", border: "1px solid var(--wm-er-border, #e5e7eb)",
            }}>
              {request.description}
            </div>
          </div>
        )}

        {/* Simple Mode */}
        {request.mode === "simple" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Employee Responses ({request.employees.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {request.employees.map((emp) => (
                <ResponseRow key={emp.hrCandidateId} emp={emp} />
              ))}
            </div>
          </div>
        )}

        {/* Batch Mode */}
        {request.mode === "batch" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Priority Batches
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {request.batches.map((batch) => (
                <div
                  key={batch.batchNumber}
                  style={{
                    padding: "10px 12px", borderRadius: 8,
                    border: batch.isActive ? "2px solid #0369a1" : "1px solid var(--wm-er-border, #e5e7eb)",
                    background: batch.isActive ? "#eff6ff" : "#f9fafb",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: 12, color: "var(--wm-er-text)" }}>
                      Batch {batch.batchNumber}
                      {batch.isActive && (
                        <span style={{ fontWeight: 600, fontSize: 10, color: "#0369a1", marginLeft: 6 }}>Active</span>
                      )}
                    </div>
                    {batch.activatedAt && (
                      <div style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
                        Sent {formatAvailDate(batch.activatedAt)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {batch.employees.map((emp) => (
                      <ResponseRow key={emp.hrCandidateId} emp={emp} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {isOpen && canAdvance && (
            <button className="wm-outlineBtn" type="button" onClick={handleForceAdvance} style={{ fontSize: 12 }}>
              Skip to Next Batch
            </button>
          )}
          {isOpen && (
            <button type="button" onClick={handleCancelRequest}
              style={{
                padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "#dc2626",
                background: "none", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer",
              }}>
              Cancel Request
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Close</button>
        </div>
      </div>

      <ConfirmModal
        confirm={confirm}
        onConfirm={handleConfirm}
        onCancel={() => { setConfirm(null); setConfirmAction(null); }}
      />
    </CenterModal>
  );
}
