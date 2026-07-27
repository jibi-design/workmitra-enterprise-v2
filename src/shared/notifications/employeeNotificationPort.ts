// src/shared/notifications/employeeNotificationPort.ts
//
// Employer → employee notification adapter (strict module isolation).
// Wraps push/read methods employer services need without importing employee features.

import {
  employeeNotificationsStorage,
  type EmployeeNotification,
} from "../../features/employee/notifications/storage/employeeNotifications.storage";

export type EmployeeNotificationPortItem = EmployeeNotification;

export const employeeNotificationPort = {
  getAll(): EmployeeNotificationPortItem[] {
    return employeeNotificationsStorage.getAll();
  },

  pushShift(title: string, body?: string, route?: string): void {
    employeeNotificationsStorage.pushShift(title, body, route);
  },

  pushCareer(title: string, body?: string, route?: string): void {
    employeeNotificationsStorage.pushCareer(title, body, route);
  },

  pushWorkforce(title: string, body?: string, route?: string): void {
    employeeNotificationsStorage.pushWorkforce(title, body, route);
  },

  pushEmployment(title: string, body?: string, route?: string): void {
    employeeNotificationsStorage.pushEmployment(title, body, route);
  },
} as const;
