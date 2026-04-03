// src/features/employee/shiftJobs/pages/ShiftSearchPage.tsx
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getRecentlyViewedIds,
  getAppliedCategories,
  hasAnyApplications,
  isQuickApplyEnabled,
  isProfileComplete,
  quickApply,
  isAlreadyApplied,
  groupPostsByPlan,
  multiApplyGroup,
} from "../helpers/shiftSearchHelpers";
import { ShiftMultiDayPlanCard } from "../components/ShiftMultiDayPlanCard";
import { RecommendedSection, RecentlyViewedSection } from "../components/ShiftSearchSections";
import { getTopMatchesFromStorage, getMatchQuality } from "../helpers/smartMatchEngine";
import type { ShiftCardData } from "../components/ShiftSearchSections";
import { jobAlertStorage } from "../../../../shared/utils/jobAlertStorage";
import type { ShiftAlertCriteria } from "../../../../shared/utils/jobAlertTypes";
import { SavedSearchCard } from "../../../../shared/components/SavedSearchCard";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
type ExperienceLabel = "helper" | "fresher_ok" | "experienced";

type ShiftPostDemo = {
  id: string;
  companyName: string;
  jobName: string;
  category: string;
  experience: ExperienceLabel;
  payPerDay: number;
  locationName: string;
  distanceKm: number;
  startAt: number;
  endAt: number;
  isHiddenFromSearch?: boolean;
  mustHave?: string[];
  goodToHave?: string[];
};

/* ------------------------------------------------ */
/* Storage                                          */
/* ------------------------------------------------ */
const KEY = "wm_employee_shift_posts_demo_v1";
const EMPLOYER_POSTS_CHANGED = "wm:employer-shift-posts-changed";
const EMPLOYEE_POSTS_CHANGED = "wm:employee-shift-posts-changed";

/* Demo seed IDs — purge on mount */
const DEMO_SEED_IDS = new Set(["sp_001", "sp_002", "sp_003", "sp_004"]);

type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null; }
function str(r: Rec, k: string): string | undefined { const v = r[k]; return typeof v === "string" ? v : undefined; }
function num(r: Rec, k: string): number | undefined { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : undefined; }

function getStringArray(r: Rec, k: string): string[] | undefined {
  const v = r[k];
  if (!Array.isArray(v)) return undefined;
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function clampExp(x: unknown): ExperienceLabel | null {
  if (x === "helper" || x === "fresher_ok" || x === "experienced") return x;
  return null;
}

function safeParse(raw: string | null): ShiftPostDemo[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: ShiftPostDemo[] = [];
    for (const item of parsed) {
      if (!isRec(item)) continue;
      const id = str(item, "id"); const companyName = str(item, "companyName");
      const jobName = str(item, "jobName"); const category = str(item, "category");
      const experience = clampExp(item["experience"]);
      const payPerDay = num(item, "payPerDay"); const locationName = str(item, "locationName");
      const startAt = num(item, "startAt"); const endAt = num(item, "endAt");
      if (!id || !companyName || !jobName || !experience || payPerDay === undefined || !locationName || startAt === undefined || endAt === undefined) continue;
      out.push({
        id, companyName, jobName, category: category || "Other", experience,
        payPerDay, locationName, distanceKm: num(item, "distanceKm") ?? 0,
        startAt, endAt, isHiddenFromSearch: !!item["isHiddenFromSearch"],
        mustHave: getStringArray(item, "mustHave"),
        goodToHave: getStringArray(item, "goodToHave"),
      });
    }
    return out;
  } catch { return []; }
}

function safeWrite(list: ShiftPostDemo[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* safe */ }
}

function safeDispatch(ev: string) {
  try { window.dispatchEvent(new Event(ev)); } catch { /* ignore */ }
}

