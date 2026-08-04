/**
 * Employer Business Compliance Hub storage.
 * Key: wm_employer_compliance_hub_v1
 * MUST NOT touch wm_work_diary_* or employee vault document stores.
 */

import type {
  ComplianceDocument,
  ComplianceHubState,
  ComplianceShelfId,
} from "./employerCompliance.types";

export const EMPLOYER_COMPLIANCE_KEY = "wm_employer_compliance_hub_v1";
export const EMPLOYER_COMPLIANCE_CHANGED = "wm:employer-compliance-changed";

const EMPTY_STATE: ComplianceHubState = Object.freeze({
  documents: Object.freeze([]) as readonly ComplianceDocument[],
  updatedAt: 0,
});

let cacheRaw: string | null = "__init__";
let cacheState: ComplianceHubState = EMPTY_STATE;
let cacheSnapshot = "";

function isShelf(value: unknown): value is ComplianceShelfId {
  return value === "business_verification" || value === "insurance_hs" || value === "rtw_audit";
}

function parseDocument(value: unknown): ComplianceDocument | null {
  if (typeof value !== "object" || value === null) return null;
  const rec = value as Record<string, unknown>;
  const id = typeof rec.id === "string" ? rec.id.trim() : "";
  const title = typeof rec.title === "string" ? rec.title.trim() : "";
  if (!id || !title || !isShelf(rec.shelf)) return null;

  const createdAt = typeof rec.createdAt === "number" ? rec.createdAt : Date.now();
  const updatedAt = typeof rec.updatedAt === "number" ? rec.updatedAt : createdAt;
  const fileName =
    typeof rec.fileName === "string" && rec.fileName.trim() ? rec.fileName.trim() : undefined;
  const expiresOn =
    typeof rec.expiresOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rec.expiresOn)
      ? rec.expiresOn
      : undefined;
  const notes =
    typeof rec.notes === "string" && rec.notes.trim() ? rec.notes.trim().slice(0, 240) : undefined;

  return {
    id,
    shelf: rec.shelf,
    title: title.slice(0, 120),
    fileName,
    expiresOn,
    notes,
    createdAt,
    updatedAt,
  };
}

function parseState(raw: string | null): ComplianceHubState {
  if (!raw) return EMPTY_STATE;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_STATE;
    const rec = parsed as Record<string, unknown>;
    const docsRaw = Array.isArray(rec.documents) ? rec.documents : [];
    const documents = docsRaw
      .map(parseDocument)
      .filter((doc): doc is ComplianceDocument => doc !== null)
      .slice(0, 200);
    const updatedAt = typeof rec.updatedAt === "number" ? rec.updatedAt : 0;
    return { documents, updatedAt };
  } catch {
    return EMPTY_STATE;
  }
}

function syncCache(): ComplianceHubState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(EMPLOYER_COMPLIANCE_KEY);
  } catch {
    raw = null;
  }

  if (raw === cacheRaw && cacheRaw !== "__init__") {
    return cacheState;
  }

  cacheRaw = raw;
  cacheState = parseState(raw);
  cacheSnapshot = raw ?? "";
  return cacheState;
}

function writeState(state: ComplianceHubState): void {
  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(EMPLOYER_COMPLIANCE_KEY, raw);
    cacheRaw = raw;
    cacheState = state;
    cacheSnapshot = raw;
    window.dispatchEvent(new Event(EMPLOYER_COMPLIANCE_CHANGED));
  } catch {
    /* demo-safe */
  }
}

function makeId(): string {
  return `comp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type AddComplianceDocumentInput = {
  readonly shelf: ComplianceShelfId;
  readonly title: string;
  readonly fileName?: string;
  readonly expiresOn?: string;
  readonly notes?: string;
};

export const employerComplianceStorage = {
  KEY: EMPLOYER_COMPLIANCE_KEY,
  CHANGED_EVENT: EMPLOYER_COMPLIANCE_CHANGED,

  getState(): ComplianceHubState {
    return syncCache();
  },

  getAll(): readonly ComplianceDocument[] {
    return syncCache().documents;
  },

  getByShelf(shelf: ComplianceShelfId): readonly ComplianceDocument[] {
    return syncCache().documents.filter((doc) => doc.shelf === shelf);
  },

  /** Stable string for useSyncExternalStore. */
  getSnapshot(): string {
    syncCache();
    return cacheSnapshot;
  },

  add(input: AddComplianceDocumentInput): ComplianceDocument | null {
    const title = input.title.trim();
    if (!title) return null;

    const now = Date.now();
    const doc: ComplianceDocument = {
      id: makeId(),
      shelf: input.shelf,
      title: title.slice(0, 120),
      fileName: input.fileName?.trim() || undefined,
      expiresOn:
        input.expiresOn && /^\d{4}-\d{2}-\d{2}$/.test(input.expiresOn)
          ? input.expiresOn
          : undefined,
      notes: input.notes?.trim().slice(0, 240) || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const prev = syncCache();
    writeState({
      documents: [doc, ...prev.documents].slice(0, 200),
      updatedAt: now,
    });
    return doc;
  },

  remove(id: string): boolean {
    const prev = syncCache();
    const nextDocs = prev.documents.filter((doc) => doc.id !== id);
    if (nextDocs.length === prev.documents.length) return false;
    writeState({ documents: nextDocs, updatedAt: Date.now() });
    return true;
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EMPLOYER_COMPLIANCE_CHANGED, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EMPLOYER_COMPLIANCE_CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  },
} as const;
