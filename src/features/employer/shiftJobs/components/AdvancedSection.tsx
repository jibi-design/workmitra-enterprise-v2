// src/features/employer/shiftJobs/components/AdvancedSection.tsx

import { useState } from "react";
import type {
  EmployerShiftActivityEntry,
  ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";
import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import { fmtTime } from "../helpers/dashboardHelpers";

type Props = {
  post: ShiftPost;
  activity: EmployerShiftActivityEntry[];
  isAnalyzed: boolean;
  onAnalyze: () => void;
  onReset: () => void;
};

export function AdvancedSection({ post, activity, isAnalyzed, onAnalyze, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const p = post;

  return (
    <div className="wm-er-card wm-shiftAdvancedSection">
      <div className="wm-shiftAdvancedHeader">
        <div className="wm-shiftAdvancedTitle">Advanced</div>

        <button
          className="wm-outlineBtn wm-shiftAdvancedToggleBtn"
          type="button"
          onClick={() => setOpen((state) => !state)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <div className="wm-shiftAdvancedBody">
          <div className="wm-er-card wm-shiftAdvancedInnerCard">
            <div className="wm-shiftAdvancedInnerTitle">Activity Log ({activity.length})</div>

            <div className="wm-shiftAdvancedActivityList">
              {activity.length === 0 && (
                <div className="wm-shiftAdvancedEmptyText">No activity yet.</div>
              )}

              {activity.map((entry) => (
                <div key={entry.id} className="wm-shiftAdvancedActivityItem">
                  <div className="wm-shiftAdvancedActivityTitle">{entry.title}</div>

                  {entry.body && <div className="wm-shiftAdvancedActivityBody">{entry.body}</div>}

                  <div className="wm-shiftAdvancedActivityTime">{fmtTime(entry.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="wm-er-card wm-er-accentCard wm-er-vShift wm-shiftAdvancedAnalysisCard">
            <div className="wm-er-headTint">
              <div className="wm-shiftAdvancedAnalysisHead">
                <div className="wm-shiftAdvancedAnalysisTitle">Analysis</div>

                <div className="wm-shiftAdvancedAnalysisMeta">
                  {p.analyzedAt ? `Last: ${fmtTime(p.analyzedAt)}` : "Not analyzed"}
                </div>
              </div>

              <div className="wm-shiftAdvancedAnalysisActions">
                <button
                  className="wm-outlineBtn"
                  type="button"
                  onClick={() => employerShiftStorage.setHidden(p.id, !p.isHiddenFromSearch)}
                >
                  {p.isHiddenFromSearch ? "Show in search" : "Hide from search"}
                </button>

                <button
                  className="wm-primarybtn wm-shiftAdvancedPrimaryBtn"
                  type="button"
                  onClick={onAnalyze}
                  disabled={isAnalyzed}
                >
                  {isAnalyzed ? "Analyzed" : "Find Best Candidates"}
                </button>

                <button
                  className="wm-outlineBtn wm-shiftAdvancedResetBtn"
                  type="button"
                  onClick={onReset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
