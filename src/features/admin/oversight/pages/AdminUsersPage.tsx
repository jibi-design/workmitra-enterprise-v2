// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminUsersPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\pages\AdminUsersPage.tsx

import { useCallback, useMemo, useState } from "react";
import { AdminEmployerVerificationCard } from "../components/AdminEmployerVerificationCard";
import {
  AdminUserActionModal,
  type AdminUserActionModalState,
} from "../components/AdminUserActionModal";
import { AdminUserCards } from "../components/AdminUserCards";
import { AdminUsersHeader } from "../components/AdminUsersHeader";
import { AdminUsersTabsSearch, type AdminUsersTab } from "../components/AdminUsersTabsSearch";
import {
  getEmployeeList,
  getEmployerList,
  setUserStatus,
  type UserStatus,
} from "../helpers/adminDataHelpers";

export function AdminUsersPage() {
  const [tab, setTab] = useState<AdminUsersTab>("employers");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [actionModal, setActionModal] = useState<AdminUserActionModalState>({
    open: false,
    userId: "",
    role: "employer",
    userName: "",
    currentStatus: "active",
    targetStatus: "suspended",
  });
  const [actionReason, setActionReason] = useState("");
  const [adminNotice, setAdminNotice] = useState<{
    title: string;
    message: string;
    tone: "success" | "warn";
  } | null>(null);

  const employers = useMemo(() => getEmployerList(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const employees = useMemo(() => getEmployeeList(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredEmployers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employers;

    return employers.filter((employer) =>
      `${employer.companyName} ${employer.fullName} ${employer.email}`
        .toLowerCase()
        .includes(query),
    );
  }, [employers, search]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      `${employee.fullName} ${employee.uniqueId} ${employee.city} ${employee.skills.join(" ")}`
        .toLowerCase()
        .includes(query),
    );
  }, [employees, search]);

  const openAction = useCallback(
    (
      userId: string,
      role: "employer" | "employee",
      userName: string,
      currentStatus: UserStatus,
      targetStatus: UserStatus,
    ) => {
      setActionModal({
        open: true,
        userId,
        role,
        userName,
        currentStatus,
        targetStatus,
      });
      setActionReason("");
    },
    [],
  );

  const executeAction = useCallback(() => {
    setUserStatus(actionModal.userId, actionModal.role, actionModal.targetStatus, actionReason);
    setActionModal((previous) => ({ ...previous, open: false }));
    setRefreshKey((key) => key + 1);
  }, [actionModal, actionReason]);

  function handleTabChange(nextTab: AdminUsersTab) {
    setTab(nextTab);
    setSearch("");
  }

  return (
    <div className="wm-ad-fadeIn">
      <AdminUserActionModal
        actionModal={actionModal}
        actionReason={actionReason}
        onReasonChange={setActionReason}
        onCancel={() => setActionModal((previous) => ({ ...previous, open: false }))}
        onConfirm={executeAction}
      />

      <AdminUsersHeader employerCount={employers.length} employeeCount={employees.length} />

      <AdminEmployerVerificationCard
        onNotice={(title, message, tone) => setAdminNotice({ title, message, tone })}
      />

      {adminNotice ? (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            background:
              adminNotice.tone === "success" ? "rgba(22,163,74,0.1)" : "rgba(245,158,11,0.12)",
            color: adminNotice.tone === "success" ? "#15803d" : "#b45309",
          }}
        >
          <strong>{adminNotice.title}:</strong> {adminNotice.message}
        </div>
      ) : null}

      <AdminUsersTabsSearch
        tab={tab}
        search={search}
        employerCount={employers.length}
        employeeCount={employees.length}
        onTabChange={handleTabChange}
        onSearchChange={setSearch}
      />

      <AdminUserCards
        tab={tab}
        employers={employers}
        employees={employees}
        filteredEmployers={filteredEmployers}
        filteredEmployees={filteredEmployees}
        onAction={openAction}
      />

      <div style={{ height: 24 }} />
    </div>
  );
}
