// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CareerEmployerFeedbackPendingCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\feedback\CareerEmployerFeedbackPendingCard.tsx

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  careerEmployerFeedbackStorage,
  type CareerEmployerFeedbackHomeSnapshot,
} from "../../../../../shared/employmentFeedback/careerEmployerFeedback.storage";
import { employmentLifecycleStorage } from "../../../employment/storage/employmentLifecycle.storage";
import { IconBriefcase } from "../../../home/components/employeeHomeIcons";

function parseCareerEmployerFeedbackHomeSnapshot(raw: string): CareerEmployerFeedbackHomeSnapshot {
  try {
    const parsed = JSON.parse(raw) as CareerEmployerFeedbackHomeSnapshot;

    return {
      pendingCount: Number(parsed.pendingCount) || 0,
      latestTask: parsed.latestTask ?? null,
    };
  } catch {
    return {
      pendingCount: 0,
      latestTask: null,
    };
  }
}

export function CareerEmployerFeedbackPendingCard() {
  const nav = useNavigate();
  const [hideNoticeVisible, setHideNoticeVisible] = useState(false);

  const subscribe = useCallback((callback: () => void) => {
    const unsubscribeEmployment = employmentLifecycleStorage.subscribe(callback);
    const unsubscribeFeedback = careerEmployerFeedbackStorage.subscribe(callback);

    return () => {
      unsubscribeEmployment();
      unsubscribeFeedback();
    };
  }, []);

  const getSnapshot = useCallback(
    () => careerEmployerFeedbackStorage.getHomeSnapshot(employmentLifecycleStorage.getAll()),
    [],
  );

  useEffect(() => {
    careerEmployerFeedbackStorage.syncPendingTasksForRecords(employmentLifecycleStorage.getAll());
  }, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const snapshot = useMemo(() => parseCareerEmployerFeedbackHomeSnapshot(raw), [raw]);
  const task = snapshot.latestTask;

  useEffect(() => {
    if (!hideNoticeVisible || !task) return undefined;

    const timer = window.setTimeout(() => {
      careerEmployerFeedbackStorage.dismissHome(task.employmentId);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [hideNoticeVisible, task]);

  const handleGiveFeedback = useCallback(() => {
    if (!task) return;
    nav(ROUTE_PATHS.employeeEmploymentDetail.replace(":employmentId", task.employmentId));
  }, [nav, task]);

  const handleRemindLater = useCallback(() => {
    if (!task) return;
    careerEmployerFeedbackStorage.remindLater(task.employmentId);
  }, [task]);

  const handleHideFromHome = useCallback(() => {
    if (!task) return;
    setHideNoticeVisible(true);
  }, [task]);

  if (snapshot.pendingCount <= 0 || !task) return null;

  if (hideNoticeVisible) {
    return (
      <section className="wm-ee-card wm-ee-accentCard wm-ee-vCareer" style={{ marginTop: 12 }}>
        <div style={HIDE_NOTICE_STYLE}>
          Hidden from Home. You can still give feedback from your completed Career employment
          record.
        </div>
      </section>
    );
  }

  return (
    <section className="wm-ee-card wm-ee-accentCard wm-ee-vCareer" style={{ marginTop: 12 }}>
      <div className="wm-ee-headTint">
        <div className="wm-ee-cardHead" style={{ alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div className="wm-ee-titleRow">
              <span className="wm-ee-domainIcon" aria-hidden="true">
                <IconBriefcase />
              </span>

              <div style={{ minWidth: 0 }}>
                <div className="wm-ee-cardTitle">Employer Feedback Pending</div>
                <div className="wm-ee-cardSub">Share feedback for completed work.</div>
              </div>
            </div>
          </div>

          <span style={COUNT_BADGE_STYLE}>{snapshot.pendingCount}</span>
        </div>
      </div>

      <div style={META_STYLE}>{[task.jobTitle, task.companyName].filter(Boolean).join(" · ")}</div>

      <div style={ACTION_ROW_STYLE}>
        <button type="button" onClick={handleGiveFeedback} style={BUTTON_STYLE}>
          Give
        </button>

        <button type="button" onClick={handleRemindLater} style={BUTTON_STYLE}>
          Later
        </button>

        <button type="button" onClick={handleHideFromHome} style={SECONDARY_BUTTON_STYLE}>
          Hide from Home
        </button>
      </div>
    </section>
  );
}

const COUNT_BADGE_STYLE: CSSProperties = {
  minWidth: 24,
  height: 24,
  borderRadius: "var(--wm-radius-pill)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(29,78,216,0.08)",
  border: "1px solid rgba(29,78,216,0.18)",
  color: "var(--wm-career-accent, #1d4ed8)",
  fontSize: 11,
  fontWeight: 950,
  flexShrink: 0,
};

const META_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "0 14px",
  fontSize: 11.6,
  color: "var(--wm-ee-muted, var(--wm-er-muted, #64748b))",
  fontWeight: 750,
};

const ACTION_ROW_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "0 14px 14px",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 7,
};

const BUTTON_STYLE: CSSProperties = {
  padding: "9px 8px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid rgba(29,78,216,0.16)",
  background: "rgba(29,78,216,0.06)",
  color: "var(--wm-career-accent, #1d4ed8)",
  fontSize: 11.8,
  fontWeight: 850,
  cursor: "pointer",
};

const SECONDARY_BUTTON_STYLE: CSSProperties = {
  ...BUTTON_STYLE,
  color: "var(--wm-ee-muted, var(--wm-er-muted, #64748b))",
};

const HIDE_NOTICE_STYLE: CSSProperties = {
  padding: "13px 14px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(29,78,216,0.06)",
  border: "1px solid rgba(29,78,216,0.14)",
  color: "var(--wm-career-accent, #1d4ed8)",
  fontSize: 11.8,
  fontWeight: 850,
  lineHeight: 1.45,
};
