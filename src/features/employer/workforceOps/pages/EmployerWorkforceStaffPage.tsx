// src/features/employer/workforceOps/pages/EmployerWorkforceStaffPage.tsx
//
// Workforce Ops Hub — Staff Directory.
// Search, filter by category, view staff cards, add new staff via modal.

import { useMemo, useSyncExternalStore, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { workforceStaffService } from "../services/workforceStaffService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { WorkforceStaff, WorkforceCategory } from "../types/workforceTypes";
import {
  WF_STAFF_CHANGED,
  WF_CATEGORIES_CHANGED,
} from "../helpers/workforceStorageUtils";
import { WorkforceAddStaffModal } from "../components/WorkforceAddStaffModal";
import {
  IconPlus,
  IconSearch,
  IconStaff,
  IconEmpty,
  IconStar,
  IconArrowRight,
  IconBack,
} from "../components/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  sectionTitleStyle,
  sectionIconWrapStyle,
  categoryChipStyle,
  emptyStateStyle,
  staffCardStyle,
  timeAgo,
} from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Subscription                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type StaffSnapshot = {
  staff: WorkforceStaff[];
  categories: WorkforceCategory[];
  ver: number;
};

let snapCache: StaffSnapshot | null = null;
let snapVer = 0;

function getSnapshot(): StaffSnapshot {
  if (snapCache && snapCache.ver === snapVer) return snapCache;
  const staff = workforceStaffService.getAll();
  const categories = workforceCategoryService.getAll();
  snapCache = { staff, categories, ver: snapVer };
  return snapCache;
}

function subscribe(cb: () => void): () => void {
  const events = [WF_STAFF_CHANGED, WF_CATEGORIES_CHANGED];
  const handler = () => { snapVer++; snapCache = null; cb(); };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Category Name Lookup                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

function buildCategoryMap(categories: WorkforceCategory[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of categories) map.set(c.id, c.name);
  return map;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Rating Display                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function RatingDisplay({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) {
    return <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No rating</span>;
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: AMBER }}>
      <IconStar /> {rating.toFixed(1)}
      <span style={{ fontWeight: 500, color: "var(--wm-er-muted)" }}>({count})</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceStaffPage() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const nav = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const categoryMap = useMemo(() => buildCategoryMap(data.categories), [data.categories]);

  /* ── Filtered Staff ── */
  const filteredStaff = useMemo(() => {
    let list = data.staff;

    if (selectedCategoryId) {
      list = list.filter((s) => s.categories.includes(selectedCategoryId));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(q) ||
          s.employeeUniqueId.toLowerCase().includes(q) ||
          s.employeeCity.toLowerCase().includes(q) ||
          s.categories.some((catId) => (categoryMap.get(catId) ?? "").toLowerCase().includes(q)),
      );
    }

    return list;
  }, [data.staff, selectedCategoryId, searchQuery, categoryMap]);

  /* ── Category counts ── */
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of data.staff) {
      for (const catId of s.categories) {
        counts.set(catId, (counts.get(catId) ?? 0) + 1);
      }
    }
    return counts;
  }, [data.staff]);

  /* ── Open staff detail ── */
  const openStaffDetail = useCallback((staffId: string) => {
    nav(`/employer/workforce/staff/${staffId}`);
  }, [nav]);

  /* ── On staff added ── */
  const handleStaffAdded = useCallback(() => {
    snapVer++;
  }, []);

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={() => nav(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center" }}>
          <IconBack />
        </button>
        <div style={{ flex: 1 }}>
          <div className="wm-pageTitle">Staff Directory</div>
          <div className="wm-pageSub">
            {data.staff.length} staff member{data.staff.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          className="wm-primarybtn" type="button"
          onClick={() => setShowAddModal(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: AMBER }}
        >
          <IconPlus /> Add Staff
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ marginTop: 14, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--wm-er-muted)",
            pointerEvents: "none",
          }}
        >
          <IconSearch />
        </div>
        <input
          type="text"
          className="wm-input"
          placeholder="Search by name, ID, city, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", paddingLeft: 38, fontSize: 13 }}
        />
      </div>

      {/* ── Category Filter Chips ── */}
      {data.categories.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            style={{
              ...categoryChipStyle,
              cursor: "pointer",
              background: selectedCategoryId === null ? AMBER : AMBER_BG,
              color: selectedCategoryId === null ? "#fff" : AMBER,
            }}
          >
            All ({data.staff.length})
          </button>
          {data.categories.map((cat) => {
            const count = categoryCounts.get(cat.id) ?? 0;
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(isActive ? null : cat.id)}
                style={{
                  ...categoryChipStyle,
                  cursor: "pointer",
                  background: isActive ? AMBER : AMBER_BG,
                  color: isActive ? "#fff" : AMBER,
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Staff List ── */}
      {filteredStaff.length > 0 ? (
        <div style={{ marginTop: 14, display: "grid", gap: 10, marginBottom: 24 }}>
          {filteredStaff.map((staff) => (
            <button
              key={staff.id}
              type="button"
              style={staffCardStyle}
              onClick={() => openStaffDetail(staff.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                {/* Left: Info */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {staff.employeeName}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    ID: {staff.employeeUniqueId}
                    {staff.employeeCity && ` · ${staff.employeeCity}`}
                  </div>

                  {/* Category chips */}
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {staff.categories.map((catId) => (
                      <span
                        key={catId}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: AMBER_BG,
                          color: AMBER,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {categoryMap.get(catId) ?? catId}
                      </span>
                    ))}
                  </div>

                  {/* Rating + Added date */}
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 10 }}>
                    <RatingDisplay rating={staff.rating} count={staff.ratingCount} />
                    <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                      Added {timeAgo(staff.addedAt)}
                    </span>
                  </div>
                </div>

                {/* Right: Arrow */}
                <div style={{ color: "var(--wm-er-muted)", flexShrink: 0, paddingTop: 4 }}>
                  <IconArrowRight />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : data.staff.length === 0 ? (
        /* ── Empty State: No staff at all ── */
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={emptyStateStyle}>
            <IconEmpty />
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
              No staff added yet
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}>
              Add your team members by their unique ID. You can organise them into categories and assign work.
            </div>
            <button
              className="wm-primarybtn" type="button"
              onClick={() => setShowAddModal(true)}
              style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6, background: AMBER }}
            >
              <IconPlus /> Add First Staff
            </button>
          </div>

          {/* How to add staff guide */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--wm-er-border)" }}>
            <div style={sectionTitleStyle}>
              <div style={sectionIconWrapStyle}><IconStaff /></div>
              How to add staff
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
              {[
                "Get the employee's unique ID (they can find it in their profile)",
                "Tap \"Add Staff\" and enter their ID",
                "Assign one or more categories to define their role",
                "Staff will be notified and can see your announcements",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 999,
                    background: AMBER_BG, color: AMBER,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--wm-er-text)", lineHeight: 1.4 }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty State: Filter returned no results ── */
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={emptyStateStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
              No staff found
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 260, lineHeight: 1.5 }}>
              {searchQuery.trim()
                ? `No results for "${searchQuery.trim()}". Try a different search.`
                : "No staff in this category yet."}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Staff Modal ── */}
      <WorkforceAddStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleStaffAdded}
      />
    </div>
  );
}