/** Phase 4 — Guest local-first storage (`wm_guest_*`). Survives role-switch air-gap. */

import { sanitizeUserText } from "../security/sanitizeUserText";

export const GUEST_STORAGE_PREFIX = "wm_guest_";

const SHORTLIST_SHIFTS_KEY = "wm_guest_shortlist_shifts_v1";
const SHORTLIST_CAREERS_KEY = "wm_guest_shortlist_careers_v1";
const SHADOW_PROFILE_KEY = "wm_guest_shadow_profile_v1";
const DRAFTS_KEY = "wm_guest_drafts_v1";
const CHANGE_EVENT = "wm:guest-storage-changed";

export type GuestShadowProfile = {
  readonly skills: readonly string[];
  readonly searchRadiusKm: number;
  readonly preferredCity: string;
  readonly updatedAt: number;
};

export type GuestDraftKind = "shift_apply" | "career_apply" | "employer_post";

export type GuestDraft = {
  readonly id: string;
  readonly kind: GuestDraftKind;
  readonly targetId: string;
  readonly payload: Record<string, unknown>;
  readonly createdAt: number;
};

const EMPTY_SHADOW: GuestShadowProfile = {
  skills: [],
  searchRadiusKm: 25,
  preferredCity: "",
  updatedAt: 0,
};

/** Cached snapshots — useSyncExternalStore requires referential stability until data changes. */
let cachedShiftShortlist: string[] | null = null;
let cachedCareerShortlist: string[] | null = null;
let cachedShadow: GuestShadowProfile | null = null;
let cachedDrafts: GuestDraft[] | null = null;

function invalidateCaches(): void {
  cachedShiftShortlist = null;
  cachedCareerShortlist = null;
  cachedShadow = null;
  cachedDrafts = null;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    invalidateCaches();
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

function asIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function sanitizeDraftPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    out[key] = typeof value === "string" ? sanitizeUserText(value, 2000) : value;
  }
  return out;
}

function parseShadow(raw: Partial<GuestShadowProfile>): GuestShadowProfile {
  return {
    skills: Array.isArray(raw.skills)
      ? raw.skills
          .filter((s): s is string => typeof s === "string")
          .map((s) => sanitizeUserText(s, 80))
      : [],
    searchRadiusKm:
      typeof raw.searchRadiusKm === "number" && raw.searchRadiusKm > 0
        ? raw.searchRadiusKm
        : EMPTY_SHADOW.searchRadiusKm,
    preferredCity:
      typeof raw.preferredCity === "string" ? sanitizeUserText(raw.preferredCity, 80) : "",
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
  };
}

function parseDrafts(raw: unknown): GuestDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (d): d is GuestDraft =>
      Boolean(d) &&
      typeof d === "object" &&
      typeof (d as GuestDraft).id === "string" &&
      typeof (d as GuestDraft).kind === "string" &&
      typeof (d as GuestDraft).targetId === "string",
  );
}

export const guestStorage = {
  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, cb);
    return () => window.removeEventListener(CHANGE_EVENT, cb);
  },

  getShortlistedShiftIds(): string[] {
    if (!cachedShiftShortlist) {
      cachedShiftShortlist = asIdList(readJson<unknown>(SHORTLIST_SHIFTS_KEY, []));
    }
    return cachedShiftShortlist;
  },

  toggleShortlistShift(postId: string): boolean {
    const id = postId.trim();
    if (!id) return false;
    const set = new Set(guestStorage.getShortlistedShiftIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    writeJson(SHORTLIST_SHIFTS_KEY, [...set]);
    return set.has(id);
  },

  isShiftShortlisted(postId: string): boolean {
    return guestStorage.getShortlistedShiftIds().includes(postId.trim());
  },

  getShortlistedCareerIds(): string[] {
    if (!cachedCareerShortlist) {
      cachedCareerShortlist = asIdList(readJson<unknown>(SHORTLIST_CAREERS_KEY, []));
    }
    return cachedCareerShortlist;
  },

  toggleShortlistCareer(postId: string): boolean {
    const id = postId.trim();
    if (!id) return false;
    const set = new Set(guestStorage.getShortlistedCareerIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    writeJson(SHORTLIST_CAREERS_KEY, [...set]);
    return set.has(id);
  },

  isCareerShortlisted(postId: string): boolean {
    return guestStorage.getShortlistedCareerIds().includes(postId.trim());
  },

  getShadowProfile(): GuestShadowProfile {
    if (!cachedShadow) {
      cachedShadow = parseShadow(readJson<Partial<GuestShadowProfile>>(SHADOW_PROFILE_KEY, {}));
    }
    return cachedShadow;
  },

  saveShadowProfile(patch: Partial<GuestShadowProfile>): GuestShadowProfile {
    const current = guestStorage.getShadowProfile();
    const next: GuestShadowProfile = {
      skills: (patch.skills ?? current.skills).map((s) => sanitizeUserText(s, 80)),
      searchRadiusKm: patch.searchRadiusKm ?? current.searchRadiusKm,
      preferredCity: sanitizeUserText(patch.preferredCity ?? current.preferredCity, 80),
      updatedAt: Date.now(),
    };
    writeJson(SHADOW_PROFILE_KEY, next);
    return next;
  },

  listDrafts(): GuestDraft[] {
    if (!cachedDrafts) {
      cachedDrafts = parseDrafts(readJson<unknown>(DRAFTS_KEY, []));
    }
    return cachedDrafts;
  },

  upsertDraft(draft: Omit<GuestDraft, "id" | "createdAt"> & { id?: string }): GuestDraft {
    const next: GuestDraft = {
      id: draft.id ?? `guest_draft_${Date.now().toString(16)}`,
      kind: draft.kind,
      targetId: draft.targetId,
      payload: sanitizeDraftPayload(draft.payload),
      createdAt: Date.now(),
    };
    const others = guestStorage
      .listDrafts()
      .filter((d) => !(d.kind === next.kind && d.targetId === next.targetId));
    writeJson(DRAFTS_KEY, [...others, next]);
    return next;
  },

  /** Shortlists / drafts / shadow profile only — keep device hash for fraud throttle. */
  clearProfileArtifacts(): void {
    try {
      localStorage.removeItem(SHORTLIST_SHIFTS_KEY);
      localStorage.removeItem(SHORTLIST_CAREERS_KEY);
      localStorage.removeItem(SHADOW_PROFILE_KEY);
      localStorage.removeItem(DRAFTS_KEY);
      invalidateCaches();
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      /* ignore */
    }
  },

  clearAll(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(GUEST_STORAGE_PREFIX)) keys.push(key);
      }
      for (const key of keys) localStorage.removeItem(key);
      invalidateCaches();
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      /* ignore */
    }
  },

  /** Snapshot for post-auth migration. */
  exportArtifacts(): {
    shortlistShifts: string[];
    shortlistCareers: string[];
    shadow: GuestShadowProfile;
    drafts: GuestDraft[];
  } {
    return {
      shortlistShifts: guestStorage.getShortlistedShiftIds(),
      shortlistCareers: guestStorage.getShortlistedCareerIds(),
      shadow: guestStorage.getShadowProfile(),
      drafts: guestStorage.listDrafts(),
    };
  },
};

export function isGuestStorageKey(key: string): boolean {
  return key.startsWith(GUEST_STORAGE_PREFIX);
}
