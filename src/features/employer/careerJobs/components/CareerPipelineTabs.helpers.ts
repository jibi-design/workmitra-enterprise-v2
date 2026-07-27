export type CareerTab =
  "applied" | "backup" | "shortlisted" | "interview" | "offered" | "hired" | "rejected";

export const PRIMARY_TABS: readonly CareerTab[] = ["applied", "backup", "shortlisted"] as const;
export const SECONDARY_TABS: readonly CareerTab[] = [
  "interview",
  "offered",
  "hired",
  "rejected",
] as const;

export const TAB_LABELS: Record<CareerTab, string> = {
  applied: "Applied",
  backup: "Backup",
  shortlisted: "Shortlist",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export const TAB_HELPERS: Record<CareerTab, string> = {
  applied: "New queue",
  backup: "Reserve list",
  shortlisted: "Next action",
  interview: "Rounds",
  offered: "Offers",
  hired: "Hired",
  rejected: "Closed",
};

export const TAB_ICONS: Record<CareerTab, string> = {
  applied: "📥",
  backup: "📦",
  shortlisted: "⭐",
  interview: "💬",
  offered: "🤝",
  hired: "🎉",
  rejected: "❌",
};

export type CareerPipelineTabsProps = {
  activeTab: CareerTab;
  counts: Record<CareerTab, number>;
  onTabChange: (tab: CareerTab) => void;
};
