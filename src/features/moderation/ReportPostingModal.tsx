/** Report-this-posting sheet — employee Shift/Career details only. */

import { useState } from "react";
import { CenterModal } from "../../shared/components/CenterModal";
import { ApiRequestError } from "../../shared/services/apiService";
import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { submitContentReport } from "./contentReport.api";
import {
  CONTENT_REPORT_REASON_OPTIONS,
  type ContentReportDomain,
  type ContentReportReason,
} from "./contentReport.types";

type Props = {
  readonly open: boolean;
  readonly domain: ContentReportDomain;
  readonly postId: string;
  readonly title: string;
  readonly companyName: string;
  readonly employerId?: string;
  readonly onClose: () => void;
  readonly onReported: () => void;
};

export function ReportPostingModal({
  open,
  domain,
  postId,
  title,
  companyName,
  employerId,
  onClose,
  onReported,
}: Props) {
  const [reason, setReason] = useState<ContentReportReason | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!AUTH_BACKEND_ENABLED) {
      setError("Reporting needs a live sign-in session.");
      return;
    }
    if (!reason) {
      setError("Choose a reason.");
      return;
    }
    if (reason === "other" && !note.trim()) {
      setError("Add a short note for Other.");
      return;
    }
    setBusy(true);
    try {
      await submitContentReport({
        domain,
        postId,
        reasonCode: reason,
        note: note.trim() || undefined,
        employerId,
        title,
        companyName,
      });
      onReported();
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not send this report.");
    } finally {
      setBusy(false);
    }
  }

  const uiState = error ? "error" : busy ? "loading" : "active";

  return (
    <CenterModal open={open} onBackdropClose={busy ? undefined : onClose} ariaLabel="Report posting">
      <div data-testid="report-posting-modal" data-ui-state={uiState}>
        <h2 className="wm-ent-empty__title" style={{ marginBottom: 8 }}>
          Report this posting
        </h2>
        <p className="wm-ent-empty__subtitle" style={{ marginBottom: 12 }}>
          Trust & Safety reviews reports. The employer will not see your name.
        </p>
        <label className="wm-auth-label">
          Reason
          <select
            className="wm-input"
            value={reason}
            onChange={(e) => setReason(e.target.value as ContentReportReason | "")}
            disabled={busy}
          >
            <option value="">Select a reason</option>
            {CONTENT_REPORT_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="wm-auth-label" style={{ marginTop: 10 }}>
          Details {reason === "other" ? "(required)" : "(optional)"}
          <textarea
            className="wm-input"
            maxLength={500}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
          />
        </label>
        {error ? (
          <div className="wm-ent-error" role="alert" style={{ marginTop: 10 }}>
            <div className="wm-ent-error__subtitle">{error}</div>
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
          <button type="button" className="wm-outlineBtn" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="wm-primarybtn" disabled={busy} onClick={() => void submit()}>
            {busy ? "Sending…" : "Submit report"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
