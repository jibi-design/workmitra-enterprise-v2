/** Job Mitra | employeeVaultUploadRedirect.tsx | C-UX-1 upload deep-link → folder modal */

import { Navigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";

export function EmployeeVaultUploadRedirect() {
  const { folderId = "" } = useParams();
  return (
    <Navigate
      to={`${ROUTE_PATHS.employeeVaultFolder.replace(":folderId", folderId)}?upload=1`}
      replace
    />
  );
}
