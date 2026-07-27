// App name: Job Mitra | ShiftPostNotFound.tsx — EnterpriseEmpty (post-details polish)

import { EnterpriseEmpty } from "../../../../shared/components/enterprise";

type ShiftPostNotFoundProps = {
  onFindShifts: () => void;
};

export function ShiftPostNotFound({ onFindShifts }: ShiftPostNotFoundProps) {
  return (
    <div className="wm-ee-vShift wm-stackGrid" data-testid="shift-post-not-found">
      <EnterpriseEmpty
        domain="shift"
        title="This shift is no longer available"
        subtitle="The post may have been removed, filled, or expired. Browse open shifts to continue."
        primaryLabel="Find Shifts"
        onPrimary={onFindShifts}
        testId="shift-post-missing"
      />
    </div>
  );
}
