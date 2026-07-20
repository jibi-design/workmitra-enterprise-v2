// App name: Job Mitra
// File name: careerNotesService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerNotesService.ts

import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";

const MAX_EMPLOYER_NOTES_LENGTH = 600;

export function updateEmployerNotes(postId: string, appId: string, notes: string): boolean {
  const cleanNotes = notes.trim();

  if (cleanNotes.length > MAX_EMPLOYER_NOTES_LENGTH) return false;

  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app) return false;

  writeCareerApps(
    apps.map((item) =>
      item.id === appId ? { ...item, employerNotes: cleanNotes, updatedAt: Date.now() } : item,
    ),
  );

  return true;
}
