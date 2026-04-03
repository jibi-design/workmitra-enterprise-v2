// src/features/employer/hrManagement/pages/StaffAvailabilityPage.tsx
//
// Staff Availability Request page (Root Map Section 7.4.13).
// Lists all requests with filter tabs. Create new + view details.

import { useState, useMemo } from "react";

import { useStaffAvailability } from "../helpers/staffAvailabilityHooks";
import { staffAvailabilityStorage } from "../storage/staffAvailability.storage";
import type { StaffAvailabilityRequest } from "../types/staffAvailability.types";
import { StaffAvailabilityRequestCard } from "../components/StaffAvailabilityRequestCard";
import { StaffAvailabilityDetailModal } from "../components/StaffAvailabilityDetailModal";
import { StaffAvailabilityCreateModal } from "../components/StaffAvailabilityCreateModal";

// ─────────────────────────────────────────────────────────────────────────────
// Filter Tabs
// ─────────────────────────────────────────────────────────────────────────────

type TabKey = "open" | "filled" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "filled", label: "Filled" },
  { key: "all", label: "All" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function StaffAvailabilityPage() {
  const allRequests = useStaffAvailability();
  const [tab, setTab] = useState<TabKey>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = useMemo(() => {
    if (tab === "open") return allRequests.filter((r) => r.status === "open");
    if (tab === "filled") return allRequests.filter((r) => r.status === "filled");
    return allRequests;
  }, [allRequests, tab]);

  const openCount = allRequests.filter((r) => r.status === "open").length;
  const filledCount = allRequests.filter((r) => r.status === "filled").length;

  const tabCounts: Record<TabKey, number> = {
    open: openCount,
    filled: filledCount,
    all: allRequests.length,
  };

  // Fresh data for detail modal
  const selectedRequest: StaffAvailabilityRequest | null = selectedId
    ? staffAvailabilityStorage.getById(selectedId)
    : null;

  const handleCreateSuccess = () => {
    setSuccessMsg("Availability request sent successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div>
      

      {/* Header */}
      <div style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
        marginBottom: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(180, 83, 9, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}>
              📋
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: "var(--wm-er-text)" }}>
                Staff Availability
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
                Request employees for shifts and tasks
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={() => setShowCreate(true)}
            style={{ fontSize: 12, padding: "8px 14px" }}
          >
            + New Request
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: 13,
            fontWeight: 700,
            color: "#15803d",
          }}>
            {successMsg}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex",
        gap: 0,
        marginBottom: 10,
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}>
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "9px 0",
                fontSize: 12,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#fff" : "var(--wm-er-muted)",
                background: isActive ? "#b45309" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t.label} ({tabCounts[t.key]})
            </button>
          );
        })}
      </div>

      {/* Request List */}
      {filtered.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((req) => (
            <StaffAvailabilityRequestCard
              key={req.id}
              request={req}
              onOpen={setSelectedId}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "32px 16px",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--wm-er-border, #e5e7eb)",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--wm-er-text)" }}>
            {tab === "open" ? "No open requests" : tab === "filled" ? "No filled requests" : "No requests yet"}
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
            {tab === "open"
              ? "Create a new request to check staff availability."
              : "Requests will appear here once created."}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <StaffAvailabilityDetailModal
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Create Modal */}
      <StaffAvailabilityCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
