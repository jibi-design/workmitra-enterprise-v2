/** Candidate Pro Daily OS — compact 4-state body. No extra widgets. */

import type { ReactNode } from "react";
import { EnterpriseEmpty, EnterpriseSkeleton } from "../../../../../shared/components/enterprise";
import type { EnterpriseDomainAccent } from "../../../../../shared/components/enterprise/enterprise.types";
import type { DailyOsViewState } from "../../helpers/dailyOs.viewState.helpers";

type Props = {
  readonly state: DailyOsViewState;
  readonly domain: EnterpriseDomainAccent;
  readonly emptyTitle: string;
  readonly emptySub: string;
  readonly errorText: string | null;
  readonly onRetry: () => void;
  readonly children: ReactNode;
};

export function DailyOsBentoBody({
  state,
  domain,
  emptyTitle,
  emptySub,
  errorText,
  onRetry,
  children,
}: Props) {
  if (state === "loading") {
    return <EnterpriseSkeleton count={1} domain={domain} testId="daily-os-bento-loading" />;
  }

  if (state === "error") {
    return (
      <div className="wm-ent-error wm-dailyOsBento__error" data-testid="daily-os-bento-error">
        <div className="wm-ent-error__title">Could not load</div>
        <div className="wm-ent-error__subtitle">{errorText ?? "Try again."}</div>
        <div className="wm-ent-error__actions">
          <button type="button" className="wm-outlineBtn" onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <EnterpriseEmpty
        title={emptyTitle}
        subtitle={emptySub}
        domain={domain}
        testId="daily-os-bento-empty"
      />
    );
  }

  return <>{children}</>;
}
