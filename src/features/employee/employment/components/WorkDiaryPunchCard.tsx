// App name: Job Mitra
// File name: WorkDiaryPunchCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\WorkDiaryPunchCard.tsx

import { useMemo, useSyncExternalStore } from "react";
import type { WorkDiaryEntry } from "../helpers/workDiary.types";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { workDiaryStorage } from "../storage/workDiary.storage";

type Props = {
  employmentId: string;
  jobTitle: string;
  companyName: string;
  activeEmployments: EmploymentRecord[];
};

type PunchSnapshot = {
  activePunch: WorkDiaryEntry | null;
  otherActivePunch: WorkDiaryEntry | null;
};

const CONSOLE_BLUE = "var(--wm-er-accent-console, #0369a1)";
const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";
const DANGER = "#dc2626";

function readPunchSnapshot(raw: string): PunchSnapshot {
  try {
    const parsed = JSON.parse(raw) as PunchSnapshot;

    return {
      activePunch: parsed.activePunch ?? null,
      otherActivePunch: parsed.otherActivePunch ?? null,
    };
  } catch {
    return { activePunch: null, otherActivePunch: null };
  }
}

export function WorkDiaryPunchCard({
  employmentId,
  jobTitle,
  companyName,
  activeEmployments,
}: Props) {
  const rawSnapshot = useSyncExternalStore(
    workDiaryStorage.subscribe,
    () =>
      JSON.stringify({
        activePunch: workDiaryStorage.getActivePunch(employmentId),
        otherActivePunch: workDiaryStorage.getActivePunchForOtherEmployment(employmentId),
      }),
    () => JSON.stringify({ activePunch: null, otherActivePunch: null }),
  );

  const { activePunch, otherActivePunch } = useMemo(
    () => readPunchSnapshot(rawSnapshot),
    [rawSnapshot],
  );
  const isBlockedByOtherJob = !activePunch && !!otherActivePunch;

  const otherActiveEmployment = useMemo(() => {
    if (!otherActivePunch) return null;
    return activeEmployments.find((record) => record.id === otherActivePunch.employmentId) ?? null;
  }, [activeEmployments, otherActivePunch]);

  const handlePunchIn = () => {
    if (isBlockedByOtherJob) return;
    workDiaryStorage.punchIn(employmentId);
  };

  const handlePunchOut = () => {
    workDiaryStorage.punchOut(employmentId);
  };

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 20,
        border: isBlockedByOtherJob
          ? "1px solid rgba(220,38,38,0.18)"
          : "1px solid rgba(3,105,161,0.13)",
        background: isBlockedByOtherJob
          ? "linear-gradient(135deg, rgba(255,255,255,1), rgba(254,242,242,0.86))"
          : "radial-gradient(circle at 96% 0%, rgba(3,105,161,0.09), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(240,249,255,0.72))",
        boxShadow: "0 12px 26px rgba(15,23,42,0.055)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 950, fontSize: 13.5, color: TEXT }}>
            {activePunch ? "Working Now" : "Today Status"}
          </div>

          <div
            style={{
              fontSize: 12,
              color: isBlockedByOtherJob ? DANGER : MUTED,
              marginTop: 4,
              lineHeight: 1.45,
            }}
          >
            {activePunch && activePunch.punchInTime
              ? `Started at ${activePunch.punchInTime}`
              : isBlockedByOtherJob
                ? "End the other active work before starting here."
                : "Ready to start your personal work diary."}
          </div>

          {isBlockedByOtherJob && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 10px",
                borderRadius: 12,
                background: "rgba(220,38,38,0.07)",
                border: "1px solid rgba(220,38,38,0.14)",
                color: DANGER,
                fontSize: 11.5,
                fontWeight: 900,
                lineHeight: 1.45,
              }}
            >
              <span style={{ display: "block" }}>Work already started for:</span>
              <span style={{ display: "block", color: TEXT, marginTop: 2 }}>
                {otherActiveEmployment
                  ? `${otherActiveEmployment.jobTitle} at ${otherActiveEmployment.companyName}`
                  : "another current job"}
              </span>
            </div>
          )}

          <div
            style={{
              marginTop: 10,
              position: "relative",
              overflow: "hidden",
              padding: "10px 12px 10px 14px",
              borderRadius: 15,
              background: "linear-gradient(135deg, rgba(225,245,255,0.95), rgba(255,255,255,0.96))",
              border: "1px solid rgba(3,105,161,0.18)",
              color: TEXT,
              lineHeight: 1.4,
              boxShadow: "0 8px 18px rgba(3,105,161,0.08)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: CONSOLE_BLUE,
              }}
            />

            <span
              style={{
                display: "inline-flex",
                marginBottom: 5,
                padding: "3px 8px",
                borderRadius: 999,
                background: "rgba(3,105,161,0.1)",
                color: CONSOLE_BLUE,
                fontSize: 10.5,
                fontWeight: 950,
              }}
            >
              Current work diary
            </span>

            <span style={{ display: "block", fontSize: 12.5, fontWeight: 950 }}>{jobTitle}</span>

            <span
              style={{
                display: "block",
                color: MUTED,
                marginTop: 2,
                fontSize: 11.5,
                fontWeight: 800,
              }}
            >
              {companyName}
            </span>
          </div>
        </div>

        {activePunch ? (
          <button
            type="button"
            onClick={handlePunchOut}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 12,
              border: "1px solid rgba(220,38,38,0.22)",
              background: "rgba(220,38,38,0.08)",
              color: DANGER,
              whiteSpace: "nowrap",
              fontSize: 13,
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            End Work
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePunchIn}
            disabled={isBlockedByOtherJob}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 12,
              border: "none",
              background: isBlockedByOtherJob ? "rgba(148,163,184,0.45)" : CONSOLE_BLUE,
              color: "#ffffff",
              whiteSpace: "nowrap",
              fontSize: 13,
              fontWeight: 950,
              cursor: isBlockedByOtherJob ? "not-allowed" : "pointer",
              boxShadow: isBlockedByOtherJob ? "none" : "0 10px 22px rgba(3,105,161,0.18)",
            }}
          >
            Start Work
          </button>
        )}
      </div>
    </div>
  );
}
