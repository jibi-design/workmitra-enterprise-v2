// src/features/employer/hrManagement/components/LetterSection.tsx
//
// Letters section in employer HR detail page.
// Shows all letters for this employee + generate buttons.
// Phase 2 Batch 3: Appointment ✅
// Phase 2 Batch 5: Warning + Appreciation ✅
// Phase 2 Batch 6: Promotion + Transfer ✅

import { useState, useSyncExternalStore, useCallback } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import type { LetterRecord } from "../types/letterTemplates.types";
import { LetterPreviewCard } from "./LetterPreviewCard";
import { AppointmentLetterModal } from "./AppointmentLetterModal";
import { WarningLetterModal } from "./WarningLetterModal";
import { AppreciationLetterModal } from "./AppreciationLetterModal";
import { PromotionLetterModal } from "./PromotionLetterModal";
import { TransferLetterModal } from "./TransferLetterModal";
import { ExperienceLetterModal } from "./ExperienceLetterModal";

type Props = {
  record: HRCandidateRecord;
};

export function LetterSection({ record }: Props) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showAppreciationModal, setShowAppreciationModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  const subscribe = useCallback(
    (cb: () => void) => letterTemplatesStorage.subscribe(cb),
    [],
  );

  const getSnapshot = useCallback(() => {
    return JSON.stringify(letterTemplatesStorage.getByCandidate(record.id));
  }, [record.id]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const letters: LetterRecord[] = JSON.parse(raw);

  const hasAppointment = letters.some((l) => l.kind === "appointment");

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>
        Letters & Documents
      </div>

      {/* Generate Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {!hasAppointment && (
          <button
            className="wm-primarybtn"
            type="button"
            onClick={() => setShowAppointmentModal(true)}
            style={{ fontSize: 11, padding: "6px 14px" }}
          >
            Appointment Letter
          </button>
        )}
        {hasAppointment && (
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 800, padding: "6px 0", display: "inline-flex", alignItems: "center" }}>
            ✓ Appointment sent
          </span>
        )}
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={() => setShowPromotionModal(true)}
          style={{ fontSize: 11, padding: "6px 14px", color: "var(--wm-er-accent-hr)", borderColor: "var(--wm-er-accent-hr)" }}
        >
          Promotion Letter
        </button>
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={() => setShowTransferModal(true)}
          style={{ fontSize: 11, padding: "6px 14px", color: "#0369a1", borderColor: "#0369a1" }}
        >
          Transfer Letter
        </button>
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={() => setShowWarningModal(true)}
          style={{ fontSize: 11, padding: "6px 14px", color: "#dc2626", borderColor: "#dc2626" }}
        >
          Warning Letter
        </button>
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={() => setShowAppreciationModal(true)}
          style={{ fontSize: 11, padding: "6px 14px", color: "#16a34a", borderColor: "#16a34a" }}
        >
          Appreciation Letter
        </button>
        {record.status === "exit_processing" && (
          <button
            className="wm-primarybtn"
            type="button"
            onClick={() => setShowExperienceModal(true)}
            style={{ fontSize: 11, padding: "6px 14px", background: "#7c3aed" }}
          >
            Experience Letter
          </button>
        )}
      </div>

      {/* Letters List */}
      {letters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {letters.map((letter) => (
            <LetterPreviewCard key={letter.id} letter={letter} mode="employer" />
          ))}
        </div>
      )}

      {letters.length === 0 && (
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
          No letters generated yet.
        </div>
      )}

      {/* Modals */}
      <AppointmentLetterModal
        open={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        record={record}
      />
      <WarningLetterModal
        open={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        record={record}
      />
      <AppreciationLetterModal
        open={showAppreciationModal}
        onClose={() => setShowAppreciationModal(false)}
        record={record}
      />
      <PromotionLetterModal
        open={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
        record={record}
      />
      <TransferLetterModal
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        record={record}
      />
      <ExperienceLetterModal
        open={showExperienceModal}
        onClose={() => setShowExperienceModal(false)}
        record={record}
      />
    </div>
  );
}
