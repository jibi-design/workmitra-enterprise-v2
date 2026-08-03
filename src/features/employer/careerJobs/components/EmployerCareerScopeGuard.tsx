/**
 * B-P1-4 — Route guard for Employer Career.
 * Blocks nested Career pages until employerScopeId is valid; prevents unscoped LS/API work.
 */

import { Outlet } from "react-router-dom";
import { EmployerCareerScopeSetupCard } from "./EmployerCareerScopeSetupCard";
import { useEmployerCareerScope } from "../hooks/useEmployerCareerScope";

export function EmployerCareerScopeGuard() {
  const scope = useEmployerCareerScope();

  if (!scope.ready) {
    return <EmployerCareerScopeSetupCard reason={scope.reason} />;
  }

  return <Outlet />;
}
