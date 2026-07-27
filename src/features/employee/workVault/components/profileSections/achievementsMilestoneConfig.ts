// App: Job Mitra / WorkMitra_Enterprise_v2
// File: achievementsMilestoneConfig.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\achievementsMilestoneConfig.ts

import type { AchievementGroup } from "../../types/vaultProfileTypes";

export type GroupTone = AchievementGroup;

export type MilestoneGroup = {
  title: string;
  tone: GroupTone;
};

export type ToneConfig = {
  accent: string;
  softBg: string;
  strongBg: string;
  border: string;
  text: string;
};

export const ACHIEVEMENT_TONES: Record<GroupTone, ToneConfig> = {
  shift: {
    accent: "#059669",
    softBg: "rgba(5,150,105,0.07)",
    strongBg: "linear-gradient(135deg, rgba(255,255,255,1), rgba(236,253,245,0.92))",
    border: "rgba(5,150,105,0.18)",
    text: "#047857",
  },
  career: {
    accent: "#2563eb",
    softBg: "rgba(37,99,235,0.07)",
    strongBg: "linear-gradient(135deg, rgba(255,255,255,1), rgba(239,246,255,0.94))",
    border: "rgba(37,99,235,0.18)",
    text: "#1d4ed8",
  },
  planner: {
    accent: "#0891b2",
    softBg: "rgba(8,145,178,0.08)",
    strongBg: "linear-gradient(135deg, rgba(255,255,255,1), rgba(236,254,255,0.94))",
    border: "rgba(8,145,178,0.20)",
    text: "#0e7490",
  },
  reputation: {
    accent: "#ca8a04",
    softBg: "rgba(202,138,4,0.08)",
    strongBg: "linear-gradient(135deg, rgba(255,255,255,1), rgba(254,252,232,0.96))",
    border: "rgba(202,138,4,0.20)",
    text: "#854d0e",
  },
  profile: {
    accent: "#7c3aed",
    softBg: "rgba(124,58,237,0.07)",
    strongBg: "linear-gradient(135deg, rgba(255,255,255,1), rgba(245,243,255,0.94))",
    border: "rgba(124,58,237,0.18)",
    text: "#6d28d9",
  },
};

export const MILESTONE_GROUPS: MilestoneGroup[] = [
  { title: "Shift Growth", tone: "shift" },
  { title: "Career Growth", tone: "career" },
  { title: "Planner Growth", tone: "planner" },
  { title: "Reputation Growth", tone: "reputation" },
  { title: "Profile Growth", tone: "profile" },
];
