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

let cachedDraftRaw: string | null = "__init__";
let cachedDraft: CareerCreateDraft | null = null;

function getDraftSnapshot(): CareerCreateDraft | null {
  // useSyncExternalStore requires referentially stable snapshots when data is unchanged.
  const next = careerCreateDraftStorage.get();
  const raw = next ? JSON.stringify(next) : null;
  if (raw === cachedDraftRaw) {
    return cachedDraft;
  }
  cachedDraftRaw = raw;
  cachedDraft = next;
  return cachedDraft;
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
        borderRadius: "var(--wm-radius-chip)",
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--wm-space-8)" }}>
        <button type="button" className="wm-primarybtn" onClick={resumeDraft}>
          Resume Draft
        </button>
        <button type="button" className="wm-dangerBtn" onClick={discardDraft}>
          Discard
        </button>
      </div>
    </section>
  );
}
