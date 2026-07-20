// App name: Job Mitra
// File name: CareerCandidateActions.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCandidateActions.tsx

import { SHOW_SHORTLIST_DOCUMENT_BUTTON } from "../helpers/careerCandidateCard.helpers";
import { fmtDateTime } from "../helpers/careerDashboardHelpers";
import type { CareerTab } from "./CareerPipelineTabs";

type CareerCandidateActionsProps = {
  appId: string;
  jobId: string;
  tab: CareerTab;
  isBusy: boolean;
  hiredAt?: number;
  rejectedAt?: number;
  nextRound: number | null;
  recordableRound: number | null;
  canOffer: boolean;
  canHire: boolean;
  onShortlist: (appId: string) => void;
  onRemoveFromShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onScheduleInterview: (appId: string, roundNumber: number) => void;
  onRecordResult: (appId: string, roundNumber: number) => void;
  onSendOffer: (appId: string) => void;
  onHire: (appId: string) => void;
  onEditNotes: (appId: string) => void;
  onOpenDocuments: () => void;
};

const ACTIONS_STYLE = `
  .wm-act-btn {
    transition: all 0.2s var(--wm-motion-spring) !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    min-height: 42px;
    padding: 0 16px;
    border-radius: 14px;
    white-space: nowrap;
    cursor: pointer;
  }
  .wm-act-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  .wm-act-btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  
  .wm-act-primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    border: none;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }
  .wm-act-primary:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  }
  
  .wm-act-ghost {
    background: transparent;
    color: #475569;
    border: 1px solid #cbd5e1;
  }
  .wm-act-ghost:hover:not(:disabled) {
    background: #f8fafc;
    color: #0f172a;
    border-color: #94a3b8;
  }

  .wm-act-danger {
    background: transparent;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
  .wm-act-danger:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #f87171;
  }

  .wm-act-special {
    width: 100%;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f8fafc, #ffffff);
    color: #4338ca;
    border: 1px solid #e0e7ff;
    box-shadow: 0 2px 8px rgba(67, 56, 202, 0.05);
  }
  .wm-act-special:hover:not(:disabled) {
    border-color: #c7d2fe;
    box-shadow: 0 4px 12px rgba(67, 56, 202, 0.1);
  }

  /* Smart Mobile Grid Layout */
  .wm-actions-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .wm-actions-left {
    display: flex;
    gap: 8px;
  }
  .wm-actions-right {
    display: flex;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
  }

  @media (max-width: 640px) {
    .wm-actions-wrapper {
      flex-direction: column-reverse;
      align-items: stretch;
      gap: 12px;
    }
    .wm-actions-left {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
    }
    .wm-actions-right {
      display: flex;
      flex-direction: column-reverse;
      gap: 8px;
      width: 100%;
    }
    .wm-act-btn {
      width: 100%;
    }
  }
`;

export function CareerCandidateActions({
  appId,
  tab,
  isBusy,
  hiredAt,
  rejectedAt,
  nextRound,
  recordableRound,
  canOffer,
  canHire,
  onShortlist,
  onRemoveFromShortlist,
  onReject,
  onScheduleInterview,
  onRecordResult,
  onSendOffer,
  onHire,
  onEditNotes,
  onOpenDocuments,
}: CareerCandidateActionsProps) {
  return (
    <div>
      <style>{ACTIONS_STYLE}</style>

      {/* Special Full-Width Document Button */}
      {tab === "shortlisted" && SHOW_SHORTLIST_DOCUMENT_BUTTON && (
        <button
          type="button"
          onClick={onOpenDocuments}
          disabled={isBusy}
          className="wm-act-btn wm-act-special"
          style={{ opacity: isBusy ? 0.6 : 1 }}
        >
          <span style={{ marginRight: 8 }}>📄</span> View Profile & Documents
        </button>
      )}

      <div className="wm-actions-wrapper">
        {/* LEFT ALIGNED: Secondary & Danger Actions */}
        <div className="wm-actions-left">
          {tab !== "hired" && tab !== "rejected" && (
            <>
              <button
                type="button"
                onClick={() => onReject(appId)}
                disabled={isBusy}
                className="wm-act-btn wm-act-danger"
                style={{ opacity: isBusy ? 0.5 : 1 }}
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() => onEditNotes(appId)}
                disabled={isBusy}
                className="wm-act-btn wm-act-ghost"
                style={{ opacity: isBusy ? 0.5 : 1 }}
              >
                Notes
              </button>
            </>
          )}

          {tab === "hired" && hiredAt && (
            <div style={{ fontSize: 12, color: "#15803d", fontWeight: 800 }}>
              Hired on {fmtDateTime(hiredAt)}
            </div>
          )}
          {tab === "rejected" && rejectedAt && (
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
              Rejected on {fmtDateTime(rejectedAt)}
            </div>
          )}
        </div>

        {/* RIGHT ALIGNED: Primary Actions */}
        <div className="wm-actions-right">
          {tab === "applied" && (
            <button
              type="button"
              onClick={() => onShortlist(appId)}
              disabled={isBusy}
              className="wm-act-btn wm-act-primary"
              style={{ opacity: isBusy ? 0.6 : 1 }}
            >
              Move to Shortlist
            </button>
          )}

          {tab === "shortlisted" && (
            <>
              <button
                type="button"
                onClick={() => onRemoveFromShortlist(appId)}
                disabled={isBusy}
                className="wm-act-btn wm-act-ghost"
                style={{ opacity: isBusy ? 0.6 : 1 }}
              >
                Remove from Shortlist
              </button>
              <button
                type="button"
                onClick={() => onScheduleInterview(appId, 1)}
                disabled={isBusy}
                className="wm-act-btn wm-act-primary"
                style={{ opacity: isBusy ? 0.6 : 1 }}
              >
                Schedule Interview
              </button>
            </>
          )}

          {tab === "interview" && (
            <>
              <button
                type="button"
                onClick={() => onRemoveFromShortlist(appId)}
                disabled={isBusy}
                className="wm-act-btn wm-act-ghost"
                style={{ opacity: isBusy ? 0.6 : 1 }}
              >
                Move Candidate to Shortlist
              </button>
              {recordableRound !== null && (
                <button
                  type="button"
                  onClick={() => onRecordResult(appId, recordableRound)}
                  disabled={isBusy}
                  className="wm-act-btn wm-act-primary"
                  style={{ opacity: isBusy ? 0.6 : 1 }}
                >
                  Update Result
                </button>
              )}
              {nextRound !== null && recordableRound === null && (
                <button
                  type="button"
                  onClick={() => onScheduleInterview(appId, nextRound)}
                  disabled={isBusy}
                  className="wm-act-btn wm-act-primary"
                  style={{ opacity: isBusy ? 0.6 : 1 }}
                >
                  Schedule R{nextRound}
                </button>
              )}
              {canOffer && (
                <button
                  type="button"
                  onClick={() => onSendOffer(appId)}
                  disabled={isBusy}
                  className="wm-act-btn wm-act-primary"
                  style={{ opacity: isBusy ? 0.6 : 1 }}
                >
                  Send Offer
                </button>
              )}
            </>
          )}

          {tab === "offered" && canHire && (
            <button
              type="button"
              onClick={() => onHire(appId)}
              disabled={isBusy}
              className="wm-act-btn wm-act-primary"
              style={{ opacity: isBusy ? 0.6 : 1 }}
            >
              Mark as Hired
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
