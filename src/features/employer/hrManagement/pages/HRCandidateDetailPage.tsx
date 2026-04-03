// src/features/employer/hrManagement/pages/HRCandidateDetailPage.tsx
//
// HR Candidate detail page — full lifecycle actions.
// Phase 1: Offer + Onboarding ✅
// Phase 2 Batch 1: Employment Status ✅
// Phase 2 Batch 2: Leave Management ✅
// Phase 2 Batch 3: Appointment Letter ✅

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { HRStatusBadge } from "../components/HRStatusBadge";
import { CandidateLocationDeptEdit } from "../components/CandidateLocationDeptEdit";
import { OfferLetterModal } from "../components/OfferLetterModal";
import { OfferLetterPreview } from "../components/OfferLetterPreview";
import { OnboardingChecklistView } from "../components/OnboardingChecklist";
import { EmploymentStatusSection } from "../components/EmploymentStatusSection";
import { LeaveManagementSection } from "../components/LeaveManagementSection";
import { LetterSection } from "../components/LetterSection";
import { PerformanceReviewSection } from "../components/PerformanceReviewSection";
import { ContractRenewalSection } from "../components/ContractRenewalSection";
import { AttendanceLogSection } from "../components/AttendanceLogSection";
import { IncidentReportSection } from "../components/IncidentReportSection";
import { TaskAssignmentSection } from "../components/TaskAssignmentSection";
import { EmployerNotesSection } from "../components/EmployerNotesSection";
import { QuickReportsSection } from "../components/QuickReportsSection";
import { ExitClearanceSection } from "../components/ExitClearanceSection";
import { useHRCandidates } from "../helpers/hrSubscription";

export function HRCandidateDetailPage() {
  const { hrCandidateId } = useParams<{ hrCandidateId: string }>();
  const nav = useNavigate();
  const [showOfferModal, setShowOfferModal] = useState(false);

  const allRecords = useHRCandidates();
  const record = allRecords.find((r) => r.id === hrCandidateId) ?? null;

  if (!record) {
    return (
      <div style={{ textAlign: "center", padding: "60px 16px" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>Candidate not found</div>
        <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 4 }}>This HR record may have been removed or does not exist.</div>
        <button className="wm-primarybtn" type="button" onClick={() => nav("/employer/hr")} style={{ marginTop: 16 }}>Back to HR Management</button>
      </div>
    );
  }

  const movedDate = new Date(record.movedToHRAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

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
      <button type="button" onClick={() => nav("/employer/hr")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, color: "var(--wm-er-accent-hr)", padding: "0 0 12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
        ← HR Management
      </button>

      {/* ── Header ── */}
      <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "var(--wm-er-text)" }}>{record.employeeName}</div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 2 }}>{record.employeeUniqueId}</div>
          </div>
          <HRStatusBadge status={record.status} />
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <DetailField label="Job Title" value={record.jobTitle} /><DetailField label="Moved to HR" value={movedDate} />
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--wm-er-border, #e5e7eb)" }}>
          <CandidateLocationDeptEdit
            hrCandidateId={record.id}
            currentDepartment={record.department || ""}
            currentLocation={record.location || ""}
          />
        </div>
      </div>

      {/* ── Offer Pending ── */}
      {record.status === "offer_pending" && (
        <div style={{ marginTop: 16, padding: 20, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>Ready to Send Offer</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5 }}>This candidate has cleared all interview rounds. Send an offer letter to proceed.</div>
          <div style={{ marginTop: 14 }}>
            <button className="wm-primarybtn" type="button" onClick={() => setShowOfferModal(true)}>Prepare Offer Letter</button>
          </div>
        </div>
      )}

      {/* ── Offered ── */}
      {record.status === "offered" && record.offerLetter && (
        <div style={{ marginTop: 16 }}>
          <OfferLetterPreview offer={record.offerLetter} employeeName={record.employeeName} jobTitle={record.jobTitle} department={record.department} location={record.location} />
          <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: "rgba(124, 58, 237, 0.04)", border: "1px solid rgba(124, 58, 237, 0.1)", fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            ℹ Waiting for the candidate to respond.
          </div>
        </div>
      )}

      {/* ── Offer Rejected ── */}
      {record.status === "offer_rejected" && record.offerLetter && (
        <div style={{ marginTop: 16 }}>
          <OfferLetterPreview offer={record.offerLetter} employeeName={record.employeeName} jobTitle={record.jobTitle} department={record.department} location={record.location} />
        </div>
      )}

      {/* ── Hired — Onboarding ── */}
      {record.status === "hired" && (
        <div style={{ marginTop: 16 }}>
          {record.offerLetter && (
            <div style={{ marginBottom: 16 }}>
              <OfferLetterPreview offer={record.offerLetter} employeeName={record.employeeName} jobTitle={record.jobTitle} department={record.department} location={record.location} />
            </div>
          )}
          {record.onboarding ? (
            <OnboardingChecklistView recordId={record.id} onboarding={record.onboarding} />
          ) : (
            <div style={{ padding: 20, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>Offer Accepted — Start Onboarding</div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>Begin the onboarding process.</div>
              <div style={{ marginTop: 14 }}>
                <button className="wm-primarybtn" type="button" onClick={handleStartOnboarding}>Start Onboarding</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Onboarding ── */}
      {record.status === "onboarding" && record.onboarding && (
        <div style={{ marginTop: 16 }}>
          {record.offerLetter && (
            <div style={{ marginBottom: 16 }}>
              <OfferLetterPreview offer={record.offerLetter} employeeName={record.employeeName} jobTitle={record.jobTitle} department={record.department} location={record.location} />
            </div>
          )}
          <OnboardingChecklistView recordId={record.id} onboarding={record.onboarding} />
        </div>
      )}

      {/* ── Active — Full Employment View ── */}
      {record.status === "active" && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <EmploymentStatusSection record={record} />
          <ContractRenewalSection record={record} />
          <AttendanceLogSection record={record} />
          <TaskAssignmentSection record={record} />
          <IncidentReportSection record={record} />
          <LeaveManagementSection record={record} />
          <EmployerNotesSection record={record} />
          <LetterSection record={record} />
          <QuickReportsSection record={record} />
          <PerformanceReviewSection record={record} />
          {record.offerLetter && (
            <OfferLetterPreview offer={record.offerLetter} employeeName={record.employeeName} jobTitle={record.jobTitle} department={record.department} location={record.location} />
          )}
          {record.onboarding && (
            <OnboardingChecklistView recordId={record.id} onboarding={record.onboarding} />
          )}
        </div>
      )}

      {/* ── Exit Processing ── */}
      {record.status === "exit_processing" && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <ExitClearanceSection record={record} />
          <LetterSection record={record} />
        </div>
      )}

      <OfferLetterModal open={showOfferModal} onClose={() => setShowOfferModal(false)} record={record} onSend={handleSendOffer} />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 2 }}>{value}</div>
    </div>
  );
}
