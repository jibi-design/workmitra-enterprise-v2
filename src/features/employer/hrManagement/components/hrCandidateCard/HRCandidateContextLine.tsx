// App: Job Mitra / WorkMitra_Enterprise_v2
// File: HRCandidateContextLine.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrCandidateCard\HRCandidateContextLine.tsx

import { useState } from "react";
import type { HRCandidateRecord } from "../../types/hrManagement.types";
import { daysFromNow, formatDuration, formatShortDate } from "./hrCandidateCardUtils";

type Props = {
  record: HRCandidateRecord;
};

export function HRCandidateContextLine({ record }: Props) {
  const [nowMs] = useState(() => Date.now());

  if (record.status === "active") {
    if (record.employmentPhase === "probation" && record.probationEndDate) {
      const daysLeft = daysFromNow(record.probationEndDate);
      const isUrgent = daysLeft <= 14;

      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
            Joined {formatShortDate(record.movedToHRAt)}
          </span>

          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: isUrgent ? "#dc2626" : "#b45309",
            }}
          >
            Probation — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </span>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
          Joined {formatShortDate(record.movedToHRAt)}
        </span>

        <span style={{ fontSize: 10, fontWeight: 800, color: "#15803d" }}>Confirmed</span>
      </div>
    );
  }

  if (record.status === "onboarding" && record.onboarding) {
    const total = record.onboarding.items.length;
    const done = record.onboarding.items.filter((item) => item.completedAt).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
          Started {formatShortDate(record.onboarding.startedAt)}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 36,
              height: 3,
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                borderRadius: 999,
                background: "#7c3aed",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <span style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed" }}>
            {done}/{total}
          </span>
        </div>
      </div>
    );
  }

  if (record.status === "exit_processing" && record.exitData) {
    const notice = record.exitData.noticePeriod;

    if (notice?.endDate) {
      const daysLeft = daysFromNow(notice.endDate);
      const clearanceItems = record.exitData.clearanceItems ?? [];
      const clearanceDone = clearanceItems.filter(
        (item: { completedAt?: number }) => item.completedAt,
      ).length;
      const clearanceTotal = clearanceItems.length;

      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>
            Notice: {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </span>

          {clearanceTotal > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 3,
                  borderRadius: 999,
                  background: "rgba(15, 23, 42, 0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width:
                      clearanceTotal > 0
                        ? `${Math.round((clearanceDone / clearanceTotal) * 100)}%`
                        : "0%",
                    height: "100%",
                    borderRadius: 999,
                    background: "#dc2626",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              <span style={{ fontSize: 9, fontWeight: 800, color: "#991b1b" }}>
                {clearanceDone}/{clearanceTotal}
              </span>
            </div>
          )}
        </div>
      );
    }
  }

  if (record.status === "offered" && record.offerLetter?.sentAt) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
          Offered {formatDuration(nowMs - record.offerLetter.sentAt)}
        </span>

        <span style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed" }}>Awaiting response</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 4 }}>
      <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
        Moved {formatDuration(nowMs - record.movedToHRAt)}
      </span>
    </div>
  );
}
