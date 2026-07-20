// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeDomainSections.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeDomainSections.tsx

import type { AdminHomeData } from "./AdminHomeSharedUi";
import { DomainCard, M, Sec } from "./AdminHomeSharedUi";

type Props = {
  data: AdminHomeData;
};

export function AdminHomeDomainSections({ data }: Props) {
  return (
    <>
      <Sec label="Domain Health" />

      <DomainCard
        title="Shift Jobs"
        tag="TEMPORARY"
        accent="var(--wm-ad-shift)"
        dimBg="var(--wm-ad-shift-dim)"
        borderColor="var(--wm-ad-shift-border)"
      >
        <div className="wm-ad-domainGrid">
          <M label="Posts" value={data.shiftTotal} color="var(--wm-ad-shift)" />
          <M label="Active" value={data.shiftActive} color="var(--wm-ad-shift)" />
          <M label="Done" value={data.shiftCompleted} color="var(--wm-ad-shift)" />
          <M label="Applied" value={data.shiftAppsApplied} color="var(--wm-ad-shift)" />
          <M label="Selected" value={data.shiftShortlisted} color="var(--wm-ad-shift)" />
          <M label="Confirmed" value={data.shiftConfirmed} color="var(--wm-ad-shift)" />
          <M label="Groups" value={data.shiftWorkspacesActive} color="var(--wm-ad-shift)" />
          <M label="Fill Rate" value={data.shiftFillRate} color="var(--wm-ad-shift)" suffix="%" />
        </div>
      </DomainCard>

      <DomainCard
        title="Career Jobs"
        tag="PERMANENT"
        accent="var(--wm-ad-career)"
        dimBg="var(--wm-ad-career-dim)"
        borderColor="var(--wm-ad-career-border)"
        tagColor="var(--wm-ad-career-light)"
      >
        <div className="wm-ad-domainGrid">
          <M label="Posts" value={data.careerTotal} color="var(--wm-ad-career)" />
          <M label="Active" value={data.careerActive} color="var(--wm-ad-career)" />
          <M label="Paused" value={data.careerPaused} color="var(--wm-ad-career)" />
          <M label="Applied" value={data.careerAppsApplied} color="var(--wm-ad-career)" />
          <M label="Selected" value={data.careerShortlisted} color="var(--wm-ad-career)" />
          <M label="Interview" value={data.careerInterview} color="var(--wm-ad-career)" />
          <M label="Offered" value={data.careerOffered} color="var(--wm-ad-career)" />
          <M label="Hired" value={data.careerHired} color="var(--wm-ad-career)" />
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <div style={{ flex: "1 1 0", maxWidth: "calc(25% - 6px)" }}>
            <M label="Rejected" value={data.careerRejected} color="var(--wm-ad-career)" />
          </div>

          <div style={{ flex: "1 1 0", maxWidth: "calc(25% - 6px)" }}>
            <M
              label="Conversion"
              value={data.careerConversion}
              color="var(--wm-ad-green)"
              suffix="%"
            />
          </div>
        </div>
      </DomainCard>

      <DomainCard
        title="Operations Hub"
        tag="OPERATIONS"
        accent="var(--wm-ad-workforce)"
        dimBg="var(--wm-ad-workforce-dim)"
        borderColor="var(--wm-ad-workforce-border)"
      >
        <div className="wm-ad-domainGrid">
          <M label="Staff" value={data.wfStaffActive} color="var(--wm-ad-workforce)" />
          <M label="Open" value={data.wfAnnOpen} color="var(--wm-ad-workforce)" />
          <M label="Confirmed" value={data.wfAnnConfirmed} color="var(--wm-ad-workforce)" />
          <M label="Groups" value={data.wfGroupsActive} color="var(--wm-ad-workforce)" />
          <M label="Attendance" value={data.wfAttendanceTotal} color="var(--wm-ad-workforce)" />
        </div>
      </DomainCard>
    </>
  );
}