/* Remove any leftover demo seed entries from localStorage */
function purgeDemoSeeds(): void {
  try {
    const existing = safeParse(localStorage.getItem(KEY));
    const cleaned  = existing.filter((p) => !DEMO_SEED_IDS.has(p.id));
    if (cleaned.length !== existing.length) {
      safeWrite(cleaned);
      safeDispatch(EMPLOYEE_POSTS_CHANGED);
    }
  } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function fmtDateRange(startAt: number, endAt: number): string {
  try {
    const s = new Date(startAt); const e = new Date(endAt);
    const sameDay = s.toDateString() === e.toDateString();
    const sTxt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const eTxt = e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sameDay ? sTxt : `${sTxt} - ${eTxt}`;
  } catch { return "Date"; }
}

function expLabel(x: ExperienceLabel): string {
  if (x === "helper") return "Fresher";
  if (x === "fresher_ok") return "Helper";
  return "Experienced";
}

/* ------------------------------------------------ */
/* useSyncExternalStore                             */
/* ------------------------------------------------ */
let postsCacheRaw: string | null = null;
let postsCacheList: ShiftPostDemo[] = [];

function getPostsSnapshot(): ShiftPostDemo[] {
  const raw = localStorage.getItem(KEY);
  if (raw === postsCacheRaw) return postsCacheList;
  postsCacheRaw = raw;
  postsCacheList = safeParse(raw);
  return postsCacheList;
}

function subscribePosts(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener("storage", h);
  window.addEventListener("focus", h);
  document.addEventListener("visibilitychange", h);
  window.addEventListener(EMPLOYER_POSTS_CHANGED, h);
  window.addEventListener(EMPLOYEE_POSTS_CHANGED, h);
  return () => {
    window.removeEventListener("storage", h);
    window.removeEventListener("focus", h);
    document.removeEventListener("visibilitychange", h);
    window.removeEventListener(EMPLOYER_POSTS_CHANGED, h);
    window.removeEventListener(EMPLOYEE_POSTS_CHANGED, h);
  };
}

/* ------------------------------------------------ */
/* Filters                                          */
/* ------------------------------------------------ */
type TimeOpt = "any" | "today" | "next3" | "week";
type ExpOpt = "any" | ExperienceLabel;
type DurOpt = "any" | "oneday" | "multiday";

function isWithinTime(p: ShiftPostDemo, t: TimeOpt): boolean {
  if (t === "any") return true;
  const now = Date.now(); const day = 86400000;
  if (t === "today") return new Date(p.startAt).toDateString() === new Date(now).toDateString();
  if (t === "next3") return p.startAt <= now + day * 3;
  return p.startAt <= now + day * 7;
}

function isDuration(p: ShiftPostDemo, d: DurOpt): boolean {
  if (d === "any") return true;
  const days = Math.round((p.endAt - p.startAt) / 86400000) + 1;
  return d === "oneday" ? days <= 1 : days >= 2;
}

function toCardData(p: ShiftPostDemo): ShiftCardData {
  return {
    id: p.id, jobName: p.jobName, companyName: p.companyName,
    payPerDay: p.payPerDay, locationName: p.locationName,
    distanceKm: p.distanceKm, category: p.category,
  };
}

/* ------------------------------------------------ */
/* Toast style                                      */
/* ------------------------------------------------ */
const TOAST_STYLE: React.CSSProperties = {
  position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
  padding: "10px 20px", borderRadius: 10, background: "#16a34a", color: "#fff",
  fontSize: 13, fontWeight: 700, zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

/* ------------------------------------------------ */
/* Empty State                                      */
/* ------------------------------------------------ */
function EmptyNoShifts() {
  return (
    <div
      style={{
        marginTop: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(22,163,74,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#16a34a" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 6 }}>
        No shifts available yet
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6, maxWidth: 260 }}>
        Employers post shifts here. Check back soon or use filters to search when shifts are posted.
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Main Page                                        */
/* ------------------------------------------------ */
export function ShiftSearchPage() {
  const nav = useNavigate();

  /* Purge leftover demo seeds on mount */
  useEffect(() => { purgeDemoSeeds(); }, []);

  const all = useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);

  const [searchQuery, setSearchQuery] = useState("");
  const [timeOpt, setTimeOpt]         = useState<TimeOpt>("any");
  const [exp, setExp]                 = useState<ExpOpt>("any");
  const [minPayInput, setMinPayInput] = useState("");
  const [dur, setDur]                 = useState<DurOpt>("any");
  const [toast, setToast]             = useState("");
  const [multiAppliedIds, setMultiAppliedIds] = useState<Set<string>>(() => new Set());

  const minPay = useMemo(() => {
    const n = parseInt(minPayInput, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [minPayInput]);

  const visible    = useMemo(() => all.filter((p) => !p.isHiddenFromSearch), [all]);
  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const p of visible) if (p.category) s.add(p.category);
    return Array.from(s).sort();
  }, [visible]);
  const [catFilter, setCatFilter] = useState("any");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return visible
      .filter((p) => {
        if (!q) return true;
        return `${p.jobName} ${p.companyName} ${p.locationName} ${p.category}`.toLowerCase().includes(q);
      })
      .filter((p) => isWithinTime(p, timeOpt))
      .filter((p) => (exp === "any" ? true : p.experience === exp))
      .filter((p) => (minPay === 0 ? true : p.payPerDay >= minPay))
      .filter((p) => (catFilter === "any" ? true : p.category === catFilter))
      .filter((p) => isDuration(p, dur))
      .sort((a, b) => a.startAt - b.startAt);
  }, [visible, searchQuery, timeOpt, exp, minPay, catFilter, dur]);

  /* ---- Recommended ---- */
  const appliedCats = getAppliedCategories();
  const hasApps     = hasAnyApplications();
  const [smartMatches] = useState(() => getTopMatchesFromStorage(4));
  const [matchQuality] = useState(() => getMatchQuality());

  const recommended = hasApps && appliedCats.length > 0
    ? visible.filter((p) => appliedCats.includes(p.category)).slice(0, 3).map(toCardData)
    : visible.slice(0, 3).map(toCardData);

  const recTitle    = hasApps ? "Recommended for You" : "Popular Near You";
  const recSubtitle = hasApps ? "Based on your past applications" : "Top shifts available now";

  /* ---- Recently Viewed ---- */
  const recentlyViewed = useMemo(() => {
    const ids     = getRecentlyViewedIds();
    const postMap = new Map(visible.map((p) => [p.id, p]));
    return ids
      .map((id) => postMap.get(id))
      .filter((p): p is ShiftPostDemo => !!p)
      .map(toCardData);
  }, [visible]);

  /* ---- Quick Apply ---- */
  const qaEnabled = useMemo(() => isQuickApplyEnabled() && isProfileComplete(), []);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => new Set());

  function handleQuickApply(e: React.MouseEvent, postId: string) {
    e.stopPropagation();
    if (appliedIds.has(postId) || isAlreadyApplied(postId)) return;
    const ok = quickApply(postId);
    if (ok) {
      setAppliedIds((prev) => new Set(prev).add(postId));
      setToast("Applied! You'll be notified of updates.");
      setTimeout(() => setToast(""), 2500);
    }
  }

  const hasFilters = timeOpt !== "any" || exp !== "any" || minPay > 0
    || catFilter !== "any" || dur !== "any" || searchQuery.trim().length > 0;

  function clearFilters() {
    setSearchQuery(""); setTimeOpt("any"); setExp("any");
    setMinPayInput(""); setCatFilter("any"); setDur("any");
  }

  function openDetails(postId: string) {
    nav(ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", postId));
  }

  return (
    <div className="wm-ee-vShift">
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(22,163,74,0.08)", color: "#16a34a", flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">Find Shifts</div>
            <div className="wm-pageSub">Search available shifts and apply.</div>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <section className="wm-ee-card wm-ee-accentCard wm-ee-vShift" style={{ marginTop: 12 }}>
        <div className="wm-ee-headTint">
          <input
            className="wm-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job, company, or location..."
            aria-label="Search shifts"
          />
        </div>
        <div style={{ padding: "12px 0 0" }}>
          <div className="wm-chipRow" style={{ marginTop: 0 }}>
            <button className={`wm-chipBtn ${timeOpt === "any"   ? "isActive" : ""}`} type="button" onClick={() => setTimeOpt("any")}>All dates</button>
            <button className={`wm-chipBtn ${timeOpt === "today" ? "isActive" : ""}`} type="button" onClick={() => setTimeOpt("today")}>Today</button>
            <button className={`wm-chipBtn ${timeOpt === "next3" ? "isActive" : ""}`} type="button" onClick={() => setTimeOpt("next3")}>Next 3 days</button>
            <button className={`wm-chipBtn ${timeOpt === "week"  ? "isActive" : ""}`} type="button" onClick={() => setTimeOpt("week")}>This week</button>
          </div>
          <div className="wm-chipRow">
            <button className={`wm-chipBtn ${exp === "any"          ? "isActive" : ""}`} type="button" onClick={() => setExp("any")}>Any level</button>
            <button className={`wm-chipBtn ${exp === "helper"       ? "isActive" : ""}`} type="button" onClick={() => setExp("helper")}>Fresher</button>
            <button className={`wm-chipBtn ${exp === "fresher_ok"   ? "isActive" : ""}`} type="button" onClick={() => setExp("fresher_ok")}>Helper</button>
            <button className={`wm-chipBtn ${exp === "experienced"  ? "isActive" : ""}`} type="button" onClick={() => setExp("experienced")}>Experienced</button>
          </div>

          {/* Min Pay */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)", whiteSpace: "nowrap" }}>Min pay:</span>
            <input
              className="wm-input"
              type="number"
              inputMode="numeric"
              value={minPayInput}
              onChange={(e) => setMinPayInput(e.target.value)}
              placeholder="Any"
              aria-label="Minimum pay per day"
              style={{ maxWidth: 100, padding: "6px 10px", fontSize: 13 }}
            />
            <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>/ day</span>
            {minPay > 0 && (
              <button type="button" onClick={() => setMinPayInput("")}
                style={{ border: "none", background: "transparent", color: "var(--wm-error)", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "4px 6px" }}>
                Clear
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="wm-chipRow" style={{ marginTop: 8 }}>
              <button className={`wm-chipBtn ${catFilter === "any" ? "isActive" : ""}`} type="button" onClick={() => setCatFilter("any")}>All categories</button>
              {categories.map((c) => (
                <button key={c} className={`wm-chipBtn ${catFilter === c ? "isActive" : ""}`} type="button" onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
          )}

          <div className="wm-chipRow">
            <button className={`wm-chipBtn ${dur === "any"      ? "isActive" : ""}`} type="button" onClick={() => setDur("any")}>Any duration</button>
            <button className={`wm-chipBtn ${dur === "oneday"   ? "isActive" : ""}`} type="button" onClick={() => setDur("oneday")}>1 day</button>
            <button className={`wm-chipBtn ${dur === "multiday" ? "isActive" : ""}`} type="button" onClick={() => setDur("multiday")}>Multi-day</button>
            {hasFilters && (
              <button className="wm-chipBtn" type="button" onClick={clearFilters}
                style={{ marginLeft: "auto", color: "var(--wm-error)" }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Save Search + Alerts */}
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            const criteria: ShiftAlertCriteria = {
              domain: "shift",
              query: searchQuery.trim() || undefined,
              category: catFilter !== "any" ? catFilter : undefined,
              experience: exp !== "any" ? exp : undefined,
              minPay: minPay > 0 ? minPay : undefined,
            };
            const result = jobAlertStorage.save("shift", criteria);
            if (result.success) { setToast("Search saved! You'll be notified of new matches."); setTimeout(() => setToast(""), 2500); }
            else { setToast(result.reason ?? "Could not save alert."); setTimeout(() => setToast(""), 3000); }
          }}
          style={{
            marginTop: 10, width: "100%", padding: "10px 16px", borderRadius: 10,
            border: "1px solid rgba(22,163,74,0.3)", background: "rgba(22,163,74,0.06)",
            color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          Save this search
        </button>
      )}
      <SavedSearchCard />

      {/* Recommended */}
      <RecommendedSection cards={recommended} title={recTitle} subtitle={recSubtitle} onOpen={openDetails} />

      {/* Recently Viewed */}
      <RecentlyViewedSection cards={recentlyViewed} onOpen={openDetails} />

      {/* Multi-day Plans */}
      {(() => {
        const groups = groupPostsByPlan(filtered);
        if (groups.length === 0) return null;
        return (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 8 }}>
              Multi-day Plans
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {groups.map((g) => {
                const groupPosts = g.postIds.map((pid) => {
                  const p = visible.find((x) => x.id === pid);
                  if (!p) return null;
                  return {
                    id: p.id,
                    date: new Date(p.startAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
                    payPerDay: p.payPerDay,
                    workers: 1,
                    applied: appliedIds.has(p.id) || multiAppliedIds.has(p.id) || isAlreadyApplied(p.id),
                  };
                }).filter((x): x is NonNullable<typeof x> => x !== null);

                const allApplied  = groupPosts.every((p) => p.applied);
                const someApplied = groupPosts.some((p) => p.applied);

                return (
                  <ShiftMultiDayPlanCard
                    key={g.key}
                    planName={g.planName}
                    companyName={g.companyName}
                    locationName={g.locationName}
                    category={g.category}
                    posts={groupPosts}
                    allApplied={allApplied}
                    someApplied={someApplied}
                    onOpenDay={(pid) => nav(ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", pid))}
                    onApplyAll={() => {
                      const unapplied = g.postIds.filter(
                        (pid) => !appliedIds.has(pid) && !multiAppliedIds.has(pid) && !isAlreadyApplied(pid),
                      );
                      const count = multiApplyGroup(unapplied);
                      if (count > 0) {
                        setMultiAppliedIds((prev) => {
                          const n = new Set(prev);
                          unapplied.forEach((id) => n.add(id));
                          return n;
                        });
                        setToast(`Applied for ${count} day${count !== 1 ? "s" : ""}!`);
                        setTimeout(() => setToast(""), 2500);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Smart Match */}
      {smartMatches.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
              &#10024; Best Matches for You
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
              background: matchQuality === "high" ? "rgba(22,163,74,0.10)" : "rgba(217,119,6,0.10)",
              color: matchQuality === "high" ? "#16a34a" : "#92400e",
              border: matchQuality === "high" ? "1px solid rgba(22,163,74,0.2)" : "1px solid rgba(217,119,6,0.2)",
            }}>
              {matchQuality === "high"
                ? "High accuracy"
                : matchQuality === "medium"
                  ? "Medium accuracy"
                  : "Complete profile for better matches"}
            </span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {smartMatches.map((m) => (
              <button
                key={m.post.id}
                type="button"
                onClick={() => openDetails(m.post.id)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1.5px solid rgba(22,163,74,0.25)",
                  background: "rgba(22,163,74,0.03)",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.post.jobName} &mdash; {m.post.companyName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                      {m.post.locationName} &middot; Pay: {m.post.payPerDay}/day
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    padding: "2px 8px", borderRadius: 999,
                    background: "rgba(22,163,74,0.10)", color: "#16a34a",
                  }}>
                    {m.score}% match
                  </div>
                </div>
                {m.reasons.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {m.reasons.slice(0, 2).map((r) => (
                      <span key={r} style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                        background: "var(--wm-er-surface)", border: "1px solid var(--wm-er-border)",
                        color: "var(--wm-er-muted)",
                      }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      {visible.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 700 }}>
          {filtered.length} {filtered.length === 1 ? "shift" : "shifts"} found
        </div>
      )}

      {/* Shift list */}
      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>

        {/* True empty — no employer posts at all */}
        {visible.length === 0 && <EmptyNoShifts />}

        {/* Filtered empty — posts exist but no match */}
        {visible.length > 0 && filtered.length === 0 && (
          <div className="wm-ee-card" style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>No shifts found</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
              {hasFilters
                ? "Try changing your filters or search."
                : "No shifts available right now. Check back later."}
            </div>
            {hasFilters && (
              <button className="wm-outlineBtn" type="button" onClick={clearFilters} style={{ marginTop: 12 }}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {filtered.map((p) => {
          const range          = fmtDateRange(p.startAt, p.endAt);
          const location       = p.distanceKm > 0 ? `${p.locationName} - ${p.distanceKm} km` : p.locationName;
          const alreadyApplied = appliedIds.has(p.id) || isAlreadyApplied(p.id);

          return (
            <button
              key={p.id}
              type="button"
              className="wm-noteItem wm-noteItem-shift"
              onClick={() => openDetails(p.id)}
              aria-label={`Open shift ${p.jobName} at ${p.companyName}`}
            >
              <div className="wm-noteHeader">
                <div className="wm-noteTitleRow">
                  <div className="wm-noteTitle">{p.jobName} - {p.companyName}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {qaEnabled && !alreadyApplied && (
                    <span
                      onClick={(e) => handleQuickApply(e, p.id)}
                      style={{
                        padding: "5px 10px", borderRadius: 8, background: "#16a34a",
                        color: "#fff", fontSize: 10, fontWeight: 700,
                        cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      Quick Apply
                    </span>
                  )}
                  {alreadyApplied && (
                    <span style={{
                      padding: "5px 10px", borderRadius: 8,
                      background: "rgba(22,163,74,0.1)", color: "#16a34a",
                      fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                    }}>
                      Applied
                    </span>
                  )}
                  <span style={{
                    padding: "6px 12px", borderRadius: 8,
                    background: "#16a34a", color: "#fff",
                    fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                  }}>
                    View
                  </span>
                </div>
              </div>
              <div className="wm-noteBody">{p.category} - {expLabel(p.experience)} - {range}</div>
              <div className="wm-noteMeta">
                <div className="wm-noteMetaLeft">
                  <span className="wm-noteTime">{location}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
                  Pay: {p.payPerDay} / day
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toast */}
      {toast && <div style={TOAST_STYLE}>{toast}</div>}
    </div>
  );
}