import type { EmployerToWorkerRating, WorkerToEmployerRating } from "./ratingTypes";
import {
  CHANGED_EVENT,
  EDIT_WINDOW_MS,
  ER_KEY,
  WR_KEY,
  type EditResult,
} from "./ratingStorage.constants";
import { parseERRatings, parseWRRatings } from "./ratingStorage.parse";

let _erRaw: string | null = "__init__";
let _erList: EmployerToWorkerRating[] = [];
let _wrRaw: string | null = "__init__";
let _wrList: WorkerToEmployerRating[] = [];

export function readER(): EmployerToWorkerRating[] {
  const raw = localStorage.getItem(ER_KEY);
  if (raw === _erRaw) return _erList;
  _erRaw = raw;
  _erList = parseERRatings(raw);
  return _erList;
}

export function readWR(): WorkerToEmployerRating[] {
  const raw = localStorage.getItem(WR_KEY);
  if (raw === _wrRaw) return _wrList;
  _wrRaw = raw;
  _wrList = parseWRRatings(raw);
  return _wrList;
}

function notify() {
  try {
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* safe */
  }
}

export function writeER(list: EmployerToWorkerRating[]) {
  try {
    localStorage.setItem(ER_KEY, JSON.stringify(list));
  } catch {
    /* safe */
  }
  _erRaw = null;
  notify();
}

export function writeWR(list: WorkerToEmployerRating[]) {
  try {
    localStorage.setItem(WR_KEY, JSON.stringify(list));
  } catch {
    /* safe */
  }
  _wrRaw = null;
  notify();
}

export function checkEditable(createdAt: number, editCount: number): EditResult {
  if (editCount >= 1)
    return { success: false, reason: "Already edited once. No further edits allowed." };
  if (Date.now() - createdAt >= EDIT_WINDOW_MS)
    return { success: false, reason: "Edit window expired (24 hours)." };
  return { success: true };
}

export { CHANGED_EVENT, ER_KEY, WR_KEY };
