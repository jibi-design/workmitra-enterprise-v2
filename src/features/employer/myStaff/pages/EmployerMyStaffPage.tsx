// src/features/employer/myStaff/pages/EmployerMyStaffPage.tsx
//
// Employer "My Staff" main page.
// Domain: Ocean Blue #0369a1 (--wm-er-accent-console)
// Clean orchestrator — all sub-components split into separate files.

import { useState, useSyncExternalStore, useMemo } from "react";
import { myStaffStorage } from "../storage/myStaff.storage";
import { getStaffSnapshot, subscribeStaff } from "../helpers/myStaffSubscription";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { StaffCard } from "../components/StaffCard";
import { AddStaffModal } from "../components/AddStaffModal";
import { Users } from "lucide-react";

/* ─────────────────────────────────────────── */
/* Filter Pill                                 */
/* ─────────────────────────────────────────── */
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 999,
        border: active
          ? "1.5px solid var(--wm-er-accent-console, #0369a1)"
          : "1px solid var(--wm-er-border)",
        background: active
          ? "rgba(3,105,161,0.08)"
          : "var(--wm-er-bg)",
        color: active
          ? "var(--wm-er-accent-console, #0369a1)"
          : "var(--wm-er-muted)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────── */
/* Empty State                                 */
/* ─────────────────────────────────────────── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
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
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(3,105,161,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Users size={28} color="var(--wm-er-accent-console, #0369a1)" />
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--wm-er-text)",
          marginBottom: 6,
        }}
      >
        No staff added yet
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted)",
          lineHeight: 1.5,
          marginBottom: 20,
          maxWidth: 260,
        }}
      >
        Add your team here or hire employees through Career Jobs.
      </div>
      <button
        type="button"
        onClick={onAdd}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 22px",
          borderRadius: 10,
          border: "none",
          background: "var(--wm-er-accent-console, #0369a1)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
        </svg>
        Add Staff
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* Empty Search Result                         */
/* ─────────────────────────────────────────── */
function EmptySearch() {
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
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Users size={28} color="#94a3b8" />
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--wm-er-text)",
          marginBottom: 6,
        }}
      >
        No results found
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
        Try a different name, ID, or job title.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* Page                                        */
/* ─────────────────────────────────────────── */
export function EmployerMyStaffPage() {
  const staffList = useSyncExternalStore(subscribeStaff, getStaffSnapshot, getStaffSnapshot);
  const [nowMs] = useState(() => Date.now());

  const [searchQuery, setSearchQuery]     = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [notice, setNotice]               = useState<NoticeData | null>(null);
  const [showAddModal, setShowAddModal]   = useState(false);

  /* ── Categories ── */
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const s of staffList) {
      if (s.category) cats.add(s.category);
    }
    for (const c of myStaffStorage.getCategories()) {
      cats.add(c.name);
    }
    return Array.from(cats).sort();
  }, [staffList]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = staffList;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(q) ||
          s.employeeUniqueId.toLowerCase().includes(q) ||
          s.jobTitle.toLowerCase().includes(q),
      );
    }
    if (filterCategory) {
      list = list.filter((s) => s.category === filterCategory);
    }
    return list;
  }, [staffList, searchQuery, filterCategory]);

  const isSearching = Boolean(searchQuery.trim() || filterCategory);

  return (
    <div>
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />

      {/* ── Page Header ── */}
      <div className="wm-pageHead">
        <div style={{ flex: 1 }}>
          <div className="wm-pageTitle">My Staff</div>
          <div className="wm-pageSub">
            {staffList.length > 0
              ? `${staffList.length} active employee${staffList.length !== 1 ? "s" : ""}`
              : "No active employees"}
          </div>
        </div>
        {staffList.length > 0 && (
          <button
            className="wm-primarybtn"
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
            </svg>
            Add Staff
          </button>
        )}
      </div>

      {/* ── Search Bar (only when staff exists) ── */}
      {staffList.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or job title..."
            style={{
              width: "100%",
              height: 42,
              borderRadius: 12,
              border: "1.5px solid var(--wm-er-border)",
              background: "var(--wm-er-card)",
              padding: "0 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--wm-er-text)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* ── Category Filter (only when categories exist) ── */}
      {staffList.length > 0 && categories.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          <FilterPill
            label="All"
            active={filterCategory === ""}
            onClick={() => setFilterCategory("")}
          />
          {categories.map((cat) => (
            <FilterPill
              key={cat}
              label={cat}
              active={filterCategory === cat}
              onClick={() => setFilterCategory(cat === filterCategory ? "" : cat)}
            />
          ))}
        </div>
      )}

      {/* ── Staff List / Empty States ── */}
      {staffList.length === 0 ? (
        <EmptyState onAdd={() => setShowAddModal(true)} />
      ) : filtered.length === 0 && isSearching ? (
        <EmptySearch />
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {filtered.map((staff) => (
            <StaffCard key={staff.id} staff={staff} nowMs={nowMs} />
          ))}
        </div>
      )}

      {/* ── Add Staff Modal ── */}
      <AddStaffModal
        open={showAddModal}
        categories={categories}
        onClose={() => setShowAddModal(false)}
        onAdded={(name, title) => {
          setNotice({
            title: "Staff Added",
            message: `${name} has been added to your staff as ${title}.`,
            tone: "success",
          });
        }}
      />

      <div style={{ height: 32 }} />
    </div>
  );
}