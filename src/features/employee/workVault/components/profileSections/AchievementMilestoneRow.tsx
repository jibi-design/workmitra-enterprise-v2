// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AchievementMilestoneRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\AchievementMilestoneRow.tsx

import type { VaultAchievement } from "../../types/vaultProfileTypes";
import { AchievementMilestoneIcon } from "./AchievementMilestoneIcon";
import { ACHIEVEMENT_TONES } from "./achievementsMilestoneConfig";

function getStatusLabel(achievement: VaultAchievement): "Earned" | "Next goal" | "Locked" {
  if (achievement.displayState === "latest_earned") return "Earned";
  if (achievement.displayState === "next_goal") return "Next goal";
  return "Locked";
}

export function AchievementMilestoneRow({ achievement }: { achievement: VaultAchievement }) {
  const status = getStatusLabel(achievement);
  const toneConfig = ACHIEVEMENT_TONES[achievement.group];
  const isEarned = achievement.displayState === "latest_earned";

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: "var(--wm-radius-chip)",
        background: isEarned ? toneConfig.strongBg : "rgba(248,250,252,0.78)",
        border: isEarned ? `1px solid ${toneConfig.border}` : "1px solid rgba(148,163,184,0.15)",
        opacity: isEarned ? 1 : 0.86,
        boxShadow: isEarned ? "0 8px 18px rgba(15,23,42,0.045)" : "none",
        overflow: "hidden",
      }}
    >
      {isEarned && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 10,
            bottom: 10,
            width: 3,
            borderRadius: "0 999px 999px 0",
            background: toneConfig.accent,
          }}
        />
      )}

      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "var(--wm-radius-chip)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isEarned ? toneConfig.softBg : "rgba(148,163,184,0.08)",
          border: isEarned ? `1px solid ${toneConfig.border}` : "1px solid rgba(148,163,184,0.14)",
          color: isEarned ? toneConfig.text : "var(--wm-emp-muted)",
          boxShadow: isEarned ? `0 8px 18px ${toneConfig.border}` : "none",
        }}
      >
        <AchievementMilestoneIcon group={achievement.group} icon={achievement.icon} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.3,
            fontWeight: 950,
            color: isEarned ? "var(--wm-emp-text)" : "var(--wm-emp-muted)",
            lineHeight: 1.25,
          }}
        >
          {achievement.title}
        </div>

        <div
          style={{
            marginTop: 2,
            fontSize: 10.4,
            color: "var(--wm-emp-muted)",
            lineHeight: 1.38,
            fontWeight: 650,
          }}
        >
          {achievement.description}
        </div>
      </div>

      <span
        style={{
          fontSize: 9.8,
          fontWeight: 900,
          padding: "3px 7px",
          borderRadius: "var(--wm-radius-pill)",
          background: isEarned ? toneConfig.softBg : "rgba(148,163,184,0.08)",
          color: isEarned ? toneConfig.text : "var(--wm-emp-muted)",
          border: isEarned ? `1px solid ${toneConfig.border}` : "1px solid rgba(148,163,184,0.14)",
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </span>
    </div>
  );
}
