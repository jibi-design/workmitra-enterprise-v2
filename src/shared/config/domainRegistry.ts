/**
 * Day-1 product domain registry — single source of truth for landing strip,
 * home domain cards, and accent token mapping.
 * Adding a domain = one array entry (+ CSS tone in STEP 4 when needed).
 */

export type DomainRegistryKey = "shift" | "career" | "vault" | "planner" | "labs";

export type DomainRegistryTone = DomainRegistryKey;

export type DomainAudience = "shared" | "employee" | "employer";

export type DomainRegistryEntry = {
  readonly key: DomainRegistryKey;
  readonly title: string;
  /** Landing / shared description (role-neutral). */
  readonly copy: string;
  /** Employee home card description. */
  readonly employeeCopy: string;
  /** Employer home card description. */
  readonly employerCopy: string;
  /** CSS modifier suffix: `.wm-publicLanding__domain--${tone}` */
  readonly tone: DomainRegistryTone;
  /** CSS custom property name for domain accent (e.g. `--wm-shift-accent`). */
  readonly accentVar: `--wm-${DomainRegistryKey}-accent`;
};

/**
 * Canonical Day-1 domains (Shift ≠ Career; Labs is employer utility).
 * Order = landing grid / home presentation order.
 */
export const DOMAIN_REGISTRY = [
  {
    key: "shift",
    title: "Shift Jobs",
    copy: "Short-term local shift work.",
    employeeCopy: "Browse and apply for short-term local work.",
    employerCopy: "Post and fill short-term local work.",
    tone: "shift",
    accentVar: "--wm-shift-accent",
  },
  {
    key: "career",
    title: "Career Jobs",
    copy: "Longer-term career hiring and applications.",
    employeeCopy: "Find and apply for longer-term roles.",
    employerCopy: "Post and manage longer-term roles.",
    tone: "career",
    accentVar: "--wm-career-accent",
  },
  {
    key: "vault",
    title: "Work Vault",
    copy: "Keep work identity and records in one place.",
    employeeCopy: "Keep work identity and records in one place.",
    employerCopy: "Look up worker identity and secured records.",
    tone: "vault",
    accentVar: "--wm-vault-accent",
  },
  {
    key: "planner",
    title: "Demand Planner",
    copy: "Plan upcoming staffing needs ahead of time.",
    employeeCopy: "Discover multi-day project plans and apply.",
    employerCopy: "Plan upcoming staffing needs ahead of time.",
    tone: "planner",
    accentVar: "--wm-planner-accent",
  },
  {
    key: "labs",
    title: "Mitra Labs",
    copy: "Digital invites and styled QR utilities for events.",
    employeeCopy: "Digital invites and styled QR utilities for events.",
    employerCopy: "Digital invites and styled QR utilities for events.",
    tone: "labs",
    accentVar: "--wm-labs-accent",
  },
] as const satisfies readonly DomainRegistryEntry[];

export type DomainRegistryItem = (typeof DOMAIN_REGISTRY)[number];

/** Typed map for home cards / command labels — prefer this over find. */
export const DOMAIN_BY_KEY: {
  readonly [K in DomainRegistryKey]: Extract<DomainRegistryItem, { key: K }>;
} = {
  shift: DOMAIN_REGISTRY[0],
  career: DOMAIN_REGISTRY[1],
  vault: DOMAIN_REGISTRY[2],
  planner: DOMAIN_REGISTRY[3],
  labs: DOMAIN_REGISTRY[4],
};

/** Lookup by key — O(n) over five Day-1 entries. Prefer DOMAIN_BY_KEY when key is known. */
export function getDomainByKey(key: DomainRegistryKey): DomainRegistryItem | undefined {
  return DOMAIN_BY_KEY[key];
}

/** Audience-aware card/landing copy. */
export function getDomainCopy(key: DomainRegistryKey, audience: DomainAudience = "shared"): string {
  const domain = DOMAIN_BY_KEY[key];
  if (audience === "employee") return domain.employeeCopy;
  if (audience === "employer") return domain.employerCopy;
  return domain.copy;
}

/** CSS `var(--wm-…-accent)` helper for icon/chrome. */
export function domainAccentCssVar(key: DomainRegistryKey): string {
  return `var(${DOMAIN_BY_KEY[key].accentVar})`;
}
