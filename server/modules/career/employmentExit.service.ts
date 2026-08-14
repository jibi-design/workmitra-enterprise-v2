import type { AuthUser } from "../auth/types.js";
import { employeeCareerService } from "../employee/career/career.service.js";
import { employerCareerService } from "../employer/career/career.service.js";
import { shiftOpsRepository } from "../shiftOps/shiftOps.repository.js";

export type ExitResult =
  | { ok: true; employment: unknown; exitId: string }
  | { ok: false; code: string; message: string; httpStatus: number };

export async function resignEmployment(
  employmentId: string,
  employee: AuthUser,
  details: Record<string, unknown>,
): Promise<ExitResult> {
  const updated = await employeeCareerService.updateEmployment(employmentId, employee, {
    status: "resigned",
    details,
  });
  if (!updated.ok) return updated;
  const exit = await shiftOpsRepository.insertExit({
    employmentId,
    initiatedBy: employee.id,
    kind: "resign",
    details,
  });
  return { ok: true, employment: updated.employment, exitId: exit.id };
}

export async function offboardEmployment(
  employmentId: string,
  employer: AuthUser,
  details: Record<string, unknown>,
): Promise<ExitResult> {
  const updated = await employerCareerService.updateEmployment(employmentId, employer, {
    status: "terminated",
    details,
  });
  if (!updated.ok) return updated;
  const exit = await shiftOpsRepository.insertExit({
    employmentId,
    initiatedBy: employer.id,
    kind: "offboard",
    details,
  });
  return { ok: true, employment: updated.employment, exitId: exit.id };
}
