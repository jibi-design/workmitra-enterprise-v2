// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerMyStaffPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\pages\EmployerMyStaffPage.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { AddStaffModal } from "../components/AddStaffModal";
import { MyStaffHeader } from "../components/MyStaffHeader";
import { MyStaffListContent } from "../components/MyStaffListContent";
import { MyStaffSearchFilters } from "../components/MyStaffSearchFilters";
import { getStaffSnapshot, subscribeStaff } from "../helpers/myStaffSubscription";
import { myStaffStorage } from "../storage/myStaff.storage";

export function EmployerMyStaffPage() {
  const staffList = useSyncExternalStore(subscribeStaff, getStaffSnapshot, getStaffSnapshot);
  const [nowMs] = useState(() => Date.now());

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = useMemo(() => {
    const nextCategories = new Set<string>();

    for (const staff of staffList) {
      if (staff.category) nextCategories.add(staff.category);
    }

    for (const category of myStaffStorage.getCategories()) {
      nextCategories.add(category.name);
    }

    return Array.from(nextCategories).sort();
  }, [staffList]);

  const filtered = useMemo(() => {
    let list = staffList;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      list = list.filter(
        (staff) =>
          staff.employeeName.toLowerCase().includes(query) ||
          staff.employeeUniqueId.toLowerCase().includes(query) ||
          staff.jobTitle.toLowerCase().includes(query),
      );
    }

    if (filterCategory) {
      list = list.filter((staff) => staff.category === filterCategory);
    }

    return list;
  }, [staffList, searchQuery, filterCategory]);

  const isSearching = Boolean(searchQuery.trim() || filterCategory);

  return (
    <div>
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />

      <MyStaffHeader staffCount={staffList.length} onAdd={() => setShowAddModal(true)} />

      <MyStaffSearchFilters
        staffCount={staffList.length}
        categories={categories}
        searchQuery={searchQuery}
        filterCategory={filterCategory}
        onSearchChange={setSearchQuery}
        onFilterCategoryChange={setFilterCategory}
      />

      <MyStaffListContent
        staffList={staffList}
        filtered={filtered}
        isSearching={isSearching}
        nowMs={nowMs}
        onAdd={() => setShowAddModal(true)}
      />

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
