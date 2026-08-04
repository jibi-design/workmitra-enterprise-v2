/** Compliance shelf section — add + list employer-owned docs (metadata Phase-0). */

import { useState, type FormEvent } from "react";
import type { ComplianceDocument, ComplianceShelfId } from "../storage/employerCompliance.types";
import { employerComplianceStorage } from "../storage/employerCompliance.storage";
import { expiryBucketLabel, getComplianceExpiryBucket } from "../helpers/employerComplianceExpiry";

type Props = {
  readonly shelfId: ComplianceShelfId;
  readonly title: string;
  readonly description: string;
  readonly documents: readonly ComplianceDocument[];
};

export function ComplianceShelfSection({ shelfId, title, description, documents }: Props) {
  const [open, setOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm(): void {
    setDocTitle("");
    setFileName("");
    setExpiresOn("");
    setNotes("");
    setError(null);
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const result = employerComplianceStorage.add({
      shelf: shelfId,
      title: docTitle,
      fileName: fileName || undefined,
      expiresOn: expiresOn || undefined,
      notes: notes || undefined,
    });
    if (!result) {
      setError("Add a document title to save this shelf entry.");
      return;
    }
    resetForm();
    setOpen(false);
  }

  return (
    <section className="wm-compShelf" data-testid={`compliance-shelf-${shelfId}`}>
      <div className="wm-compShelf__head">
        <h2 className="wm-compShelf__title">{title}</h2>
        <p className="wm-compShelf__sub">{description}</p>
      </div>

      {documents.length > 0 ? (
        <ul className="wm-compDocList">
          {documents.map((doc) => {
            const bucket = getComplianceExpiryBucket(doc.expiresOn);
            return (
              <li key={doc.id} className="wm-compDocList__item">
                <div className="wm-compDocList__copy">
                  <div className="wm-compDocList__title">{doc.title}</div>
                  <div className="wm-compDocList__meta">
                    {doc.fileName ? `${doc.fileName} · ` : ""}
                    {doc.expiresOn
                      ? `Expires ${doc.expiresOn} · ${expiryBucketLabel(bucket)}`
                      : "No expiry date"}
                  </div>
                  {doc.notes ? <div className="wm-compDocList__notes">{doc.notes}</div> : null}
                </div>
                <button
                  type="button"
                  className="wm-compDocList__remove"
                  aria-label={`Remove ${doc.title}`}
                  onClick={() => employerComplianceStorage.remove(doc.id)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="wm-compEmpty">No documents on this shelf yet.</p>
      )}

      {!open ? (
        <button
          type="button"
          className="wm-compAddBtn"
          data-testid={`compliance-shelf-add-${shelfId}`}
          onClick={() => setOpen(true)}
        >
          + Add document reference
        </button>
      ) : (
        <form className="wm-compForm" onSubmit={handleSubmit}>
          <label className="wm-compForm__field">
            <span>Title</span>
            <input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Employer Liability Insurance 2026"
              required
              maxLength={120}
            />
          </label>
          <label className="wm-compForm__field">
            <span>File name / reference</span>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Optional local file name"
              maxLength={160}
            />
          </label>
          <label className="wm-compForm__field">
            <span>Expires on</span>
            <input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
          </label>
          <label className="wm-compForm__field">
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional internal note"
              rows={2}
              maxLength={240}
            />
          </label>
          {error ? <p className="wm-compForm__error">{error}</p> : null}
          <div className="wm-compForm__actions">
            <button type="submit" className="wm-compPrimaryBtn">
              Save to shelf
            </button>
            <button
              type="button"
              className="wm-compGhostBtn"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
