// src/features/employer/hrManagement/pages/HRManagementPage.tsx
//
// HR Management — admin/office work hub.
// Color: Purple #7c3aed (--wm-er-accent-hr)

import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useHRCandidates } from "../helpers/hrSubscription";
import { HRCandidateCard } from "../components/HRCandidateCard";
import { HRStatsBar } from "../components/HRStatsBar";
import { HRSearchBar } from "../components/HRSearchBar";
import { HRFilterChips } from "../components/HRFilterChips";
import type { FilterId } from "../components/HRFilterChips";
import { HREmptyState } from "../components/HREmptyState";
import { RemindersBanner } from "../components/RemindersBanner";
import type { HRCandidateStatus } from "../types/hrManagement.types";
import { STATUS_TABS, GUIDE_KEY, matchesSearch, matchesFilter } from "../helpers/hrPageHelpers";
import type { TabKey } from "../helpers/hrPageHelpers";
import { HRTabBar, NoSearchResults, NoTeamMembers } from "../components/HRPageSections";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconHR() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Nav Item                                         */
/* ------------------------------------------------ */
function HRNavItem({ label, description, onClick }: { label: string; description: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        width: "100%", padding: "12px 14px", borderRadius: 10,
        border: "1px solid var(--wm-er-accent-hr-border)", background: "#fff",
        cursor: "pointer", textAlign: "left",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: "var(--wm-er-text)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>{description}</div>
      </div>
      <span style={{ fontSize: 18, color: "var(--wm-er-muted)", flexShrink: 0 }}>›</span>
    </button>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function HRManagementPage() {
  const nav = useNavigate();
  const allRecords = useHRCandidates();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const [guideDismissed, setGuideDismissed] = useState(() => localStorage.getItem(GUIDE_KEY) === "1");

  const handleDismissGuide = useCallback(() => {
    localStorage.setItem(GUIDE_KEY, "1");
    setGuideDismissed(true);
  }, []);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    counts["all"] = allRecords.length;
    for (const key of STATUS_TABS) {
      counts[key] = allRecords.filter((r) => r.status === key).length;
    }
    return counts;
  }, [allRecords]);

  const filtered = useMemo(() => {
    return allRecords
      .filter((r) => activeTab === "all" || r.status === activeTab)
      .filter((r) => matchesSearch(r, searchQuery))
      .filter((r) => matchesFilter(r, activeFilter));
  }, [allRecords, activeTab, searchQuery, activeFilter]);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setActiveFilter("all");
  }, []);

  const showFilters = activeTab === "active" && allRecords.filter((r) => r.status === "active").length >= 2;
  const showEmptyState = activeTab !== "all" && filtered.length === 0 && searchQuery.length === 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--wm-er-accent-hr-light)", color: "var(--wm-er-accent-hr)",
          }}>
            <IconHR />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "var(--wm-er-text)" }}>HR Management</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              Hiring pipeline, leave, reviews, and exit processing.
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <HRNavItem label="My Staff Directory" description="View all staff, categories, and exit processing" onClick={() => nav(ROUTE_PATHS.employerMyStaff)} />
          <HRNavItem label="Verify Employee" description="Look up employee ID, view profile and documents" onClick={() => nav("/employer/vault")} />
        </div>
      </div>

      {/* First Visit Guide */}
      {!guideDismissed && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            border: "1px solid var(--wm-er-accent-hr-border)", background: "var(--wm-er-accent-hr-light)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 12, color: "var(--wm-er-accent-hr)" }}>New to HR Management?</div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>Manage your team from hiring to exit – all in one place.</div>
            </div>
            <button className="wm-primarybtn" type="button" onClick={handleDismissGuide}
              style={{ fontSize: 11, padding: "5px 14px", flexShrink: 0, background: "var(--wm-er-accent-hr)" }}>
              Got it
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}><RemindersBanner /></div>
      <div style={{ marginBottom: 12 }}><HRStatsBar records={allRecords} /></div>
      <div style={{ marginBottom: 12 }}><HRSearchBar value={searchQuery} onChange={setSearchQuery} /></div>

      <HRTabBar activeTab={activeTab} tabCounts={tabCounts} showFilters={showFilters} onTabChange={handleTabChange} />

      {showFilters && (
        <div style={{ marginBottom: 12 }}><HRFilterChips activeFilter={activeFilter} onChange={setActiveFilter} /></div>
      )}

      {searchQuery.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", marginBottom: 8 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </div>
      )}

      {filtered.length === 0 ? (
        searchQuery.length > 0 ? <NoSearchResults />
          : showEmptyState ? <HREmptyState tab={activeTab as HRCandidateStatus} />
          : <NoTeamMembers />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((record) => (
            <HRCandidateCard key={record.id} record={record}
              onClick={() => nav(`/employer/hr/candidate/${record.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
