/** Employer dashboard — Utilities action tile. */

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

type Props = {
  readonly title: string;
  readonly sub: string;
  readonly icon: LucideIcon;
  readonly testId: string;
  readonly onClick: () => void;
};

export function EmployerUtilityActionTile({
  title,
  sub,
  icon: Icon,
  testId,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className="wm-press-card wm-dashWidget wm-erDashActionTile"
      data-testid={testId}
      onClick={onClick}
    >
      <span className="wm-erDashActionTile__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <span className="wm-erDashActionTile__copy">
        <span className="wm-erDashActionTile__title">{title}</span>
        <span className="wm-erDashActionTile__sub">{sub}</span>
      </span>
      <ChevronRight className="wm-erDashActionTile__chevron" size={16} aria-hidden="true" />
    </button>
  );
}
