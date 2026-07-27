// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminAlertsPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\pages\AdminAlertsPage.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { AdminAlertsEventList } from "../components/AdminAlertsEventList";
import { AdminAlertsFilters } from "../components/AdminAlertsFilters";
import { AdminAlertsHeader } from "../components/AdminAlertsHeader";
import { AdminAlertsPagination } from "../components/AdminAlertsPagination";
import {
  PAGE_SIZE,
  collectKinds,
  dateFilterMs,
  fmtDate,
  kindLabel,
  relativeTime,
  snap,
  subscribe,
  type DateFilter,
  type DomainFilter,
} from "./AdminAlertsPage.helpers";

export function AdminAlertsPage() {
  const allEntries = useSyncExternalStore(subscribe, snap, snap);
  const allKinds = useMemo(() => collectKinds(allEntries), [allEntries]);

  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const minTimestamp = dateFilterMs(dateFilter);
    const query = searchText.trim().toLowerCase();

    return allEntries.filter((entry) => {
      if (domainFilter !== "all" && entry.domain !== domainFilter) return false;
      if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
      if (minTimestamp > 0 && entry.createdAt < minTimestamp) return false;

      if (query) {
        const haystack = `${entry.title} ${entry.body ?? ""} ${entry.kind}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [allEntries, domainFilter, kindFilter, dateFilter, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageEntries = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function toggleExpand(id: string) {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function setDomainAndReset(value: DomainFilter) {
    setDomainFilter(value);
    setPage(0);
  }

  function setKindAndReset(value: string) {
    setKindFilter(value);
    setPage(0);
  }

  function setDateAndReset(value: DateFilter) {
    setDateFilter(value);
    setPage(0);
  }

  function setSearchAndReset(value: string) {
    setSearchText(value);
    setPage(0);
  }

  return (
    <div className="wm-ad-fadeIn">
      <AdminAlertsHeader totalEvents={allEntries.length} />

      <AdminAlertsFilters
        searchText={searchText}
        domainFilter={domainFilter}
        kindFilter={kindFilter}
        dateFilter={dateFilter}
        allKinds={allKinds}
        getKindLabel={kindLabel}
        onSearchChange={setSearchAndReset}
        onDomainChange={setDomainAndReset}
        onKindChange={setKindAndReset}
        onDateChange={setDateAndReset}
      />

      <AdminAlertsEventList
        filteredCount={filtered.length}
        pageEntries={pageEntries}
        expandedIds={expandedIds}
        onToggle={toggleExpand}
        getKindLabel={kindLabel}
        formatDate={fmtDate}
        formatRelativeTime={relativeTime}
      />

      <AdminAlertsPagination
        totalPages={totalPages}
        safePage={safePage}
        onPrevious={() => setPage(safePage - 1)}
        onNext={() => setPage(safePage + 1)}
      />

      <div style={{ height: 24 }} />
    </div>
  );
}
