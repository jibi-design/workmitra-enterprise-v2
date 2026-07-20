// App: Job Mitra / WorkMitra_Enterprise_v2
// File: MyStaffListContent.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\MyStaffListContent.tsx

import type { ComponentProps } from "react";
import { Users } from "lucide-react";
import { StaffCard } from "./StaffCard";

type StaffItem = ComponentProps<typeof StaffCard>["staff"];

type Props = {
  staffList: StaffItem[];
  filtered: StaffItem[];
  isSearching: boolean;
  nowMs: number;
  onAdd: () => void;
};

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

export function MyStaffListContent({ staffList, filtered, isSearching, nowMs, onAdd }: Props) {
  if (staffList.length === 0) {
    return <EmptyState onAdd={onAdd} />;
  }

  if (filtered.length === 0 && isSearching) {
    return <EmptySearch />;
  }

  return (
    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
      {filtered.map((staff) => (
        <StaffCard key={staff.id} staff={staff} nowMs={nowMs} />
      ))}
    </div>
  );
}
