// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeSharedUi.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeSharedUi.tsx

import type { ReactNode } from "react";

export type AdminHomeActivityItem = {
  id: string;
  domain: "shift" | "career";
  kind: string;
  title: string;
  body?: string;
  createdAt: number;
};

export type AdminHomeData = {
  employers: number;
  employees: number;
  shiftTotal: number;
  shiftActive: number;
  shiftCompleted: number;
  shiftCancelled: number;
  shiftAppsApplied: number;
  shiftShortlisted: number;
  shiftConfirmed: number;
  shiftRejected: number;
  shiftWorkspacesActive: number;
  shiftFillRate: number;
  careerTotal: number;
  careerActive: number;
  careerPaused: number;
  careerClosed: number;
  careerAppsApplied: number;
  careerShortlisted: number;
  careerInterview: number;
  careerOffered: number;
  careerHired: number;
  careerRejected: number;
  careerWorkspacesActive: number;
  careerConversion: number;
  activity: AdminHomeActivityItem[];
  totalEvents: number;
  storageBytes: number;
  storageKeys: number;
  lastActivityTs: number;
  wfStaffActive: number;
  wfAnnOpen: number;
  wfAnnConfirmed: number;
  wfGroupsActive: number;
  wfAttendanceTotal: number;
};

export function Sec({ label }: { label: string }) {
  return (
    <div className="wm-ad-secHead">
      <span className="wm-ad-secLabel">{label}</span>
      <div className="wm-ad-secLine" />
    </div>
  );
}

export function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="wm-ad-kpiTile">
      <div className="wm-ad-kpiValue" style={{ color }} data-zero={value === 0}>
        {value}
      </div>
      <div className="wm-ad-kpiLabel">{label}</div>
    </div>
  );
}

export function DomainCard({
  title,
  tag,
  accent,
  dimBg,
  borderColor,
  tagColor,
  children,
}: {
  title: string;
  tag: string;
  accent: string;
  dimBg: string;
  borderColor: string;
  tagColor?: string;
  children: ReactNode;
}) {
  return (
    <div className="wm-ad-domainCard">
      <div className="wm-ad-domainBar" style={{ background: accent }} />
      <div className="wm-ad-domainHead">
        <div className="wm-ad-domainTitle" style={{ color: accent }}>
          {title}
        </div>
        <div
          className="wm-ad-domainTag"
          style={{
            background: dimBg,
            color: tagColor ?? accent,
            border: `1px solid ${borderColor}`,
          }}
        >
          {tag}
        </div>
      </div>
      {children}
    </div>
  );
}

export function M({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="wm-ad-metricCell">
      <div className="wm-ad-metricVal" style={{ color }} data-zero={value === 0}>
        {value}
        {suffix ?? ""}
      </div>
      <div className="wm-ad-metricLabel">{label}</div>
    </div>
  );
}
