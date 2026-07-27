import { SHOW_SHORTLIST_DOCUMENT_BUTTON } from "../helpers/careerCandidateCard.helpers";
import { fmtDateTime } from "../helpers/careerDashboardHelpers";
import type { CareerTab } from "./CareerPipelineTabs";
import { CAREER_CANDIDATE_ACTIONS_STYLE } from "./CareerCandidateActions.styles";

export type CareerCandidateActionsProps = {
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

export function CareerCandidateActionsBody({
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
      <style>{CAREER_CANDIDATE_ACTIONS_STYLE}</style>

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
