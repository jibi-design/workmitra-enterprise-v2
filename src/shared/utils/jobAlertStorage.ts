// App name: Job Mitra
// File name: jobAlertStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\utils\jobAlertStorage.ts

// Job Alert storage — save, delete, list, match check.
// Runs on app open: scan new posts since lastCheckedAt → generate notifications.

import type {
  AlertDomain,
  CareerAlertCriteria,
  JobAlert,
  ShiftAlertCriteria,
} from "./jobAlertTypes";
import { MAX_ALERTS } from "./jobAlertTypes";
import {
  CAREER_POSTS_KEY,
  getPostsSince,
  matchesCareer,
  matchesShift,
  SHIFT_POSTS_KEY,
} from "./jobAlertStorage.matching";
import { pushJobAlertNotification } from "./jobAlertStorage.notifications";
import {
  buildLabel,
  criteriaKey,
  newId,
  normalizeCriteria,
  readAlerts,
  writeAlerts,
} from "./jobAlertStorage.utils";

export const jobAlertStorage = {
  getAll(): JobAlert[] {
    return readAlerts();
  },

  save(
    domain: AlertDomain,
    criteria: ShiftAlertCriteria | CareerAlertCriteria,
  ): { success: boolean; reason?: string } {
    const normalizedCriteria = normalizeCriteria(domain, criteria);

    if (!normalizedCriteria) {
      return {
        success: false,
        reason: "Choose at least one search term or filter before saving this alert.",
      };
    }

    const list = readAlerts();
    const duplicateKey = `${domain}:${criteriaKey(normalizedCriteria)}`;
    const duplicate = list.some(
      (alert) => `${alert.domain}:${criteriaKey(alert.criteria)}` === duplicateKey,
    );

    if (duplicate) {
      return { success: false, reason: "This search alert is already saved." };
    }

    if (list.length >= MAX_ALERTS) {
      return {
        success: false,
        reason: `Maximum ${MAX_ALERTS} alerts allowed. Delete an existing alert first.`,
      };
    }

    const now = Date.now();

    const alert: JobAlert = {
      id: newId(),
      domain,
      label: buildLabel(domain, normalizedCriteria),
      createdAt: now,
      lastCheckedAt: now,
      criteria: normalizedCriteria,
    };

    writeAlerts([alert, ...list]);
    return { success: true };
  },

  delete(alertId: string): void {
    const cleanId = alertId.trim();
    if (!cleanId) return;

    writeAlerts(readAlerts().filter((alert) => alert.id !== cleanId));
  },

  checkAlerts(): number {
    const alerts = readAlerts();
    if (alerts.length === 0) return 0;

    let totalMatches = 0;
    const now = Date.now();

    for (const alert of alerts) {
      const since = alert.lastCheckedAt;
      const criteria = alert.criteria;
      let matches = [];

      if (criteria.domain === "shift") {
        const posts = getPostsSince(SHIFT_POSTS_KEY, since);
        matches = posts.filter((post) => matchesShift(post, criteria));
      } else {
        const posts = getPostsSince(CAREER_POSTS_KEY, since);
        matches = posts.filter((post) => matchesCareer(post, criteria));
      }

      if (matches.length > 0) {
        pushJobAlertNotification(
          `${matches.length} new ${matches.length === 1 ? "job" : "jobs"} match your alert`,
          `Alert: ${alert.label}`,
          criteria.domain === "shift" ? "/employee/shift/search" : "/employee/career/search",
          criteria.domain,
        );

        totalMatches += matches.length;
      }

      alert.lastCheckedAt = now;
    }

    writeAlerts(alerts);
    return totalMatches;
  },
} as const;
