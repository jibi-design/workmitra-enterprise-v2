// src/features/employer/hrManagement/pages/HRCandidateDetailPage.tsx
//
// HR Candidate detail page — full lifecycle actions.

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { OfferLetterModal } from "../components/OfferLetterModal";
import { useHRCandidates } from "../helpers/hrSubscription";
import {
  HRCandidateHeader,
  HRCandidateNotFound,
  HRCandidateStatusSections,
} from "./HRCandidateDetailPage.parts";

export function HRCandidateDetailPage() {
  const { hrCandidateId } = useParams<{ hrCandidateId: string }>();
  const nav = useNavigate();
  const [showOfferModal, setShowOfferModal] = useState(false);

  const allRecords = useHRCandidates();
  const record = allRecords.find((r) => r.id === hrCandidateId) ?? null;

  if (!record) {
    return <HRCandidateNotFound onBack={() => nav("/employer/hr")} />;
  }

  const movedDate = new Date(record.movedToHRAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleSendOffer = (data: {
    salaryAmount: string;
    salaryFrequency: "monthly" | "weekly" | "hourly" | "annual";
    joiningDate: number;
    workSchedule: string;
    additionalTerms: string;
  }) => {
    hrManagementStorage.sendOffer(record.id, data);
    setShowOfferModal(false);
  };

  const handleStartOnboarding = () => {
    hrManagementStorage.startOnboarding(record.id);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => nav("/employer/hr")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 800,
          color: "var(--wm-er-accent-hr)",
          padding: "0 0 12px",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← HR Management
      </button>

      <HRCandidateHeader record={record} movedDate={movedDate} />

      <HRCandidateStatusSections
        record={record}
        onPrepareOffer={() => setShowOfferModal(true)}
        onStartOnboarding={handleStartOnboarding}
      />

      <OfferLetterModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        record={record}
        onSend={handleSendOffer}
      />
    </div>
  );
}
