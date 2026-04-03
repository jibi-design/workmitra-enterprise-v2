// src/features/employer/workforceOps/pages/WorkforceRouteWrappers.tsx
//
// Router wrapper components for Workforce pages that require props.
// Extracts route params and provides navigation callbacks.

import { useParams, useNavigate } from "react-router-dom";
import { EmployerWorkforceAnnouncementsListPage } from "./EmployerWorkforceAnnouncementsListPage";
import { EmployerWorkforceAnnouncePage } from "./EmployerWorkforceAnnouncePage";
import { EmployerWorkforceAnnounceDashPage } from "./EmployerWorkforceAnnounceDashPage";
import { EmployerWorkforceGroupsPage } from "./EmployerWorkforceGroupsPage";
import { EmployerWorkforceGroupPage } from "./EmployerWorkforceGroupPage";
import { EmployerWorkforceStaffDetailPage } from "./EmployerWorkforceStaffDetailPage";
import { EmployeeWorkforceCompanyPage } from "../../../employee/workforceOps/pages/EmployeeWorkforceCompanyPage";
import { EmployeeWorkforceAnnounceDetailPage } from "../../../employee/workforceOps/pages/EmployeeWorkforceAnnounceDetailPage";
import { EmployeeWorkforceGroupPage } from "../../../employee/workforceOps/pages/EmployeeWorkforceGroupPage";
import { EmployeeWorkforceTimesheetPage } from "../../../employee/workforceOps/pages/EmployeeWorkforceTimesheetPage";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Employer Wrappers                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerAnnouncementsListWrapper() {
  const nav = useNavigate();
  return (
    <EmployerWorkforceAnnouncementsListPage
      onBack={() => nav(-1)}
      onNewAnnouncement={() => nav("/employer/workforce/announce/create")}
      onOpenDashboard={(annId) => nav(`/employer/workforce/announce/${annId}`)}
    />
  );
}

export function EmployerAnnounceCreateWrapper() {
  const nav = useNavigate();
  return (
    <EmployerWorkforceAnnouncePage
      onBack={() => nav(-1)}
      onCreated={() => nav(-1)}
    />
  );
}

export function EmployerAnnounceDashWrapper() {
  const { announcementId } = useParams<{ announcementId: string }>();
  const nav = useNavigate();
  if (!announcementId) return null;
  return (
    <EmployerWorkforceAnnounceDashPage
      announcementId={announcementId}
      onBack={() => nav(-1)}
      onGroupCreated={() => nav(-1)}
    />
  );
}

export function EmployerGroupsWrapper() {
  const nav = useNavigate();
  return (
    <EmployerWorkforceGroupsPage
      onBack={() => nav(-1)}
      onOpenGroup={(groupId) => nav(`/employer/workforce/group/${groupId}`)}
    />
  );
}

export function EmployerGroupDetailWrapper() {
  const { groupId } = useParams<{ groupId: string }>();
  const nav = useNavigate();
  if (!groupId) return null;
  return (
    <EmployerWorkforceGroupPage
      groupId={groupId}
      onBack={() => nav(-1)}
    />
  );
}

export function EmployerStaffDetailWrapper() {
  const { staffId } = useParams<{ staffId: string }>();
  const nav = useNavigate();
  if (!staffId) return null;
  return (
    <EmployerWorkforceStaffDetailPage
      staffId={staffId}
      onBack={() => nav(-1)}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Employee Wrappers                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployeeCompanyWrapper() {
  const nav = useNavigate();
  return (
    <EmployeeWorkforceCompanyPage
      onBack={() => nav(-1)}
      onOpenAnnouncement={(annId) => nav(`/employee/workforce/announce/${annId}`)}
      onOpenGroup={(groupId) => nav(`/employee/workforce/group/${groupId}`)}
    />
  );
}

export function EmployeeAnnounceDetailWrapper() {
  const { announcementId } = useParams<{ announcementId: string }>();
  const nav = useNavigate();
  if (!announcementId) return null;
  return (
    <EmployeeWorkforceAnnounceDetailPage
      announcementId={announcementId}
      onBack={() => nav(-1)}
    />
  );
}

export function EmployeeTimesheetWrapper() {
  const nav = useNavigate();
  return (
    <EmployeeWorkforceTimesheetPage onBack={() => nav(-1)} />
  );
}

export function EmployeeGroupWrapper() {
  const { groupId } = useParams<{ groupId: string }>();
  const nav = useNavigate();
  if (!groupId) return null;
  return (
    <EmployeeWorkforceGroupPage
      groupId={groupId}
      onBack={() => nav(-1)}
    />
  );
}