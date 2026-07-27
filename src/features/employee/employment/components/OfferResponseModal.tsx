// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferResponseModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\OfferResponseModal.tsx

import { useState } from "react";
import type { HRCandidateRecord } from "../../../shared/hr/hrPublic";
import { OfferResponseAcceptStep } from "./offerResponse/OfferResponseAcceptStep";
import { OfferResponseRejectStep } from "./offerResponse/OfferResponseRejectStep";
import { OfferResponseViewStep } from "./offerResponse/OfferResponseViewStep";

type Props = {
  open: boolean;
  record: HRCandidateRecord;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
};

type OfferResponseStep = "view" | "confirm_accept" | "confirm_reject";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OfferResponseModal({ open, record, onAccept, onReject, onClose }: Props) {
  const [step, setStep] = useState<OfferResponseStep>("view");
  const [rejectReason, setRejectReason] = useState("");

  if (!open || !record.offerLetter) return null;

  const offer = record.offerLetter;

  const handleClose = () => {
    setStep("view");
    setRejectReason("");
    onClose();
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 440,
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <div role="dialog" aria-modal="true" style={overlayStyle} onClick={handleClose}>
      <div style={cardStyle} onClick={(event) => event.stopPropagation()}>
        {step === "view" && (
          <OfferResponseViewStep
            record={record}
            offer={offer}
            formatDate={formatDate}
            onRejectClick={() => setStep("confirm_reject")}
            onAcceptClick={() => setStep("confirm_accept")}
          />
        )}

        {step === "confirm_accept" && (
          <OfferResponseAcceptStep
            record={record}
            offer={offer}
            formatDate={formatDate}
            onBack={() => setStep("view")}
            onConfirmAccept={() => {
              onAccept();
              handleClose();
            }}
          />
        )}

        {step === "confirm_reject" && (
          <OfferResponseRejectStep
            record={record}
            rejectReason={rejectReason}
            onRejectReasonChange={setRejectReason}
            onBack={() => setStep("view")}
            onConfirmReject={() => {
              onReject(rejectReason.trim());
              handleClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
