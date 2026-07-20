// App name: Job Mitra
// File name: EmployerCareerDraftReminderCard.tsx
// Incomplete career job draft reminder for employer Career home.

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { formatDraftTime } from "../../shiftJobs/components/createShiftDrafts/shiftDraftUi.helpers";
import {
  careerCreateDraftStorage,
  type CareerCreateDraft,
} from "../storage/careerCreateDraft.storage";

function getDraftSnapshot(): CareerCreateDraft | null {
  return careerCreateDraftStorage.get();
}

function subscribeDraft(onStoreChange: () => void): () => void {
  return careerCreateDraftStorage.subscribe(onStoreChange);
}

export function EmployerCareerDraftReminderCard() {
  const nav = useNavigate();
  const draft = useSyncExternalStore(subscribeDraft, getDraftSnapshot, () => null);

  if (!draft) return null;

  const title = draft.basic.jobTitle.trim() || "Untitled career job draft";
  const savedLabel = draft.updatedAt ? formatDraftTime(draft.updatedAt) : "";

  function resumeDraft() {
    nav(ROUTE_PATHS.employerCareerCreate);
  }

  function discardDraft() {
    careerCreateDraftStorage.clear();
  }

  return (
    <section
      style={{
        padding: "14px 16px",
        borderRadius: 18,
        border: "1px solid rgba(37,99,235,0.18)",
        background: "linear-gradient(135deg, rgba(239,246,255,0.95), rgba(255,255,255,0.98))",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.06)",
        display: "grid",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1e3a8a" }}>
          Incomplete career job draft
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--wm-er-muted, #64748b)",
            lineHeight: 1.45,
          }}
        >
          Resume &quot;{title}&quot; where you left off.
          {savedLabel ? ` Last saved ${savedLabel}.` : ""}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
        <button
          type="button"
          onClick={resumeDraft}
          style={{
            minHeight: 40,
            borderRadius: 12,
            border: "none",
            background: "var(--wm-er-accent-career, #2563eb)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Resume Draft
        </button>
        <button
          type="button"
          onClick={discardDraft}
          style={{
            minHeight: 40,
            borderRadius: 12,
            border: "1px solid rgba(220,38,38,0.2)",
            background: "rgba(254,242,242,0.9)",
            color: "var(--wm-error, #dc2626)",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            padding: "0 14px",
          }}
        >
          Discard
        </button>
      </div>
    </section>
  );
}
