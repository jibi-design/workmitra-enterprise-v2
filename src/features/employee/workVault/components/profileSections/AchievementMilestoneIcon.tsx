// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AchievementMilestoneIcon.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\AchievementMilestoneIcon.tsx

import type { AchievementGroup } from "../../types/vaultProfileTypes";

type IconPathProps = {
  fill: "none";
  stroke: "currentColor";
  strokeWidth: number;
  strokeLinecap: "round";
  strokeLinejoin: "round";
};

const common: IconPathProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconShell({ children }: { children: React.ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function AchievementMilestoneIcon({
  group,
  icon,
}: {
  group: AchievementGroup;
  icon: string;
}) {
  if (icon === "shift" || group === "shift") {
    return (
      <IconShell>
        <path {...common} d="M8 7h8M9 3h6l1 4H8l1-4Z" />
        <path {...common} d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Z" />
        <path {...common} d="M9 12h6M9 16h4" />
      </IconShell>
    );
  }

  if (icon === "career" || group === "career") {
    return (
      <IconShell>
        <path {...common} d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path {...common} d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
        <path {...common} d="M9 13h6" />
      </IconShell>
    );
  }

  if (icon === "star") {
    return (
      <IconShell>
        <path
          {...common}
          d="M12 3 14.4 8l5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 18l.9-5.4-3.9-3.8 5.4-.8L12 3Z"
        />
      </IconShell>
    );
  }

  if (icon === "review" || group === "reputation") {
    return (
      <IconShell>
        <path {...common} d="M5 4h14v11H8l-3 3V4Z" />
        <path {...common} d="m9 10 2 2 4-5" />
      </IconShell>
    );
  }

  return (
    <IconShell>
      <path {...common} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path {...common} d="M4 21a8 8 0 0 1 16 0" />
      <path {...common} d="m15.5 15.5 1.4 1.4 3-3.2" />
    </IconShell>
  );
}
