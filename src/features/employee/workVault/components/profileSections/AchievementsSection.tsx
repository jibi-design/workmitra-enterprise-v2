// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AchievementsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\AchievementsSection.tsx

import type { VaultSectionData } from "../../services/vaultDataAggregator";
import type { VaultAchievement } from "../../types/vaultProfileTypes";
import { AchievementMilestoneRow } from "./AchievementMilestoneRow";
import {
  ACHIEVEMENT_TONES,
  MILESTONE_GROUPS,
  type MilestoneGroup,
} from "./achievementsMilestoneConfig";
import { SectionCard } from "./VaultProfileSharedUi";

function visibleGroupAchievements(achievements: VaultAchievement[]): VaultAchievement[] {
  const earned = achievements
    .filter((achievement) => achievement.displayState === "latest_earned")
    .slice(0, 1);
  const next = achievements
    .filter((achievement) => achievement.displayState === "next_goal")
    .slice(0, 2);

  return [...earned, ...next];
}

function groupStatusText(achievements: VaultAchievement[]): string {
  const nextGoals = achievements.filter(
    (achievement) => achievement.displayState === "next_goal",
  ).length;

  return nextGoals > 0 ? `${nextGoals} goals` : "Complete";
}

function GroupHeader({
  group,
  achievements,
}: {
  group: MilestoneGroup;
  achievements: VaultAchievement[];
}) {
  const tone = ACHIEVEMENT_TONES[group.tone];

  return (
    <div
      style={{
        marginBottom: 7,
        padding: "9px 10px",
        borderRadius: 15,
        border: `1px solid ${tone.border}`,
        background: `linear-gradient(135deg, rgba(255,255,255,1), ${tone.softBg})`,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}
      >
        <div style={{ fontSize: 12.2, fontWeight: 1000, color: tone.text }}>{group.title}</div>

        <span
          style={{
            flexShrink: 0,
            padding: "4px 8px",
            borderRadius: 999,
            background: tone.softBg,
            border: `1px solid ${tone.border}`,
            color: tone.text,
            fontSize: 10,
            fontWeight: 950,
          }}
        >
          {groupStatusText(achievements)}
        </span>
      </div>
    </div>
  );
}

export function AchievementsSection({ data }: { data: VaultSectionData["achievements"] }) {
  const latestEarnedCount = data.filter(
    (achievement) => achievement.displayState === "latest_earned",
  ).length;
  const nextGoalCount = data.filter(
    (achievement) => achievement.displayState === "next_goal",
  ).length;

  return (
    <SectionCard>
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            padding: "12px",
            borderRadius: 17,
            border: "1px solid rgba(124,58,237,0.18)",
            background:
              "radial-gradient(circle at 96% 0%, rgba(124,58,237,0.10), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.96) 58%, rgba(245,243,255,0.64))",
            boxShadow: "0 12px 28px rgba(15,23,42,0.055)",
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 1000, color: "var(--wm-emp-text)" }}>
            Achievements & Growth Milestones
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "var(--wm-emp-muted)",
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            Track earned milestones and next goals across shift, career, reputation, and profile
            growth.
          </div>

          <div
            style={{ marginTop: 7, fontSize: 10.7, color: "var(--wm-emp-muted)", fontWeight: 800 }}
          >
            {latestEarnedCount} earned · {nextGoalCount} next goals
          </div>
        </div>

        {MILESTONE_GROUPS.map((group) => {
          const groupAchievements = data.filter((achievement) => achievement.group === group.tone);
          const visibleAchievements = visibleGroupAchievements(groupAchievements);

          if (visibleAchievements.length === 0) return null;

          return (
            <div key={group.title}>
              <GroupHeader group={group} achievements={visibleAchievements} />

              <div style={{ display: "grid", gap: 7 }}>
                {visibleAchievements.map((achievement) => (
                  <AchievementMilestoneRow key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
