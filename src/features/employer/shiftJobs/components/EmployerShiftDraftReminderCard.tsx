// App name: Job Mitra
// File name: EmployerShiftDraftReminderCard.tsx
// Incomplete shift post draft reminder for employer Shift home.

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { formatDraftTime } from "./createShiftDrafts/shiftDraftUi.helpers";
import {
  employerShiftDraftStorage,
  type EmployerShiftPostDraft,
} from "../storage/employerShiftDraft.storage";

function getDraftSnapshot(): EmployerShiftPostDraft[] {
  return employerShiftDraftStorage.getAll();
}

function subscribeDrafts(onStoreChange: () => void): () => void {
  return employerShiftDraftStorage.subscribe(onStoreChange);
}

export function EmployerShiftDraftReminderCard() {
  const nav = useNavigate();
  const drafts = useSyncExternalStore(subscribeDrafts, getDraftSnapshot, () => []);

  if (drafts.length === 0) return null;

  const latest = drafts[0];
  const title = latest.titlePreview.trim() || latest.form.jobName.trim() || "Untitled shift draft";
  const savedLabel = latest.updatedAt ? formatDraftTime(latest.updatedAt) : "";

  function resumeDraft() {
    nav(`${ROUTE_PATHS.employerShiftCreate}?draftId=${encodeURIComponent(latest.id)}`);
  }

  function discardDraft() {
    employerShiftDraftStorage.deleteDraft(latest.id);
  }

  return (
    <section className="wm-er-card wm-shiftHomeDraftReminder">
      <div className="wm-shiftHomeDraftReminderTop">
        <div>
          <div className="wm-shiftHomeDraftReminderTitle">Incomplete shift draft</div>
          <div className="wm-shiftHomeDraftReminderText">
            {drafts.length > 1
              ? `${drafts.length} saved drafts waiting. Latest: ${title}`
              : `Resume "${title}" where you left off.`}
            {savedLabel ? ` Last saved ${savedLabel}.` : ""}
          </div>
        </div>
      </div>

      <div className="wm-shiftHomeDraftReminderActions">
        <button
          type="button"
          className="wm-primarybtn wm-shiftHomeDraftReminderResume"
          onClick={resumeDraft}
        >
          Resume Draft
        </button>
        <button type="button" className="wm-shiftHomeDraftReminderDiscard" onClick={discardDraft}>
          Discard
        </button>
      </div>
    </section>
  );
}
