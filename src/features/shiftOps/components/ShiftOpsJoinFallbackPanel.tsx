/** Job Mitra | ShiftOpsJoinFallbackPanel.tsx | GJ-4 terminal / soft join error UI */

import { EnterpriseEmpty } from "../../../shared/components/enterprise/EnterpriseEmpty";
import type { GroupJoinErrorInfo } from "../helpers/groupJoinErrors";

type Props = {
  info: GroupJoinErrorInfo;
  onRetry?: () => void;
};

export function ShiftOpsJoinFallbackPanel({ info, onRetry }: Props) {
  return (
    <div data-testid="shift-ops-join-fallback" style={{ maxWidth: 480 }}>
      <EnterpriseEmpty
        domain="shift"
        title={info.title}
        subtitle={info.message}
        testId={`shift-ops-join-error-${info.code}`}
        primaryLabel={onRetry ? (info.terminal ? "Start over" : "Try again") : undefined}
        onPrimary={onRetry}
      />
    </div>
  );
}
