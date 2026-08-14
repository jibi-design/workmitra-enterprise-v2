/** DomainCard — Wave 1 Design DNA: glass card + domain accent modifier */

import { HomeGlassCardShell, type HomeGlassCardShellProps } from "./HomeGlassCardShell";

export type DomainCardDomain = "shift" | "career" | "diary" | "planner" | "vault" | "dashboard";

export type DomainCardProps = Omit<HomeGlassCardShellProps, "className"> & {
  readonly domain: DomainCardDomain;
  readonly className?: string;
};

const DOMAIN_CLASS: Record<DomainCardDomain, string> = {
  shift: "wm-homeGlassCard--domainShift",
  career: "wm-homeGlassCard--domainCareer",
  diary: "wm-homeGlassCard--domainDiary",
  planner: "wm-homeGlassCard--domainPlanner",
  vault: "wm-homeGlassCard--domainVault",
  dashboard: "wm-homeGlassCard--domainDashboard",
};

export function DomainCard({ domain, className, ...rest }: DomainCardProps) {
  const classes = [DOMAIN_CLASS[domain], className ?? ""].filter(Boolean).join(" ");
  return <HomeGlassCardShell className={classes} {...rest} />;
}
