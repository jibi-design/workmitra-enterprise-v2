// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\pages\EmployerWorkforceStaffPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import type {
  WorkforceCategory,
  WorkforceStaff,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  WF_CATEGORIES_CHANGED,
  WF_STAFF_CHANGED,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { EmployerWorkforceStaffFilters } from "../components/EmployerWorkforceStaffFilters";
import { EmployerWorkforceStaffHeader } from "../components/EmployerWorkforceStaffHeader";
import { EmployerWorkforceStaffList } from "../components/EmployerWorkforceStaffList";
import { WorkforceAddStaffModal } from "../components/WorkforceAddStaffModal";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceStaffService } from "../services/workforceStaffService";

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

  const handler = () => {
    snapVer++;
    snapCache = null;
    cb();
  };

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }

  window.addEventListener("storage", handler);

  return () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }

    window.removeEventListener("storage", handler);
  };
}

function buildCategoryMap(categories: WorkforceCategory[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const category of categories) {
    map.set(category.id, category.name);
  }

  return map;
}

export function EmployerWorkforceStaffPage() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const nav = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const categoryMap = useMemo(() => buildCategoryMap(data.categories), [data.categories]);

  const filteredStaff = useMemo(() => {
    let list = data.staff;

    if (selectedCategoryId) {
      list = list.filter((staff) => staff.categories.includes(selectedCategoryId));
    }

    const query = searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter(
        (staff) =>
          staff.employeeName.toLowerCase().includes(query) ||
          staff.employeeUniqueId.toLowerCase().includes(query) ||
          staff.employeeCity.toLowerCase().includes(query) ||
          staff.categories.some((catId) =>
            (categoryMap.get(catId) ?? "").toLowerCase().includes(query),
          ),
      );
    }

    return list;
  }, [categoryMap, data.staff, searchQuery, selectedCategoryId]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const staff of data.staff) {
      for (const catId of staff.categories) {
        counts.set(catId, (counts.get(catId) ?? 0) + 1);
      }
    }

    return counts;
  }, [data.staff]);

  const openStaffDetail = useCallback(
    (staffId: string) => {
      nav(`/employer/workforce/staff/${staffId}`);
    },
    [nav],
  );

  const handleStaffAdded = useCallback(() => {
    snapVer++;
  }, []);

  return (
    <div className="wm-er-vWorkforce">
      <EmployerWorkforceStaffHeader
        staffCount={data.staff.length}
        onBack={() => nav(-1)}
        onAddStaff={() => setShowAddModal(true)}
      />

      <EmployerWorkforceStaffFilters
        searchQuery={searchQuery}
        selectedCategoryId={selectedCategoryId}
        categories={data.categories}
        staffCount={data.staff.length}
        categoryCounts={categoryCounts}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategoryId}
      />

      <EmployerWorkforceStaffList
        staff={filteredStaff}
        allStaffCount={data.staff.length}
        searchQuery={searchQuery}
        categoryMap={categoryMap}
        onOpenStaff={openStaffDetail}
        onAddStaff={() => setShowAddModal(true)}
      />

      <WorkforceAddStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleStaffAdded}
      />
    </div>
  );
}
