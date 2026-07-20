// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminUserCards.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminUserCards.tsx

import type { AdminEmployeeRecord, AdminEmployerRecord } from "../helpers/adminDataHelpers";
import { AdminEmployeeCard } from "./AdminEmployeeCard";
import { AdminEmployerCard } from "./AdminEmployerCard";
import type { UserActionHandler } from "./AdminUserSharedParts";
import type { AdminUsersTab } from "./AdminUsersTabsSearch";

type Props = {
  tab: AdminUsersTab;
  employers: AdminEmployerRecord[];
  employees: AdminEmployeeRecord[];
  filteredEmployers: AdminEmployerRecord[];
  filteredEmployees: AdminEmployeeRecord[];
  onAction: UserActionHandler;
};

export function AdminUserCards({
  tab,
  employers,
  employees,
  filteredEmployers,
  filteredEmployees,
  onAction,
}: Props) {
  if (tab === "employers") {
    if (filteredEmployers.length === 0) {
      return (
        <div className="wm-ad-empty">
          {employers.length === 0
            ? "No employers registered yet. Complete employer profile to see data here."
            : "No employers match your search."}
        </div>
      );
    }

    return (
      <>
        {filteredEmployers.map((employer) => (
          <AdminEmployerCard key={employer.id} employer={employer} onAction={onAction} />
        ))}
      </>
    );
  }

  if (filteredEmployees.length === 0) {
    return (
      <div className="wm-ad-empty">
        {employees.length === 0
          ? "No employees registered yet. Complete employee profile to see data here."
          : "No employees match your search."}
      </div>
    );
  }

  return (
    <>
      {filteredEmployees.map((employee) => (
        <AdminEmployeeCard key={employee.id} employee={employee} onAction={onAction} />
      ))}
    </>
  );
}
