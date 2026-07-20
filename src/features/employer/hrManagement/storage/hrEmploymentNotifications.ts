// src/features/employer/hrManagement/storage/hrEmploymentNotifications.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeeNotificationsStorage } from "../../../employee/notifications/storage/employeeNotifications.storage";

function notifyEmployee(title: string, body: string): void {
  employeeNotificationsStorage.pushEmployment(title, body, ROUTE_PATHS.employeeCareerHome);
}

export function notifyEmployeeProbationConfirmed(
  jobTitle: string,
  companyName: string,
  note?: string,
): void {
  const suffix = note?.trim() ? ` Note: ${note.trim()}` : "";
  notifyEmployee(
    "Employment confirmed",
    `Your employment as ${jobTitle}${companyName ? ` at ${companyName}` : ""} has been confirmed after probation.${suffix}`,
  );
}

export function notifyEmployeePromoted(jobTitle: string, companyName: string): void {
  notifyEmployee(
    "Promotion recorded",
    `You have been promoted to ${jobTitle}${companyName ? ` at ${companyName}` : ""}.`,
  );
}

export function notifyEmployeeTransferred(companyName: string, details: string): void {
  notifyEmployee(
    "Transfer recorded",
    `Your employment${companyName ? ` at ${companyName}` : ""} has been updated: ${details}.`,
  );
}

export function notifyEmployeeContractRenewed(companyName: string, newEndDate: number): void {
  const endLabel = new Date(newEndDate).toLocaleDateString("en-GB");
  notifyEmployee(
    "Contract renewed",
    `Your fixed-term contract${companyName ? ` at ${companyName}` : ""} has been renewed until ${endLabel}.`,
  );
}
