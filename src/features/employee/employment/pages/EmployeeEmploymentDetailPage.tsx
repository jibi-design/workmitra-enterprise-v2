/** Job Mitra | EmployeeEmploymentDetailPage.tsx | Employment record route */

import { useNavigate, useParams } from "react-router-dom";
import { EmploymentRecordWorkspace } from "../components/EmploymentRecordWorkspace";
import { useEmploymentRecordModel } from "../helpers/employmentRecordModel";
import { employmentLifecycleStorage } from "../storage/employmentLifecycle.storage";

function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="var(--wm-er-accent-console, #0369a1)"
        d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2Zm-6 0h-4V4h4v2Z"
      />
    </svg>
  );
}

export function EmployeeEmploymentDetailPage() {
  const { employmentId } = useParams<{ employmentId: string }>();
  const navigate = useNavigate();
  const model = useEmploymentRecordModel(employmentId);

  const handleSetPrimaryEmployment = (nextEmploymentId: string) => {
    const success = employmentLifecycleStorage.setPrimaryActiveId(nextEmploymentId);
    if (success) {
      navigate(`/employee/employment/${nextEmploymentId}`, { replace: true });
    }
  };

  if (!model.record) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              background: "rgba(3,105,161,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconBriefcase />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>
              My Employment
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
              Employment record not found
            </div>
          </div>
        </div>
        <div className="wm-ee-card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--wm-er-text, #1e293b)" }}>
            Employment Not Found
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 8 }}>
            This employment record may have been removed or the link is invalid.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <EmploymentRecordWorkspace
        record={model.record}
        activeRecords={model.parsed.activeRecords}
        primaryId={model.parsed.primaryId}
        onSetPrimary={handleSetPrimaryEmployment}
        employeeUniqueId={model.employeeUniqueId}
        completedFeedback={model.completedFeedback}
        hrCandidateId={model.hrCandidateId}
        isClosedEmployment={Boolean(model.isClosedEmployment)}
        showHrEmploymentTools={model.showHrEmploymentTools}
        showManagerEmploymentTools={model.showManagerEmploymentTools}
        canApplyLeave={model.canApplyLeave}
        showLeaveModal={model.showLeaveModal}
        onLeaveModal={model.setShowLeaveModal}
      />
    </div>
  );
}
