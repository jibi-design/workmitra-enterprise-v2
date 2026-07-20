// App name: Job Mitra
// File name: EmployeeReviewCenterPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\pages\EmployeeReviewCenterPage.tsx

import { useEffect, useState } from "react";
import { shiftWorkspacesStorage } from "../../../employee/shiftJobs/storage/shiftWorkspaces.storage";
import { getEmployeeShiftReviewItems } from "../adapters/employeeShiftReviewCenter.adapter";
import { EmployeeShiftReviewActions } from "../components/EmployeeShiftReviewActions";
import { ReviewCenterPageShell } from "../components/ReviewCenterPageShell";

export function EmployeeReviewCenterPage() {
  const [workspaces, setWorkspaces] = useState(() => shiftWorkspacesStorage.getAll());

  useEffect(() => {
    return shiftWorkspacesStorage.subscribe(() => {
      setWorkspaces(shiftWorkspacesStorage.getAll());
    });
  }, []);

  const shiftReviewItems = getEmployeeShiftReviewItems(workspaces);

  return (
    <ReviewCenterPageShell role="employee" hasExtraContent={shiftReviewItems.length > 0}>
      <EmployeeShiftReviewActions items={shiftReviewItems} />
    </ReviewCenterPageShell>
  );
}
