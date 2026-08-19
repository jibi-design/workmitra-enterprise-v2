/** Job Mitra | ShiftOpsControlCenterPage.tsx | Ops CC — primitives aligned (Step 4) */

import { useSyncExternalStore } from "react";
import { Radio } from "lucide-react";
import { DomainHero } from "../../../shared/components/layout/DomainHero";
import { ActiveShiftWorkspacesStrip } from "../../employee/shiftJobs/components/ActiveShiftWorkspacesStrip";
import { ShiftAvailabilityBroadcastCard } from "../../employee/shiftJobs/components/ShiftAvailabilityBroadcastCard";
import { availabilityStorage } from "../../employee/shiftJobs/storage/availabilityStorage";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";
import { hasPendingGroupJoin } from "../helpers/groupJoinDeepLink";
import { PendingGroupJoinBanner } from "../components/PendingGroupJoinBanner";
import { ShiftOpsGroupsSection } from "../components/ShiftOpsGroupsSection";

export function ShiftOpsControlCenterPage() {
  const pendingJoin = hasPendingGroupJoin();

  const selectedDates = useSyncExternalStore(
    (cb) => availabilityStorage.subscribe(cb),
    () => availabilityStorage.getMySelectedDates(),
    () => availabilityStorage.getMySelectedDates(),
  );

  function handleToggleDay(iso: string) {
    const profile = employeeProfileStorage.get();
    availabilityStorage.toggleMyDate(iso, {
      workerMlId: profile.uniqueId || `anon_${Date.now()}`,
      workerName: profile.fullName.trim() || "Worker",
      city: profile.city.trim() || undefined,
      basePincode: profile.basePincode,
      commuteRadius: profile.commuteRadius,
    });
  }

  return (
    <div
      className="wm-ee-vShift wm-stackGrid"
      data-testid="shift-ops-control-center-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <DomainHero
        variant="shift"
        audience="employee"
        icon={<Radio size={22} strokeWidth={2.25} />}
        title="Shift Ops Control Center"
        subtitle="Live shifts, groups, and availability"
        description="Manage active workspaces, join site groups, and set when you can work. Shift discovery lives under Shift Jobs Home."
        trailing={<span className="wm-domainHeroBadge">Field ops</span>}
      />

      {pendingJoin ? (
        <div className="wm-animateIn" style={{ animationDelay: "40ms" }}>
          <PendingGroupJoinBanner />
        </div>
      ) : null}

      <div className="wm-animateIn" style={{ animationDelay: "60ms" }}>
        <ActiveShiftWorkspacesStrip />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "100ms" }}>
        <ShiftOpsGroupsSection />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "140ms" }}>
        <ShiftAvailabilityBroadcastCard
          selectedDates={selectedDates}
          onToggleDay={handleToggleDay}
        />
      </div>
    </div>
  );
}
