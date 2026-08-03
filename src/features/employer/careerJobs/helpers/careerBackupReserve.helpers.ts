// App name: Job Mitra
// File name: careerBackupReserve.helpers.ts
// C-PIPE-1: durable local backup reserve on applications (not an AUTH stage).

import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";

/** Stamp or clear backupReserved on applied apps for a post. */
export function setCareerBackupReserve(
  postId: string,
  reservedAppIds: ReadonlySet<string> | readonly string[],
): boolean {
  const idSet =
    reservedAppIds instanceof Set
      ? reservedAppIds
      : new Set(Array.from(reservedAppIds).filter(Boolean));
  const apps = readCareerApps();
  const now = Date.now();

  const next = apps.map((app) => {
    if (app.jobId !== postId) return app;
    if (app.stage !== "applied") {
      return app.backupReserved ? { ...app, backupReserved: undefined, updatedAt: now } : app;
    }
    const shouldReserve = idSet.has(app.id);
    if (shouldReserve === Boolean(app.backupReserved)) return app;
    return {
      ...app,
      backupReserved: shouldReserve ? true : undefined,
      updatedAt: now,
    };
  });

  return writeCareerApps(next).ok;
}

export function clearCareerBackupReserve(postId: string): boolean {
  return setCareerBackupReserve(postId, []);
}

export function clearCareerBackupReserveForApp(postId: string, appId: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app?.backupReserved) return true;

  const now = Date.now();
  return writeCareerApps(
    apps.map((item) =>
      item.id === appId && item.jobId === postId
        ? { ...item, backupReserved: undefined, updatedAt: now }
        : item,
    ),
  ).ok;
}

export function readCareerBackupReservedIds(postId: string): string[] {
  return readCareerApps()
    .filter((app) => app.jobId === postId && app.stage === "applied" && app.backupReserved === true)
    .map((app) => app.id);
}
