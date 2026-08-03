// App name: Job Mitra
// File name: careerNotesService.ts

import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { sanitizeUserText } from "../../../../shared/security/sanitizeUserText";

const MAX_EMPLOYER_NOTES_LENGTH = 600;

export function updateEmployerNotes(postId: string, appId: string, notes: string): boolean {
  if (notes.trim().length > MAX_EMPLOYER_NOTES_LENGTH * 2) return false;

  const cleanNotes = sanitizeUserText(notes, MAX_EMPLOYER_NOTES_LENGTH);
  if (cleanNotes.length > MAX_EMPLOYER_NOTES_LENGTH) return false;

  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app) return false;

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId ? { ...item, employerNotes: cleanNotes, updatedAt: Date.now() } : item,
    ),
  );

  return writeResult.ok;
}
