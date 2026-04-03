// src/features/admin/oversight/pages/AdminUsersPage.tsx
//
// User Management — Employer and Employee lists with search,
// status badges (Active/Suspended/Blocked), and management actions.
// Phase-0 localStorage. v5 light premium theme.

import { useState, useMemo, useCallback } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import {
  getEmployerList,
  getEmployeeList,
  setUserStatus,
  type AdminEmployerRecord,
  type AdminEmployeeRecord,
  type UserStatus,
} from "../helpers/adminDataHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge Styles
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<UserStatus, { bg: string; color: string; border: string; label: string }> = {
  active: { bg: "var(--wm-ad-green-dim)", color: "var(--wm-ad-green)", border: "var(--wm-ad-green-border)", label: "Active" },
  suspended: { bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.20)", label: "Suspended" },
  blocked: { bg: "var(--wm-ad-danger-dim)", color: "var(--wm-ad-danger)", border: "rgba(220,38,38,0.18)", label: "Blocked" },
};

function StatusBadge({ status }: { status: UserStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      style={{
        fontSize: 9.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        letterSpacing: 0.6, textTransform: "uppercase",
      }}
    >
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab type
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "employers" | "employees";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>("employers");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [actionModal, setActionModal] = useState<{
    open: boolean;
    userId: string;
    role: "employer" | "employee";
    userName: string;
    currentStatus: UserStatus;
    targetStatus: UserStatus;
  }>({ open: false, userId: "", role: "employer", userName: "", currentStatus: "active", targetStatus: "suspended" });
  const [actionReason, setActionReason] = useState("");

  const employers = useMemo(() => getEmployerList(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const employees = useMemo(() => getEmployeeList(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredEmployers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employers;
    return employers.filter((e) =>
      `${e.companyName} ${e.fullName} ${e.email}`.toLowerCase().includes(q),
    );
  }, [employers, search]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.fullName} ${e.uniqueId} ${e.city} ${e.skills.join(" ")}`.toLowerCase().includes(q),
    );
  }, [employees, search]);

  const openAction = useCallback((userId: string, role: "employer" | "employee", userName: string, currentStatus: UserStatus, targetStatus: UserStatus) => {
    setActionModal({ open: true, userId, role, userName, currentStatus, targetStatus });
    setActionReason("");
  }, []);

  const executeAction = useCallback(() => {
    setUserStatus(actionModal.userId, actionModal.role, actionModal.targetStatus, actionReason);
    setActionModal((prev) => ({ ...prev, open: false }));
    setRefreshKey((k) => k + 1);
  }, [actionModal, actionReason]);

  return (
    <div className="wm-ad-fadeIn">
      {/* Action Modal */}
      <CenterModal open={actionModal.open} onBackdropClose={() => setActionModal((p) => ({ ...p, open: false }))} ariaLabel="User Action">
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 1000, color: actionModal.targetStatus === "blocked" ? "var(--wm-ad-danger)" : actionModal.targetStatus === "active" ? "var(--wm-ad-green)" : "#d97706" }}>
            {actionModal.targetStatus === "active" ? "Reactivate" : actionModal.targetStatus === "suspended" ? "Suspend" : "Block"} User?
          </div>
          <div style={{ fontSize: 13, color: "var(--wm-ad-navy-500)", marginTop: 8, lineHeight: 1.6 }}>
            {actionModal.targetStatus === "active"
              ? `Reactivate ${actionModal.userName}. They will regain full access.`
              : actionModal.targetStatus === "suspended"
                ? `Temporarily suspend ${actionModal.userName}. They can be reactivated later.`
                : `Permanently block ${actionModal.userName}. Data will be retained but access removed.`}
          </div>
          {actionModal.targetStatus !== "active" && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-ad-navy-400)", marginBottom: 6 }}>Reason (required)</div>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for this action..."
                style={{
                  width: "100%", padding: "10px 12px", fontSize: 13, fontWeight: 600,
                  border: "1px solid var(--wm-ad-border)", borderRadius: 10,
                  background: "var(--wm-ad-card-inner)", color: "var(--wm-ad-navy)",
                  resize: "vertical", minHeight: 60, outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" onClick={() => setActionModal((p) => ({ ...p, open: false }))} style={{ fontSize: 13, fontWeight: 800, padding: "8px 16px", borderRadius: 10, border: "1px solid var(--wm-ad-border)", background: "var(--wm-ad-white)", color: "var(--wm-ad-navy)", cursor: "pointer" }}>
              Cancel
            </button>
            <button
              type="button"
              disabled={actionModal.targetStatus !== "active" && !actionReason.trim()}
              onClick={executeAction}
              style={{
                fontSize: 13, fontWeight: 900, padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                background: actionModal.targetStatus === "active" ? "var(--wm-ad-green)" : actionModal.targetStatus === "suspended" ? "#d97706" : "var(--wm-ad-danger)",
                color: "#fff", opacity: actionModal.targetStatus !== "active" && !actionReason.trim() ? 0.4 : 1,
              }}
            >
              {actionModal.targetStatus === "active" ? "Reactivate" : actionModal.targetStatus === "suspended" ? "Suspend" : "Block"}
            </button>
          </div>
        </div>
      </CenterModal>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, color: "var(--wm-ad-navy)" }}>User Management</div>
        <div style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginTop: 4 }}>
          {employers.length} employer{employers.length !== 1 ? "s" : ""}, {employees.length} employee{employees.length !== 1 ? "s" : ""} registered
        </div>
      </div>

      {/* Tab Toggle */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "var(--wm-ad-card-inner)", borderRadius: "var(--wm-ad-ri)", border: "1px solid var(--wm-ad-border)", padding: 3 }}>
        {(["employers", "employees"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setSearch(""); }}
            style={{
              flex: 1, padding: "10px 0", fontSize: 13, fontWeight: tab === t ? 800 : 600,
              color: tab === t ? "var(--wm-ad-navy)" : "var(--wm-ad-navy-400)",
              background: tab === t ? "var(--wm-ad-white)" : "transparent",
              border: "none", borderRadius: 9, cursor: "pointer",
              boxShadow: tab === t ? "var(--wm-ad-sh)" : "none",
              transition: "all 0.15s",
            }}
          >
            {t === "employers" ? `Employers (${employers.length})` : `Employees (${employees.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        className="wm-ad-searchInput"
        placeholder={tab === "employers" ? "Search by company, name, email..." : "Search by name, ID, city, skills..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* List */}
      {tab === "employers" ? (
        filteredEmployers.length === 0 ? (
          <div className="wm-ad-empty">
            {employers.length === 0 ? "No employers registered yet. Complete employer profile to see data here." : "No employers match your search."}
          </div>
        ) : (
          filteredEmployers.map((emp) => (
            <EmployerCard key={emp.id} emp={emp} onAction={openAction} />
          ))
        )
      ) : (
        filteredEmployees.length === 0 ? (
          <div className="wm-ad-empty">
            {employees.length === 0 ? "No employees registered yet. Complete employee profile to see data here." : "No employees match your search."}
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.id} emp={emp} onAction={openAction} />
          ))
        )
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employer Card
// ─────────────────────────────────────────────────────────────────────────────

function EmployerCard({ emp, onAction }: {
  emp: AdminEmployerRecord;
  onAction: (id: string, role: "employer" | "employee", name: string, current: UserStatus, target: UserStatus) => void;
}) {
  return (
    <div className="wm-ad-domainCard" style={{ marginTop: 10, paddingLeft: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-ad-navy)" }}>{emp.companyName || "Unnamed Company"}</div>
          {emp.fullName && <div style={{ fontSize: 12, color: "var(--wm-ad-navy-500)", marginTop: 2 }}>{emp.fullName}</div>}
          {emp.location && <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 2 }}>{emp.location}</div>}
        </div>
        <StatusBadge status={emp.status} />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <Stat label="Shift Posts" value={emp.totalShiftPosts} />
        <Stat label="Career Posts" value={emp.totalCareerPosts} />
        <Stat label="Total Hires" value={emp.totalHires} />
      </div>
      {emp.industryType && <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 8 }}>Industry: {emp.industryType} · Size: {emp.companySize || "N/A"}</div>}
      <ActionRow id={emp.id} role="employer" name={emp.companyName} status={emp.status} onAction={onAction} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee Card
// ─────────────────────────────────────────────────────────────────────────────

function EmployeeCard({ emp, onAction }: {
  emp: AdminEmployeeRecord;
  onAction: (id: string, role: "employer" | "employee", name: string, current: UserStatus, target: UserStatus) => void;
}) {
  return (
    <div className="wm-ad-domainCard" style={{ marginTop: 10, paddingLeft: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-ad-navy)" }}>{emp.fullName || "Unnamed Employee"}</div>
          <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 2 }}>
            ID: {emp.uniqueId}{emp.city ? ` · ${emp.city}` : ""}
          </div>
        </div>
        <StatusBadge status={emp.status} />
      </div>
      {/* Profile completion */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--wm-ad-navy-400)", marginBottom: 4 }}>
          <span>Profile completion</span>
          <span style={{ color: emp.profileCompletion >= 80 ? "var(--wm-ad-green)" : emp.profileCompletion >= 50 ? "#d97706" : "var(--wm-ad-danger)" }}>{emp.profileCompletion}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "var(--wm-ad-divider)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 2, width: `${emp.profileCompletion}%`, background: emp.profileCompletion >= 80 ? "var(--wm-ad-green)" : emp.profileCompletion >= 50 ? "#d97706" : "var(--wm-ad-danger)", transition: "width 0.3s" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <Stat label="Shift Apps" value={emp.shiftApplications} />
        <Stat label="Career Apps" value={emp.careerApplications} />
        <Stat label="Total" value={emp.totalApplications} />
      </div>
      {emp.skills.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 8 }}>
          Skills: {emp.skills.slice(0, 5).join(", ")}{emp.skills.length > 5 ? ` +${emp.skills.length - 5}` : ""}
        </div>
      )}
      <ActionRow id={emp.id} role="employee" name={emp.fullName} status={emp.status} onAction={onAction} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-ad-navy)", letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--wm-ad-navy-400)", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 1 }}>{label}</div>
    </div>
  );
}

function ActionRow({ id, role, name, status, onAction }: {
  id: string; role: "employer" | "employee"; name: string; status: UserStatus;
  onAction: (id: string, role: "employer" | "employee", name: string, current: UserStatus, target: UserStatus) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
      {status === "active" && (
        <>
          <SmallBtn label="Suspend" color="#d97706" bg="rgba(245,158,11,0.08)" onClick={() => onAction(id, role, name, status, "suspended")} />
          <SmallBtn label="Block" color="var(--wm-ad-danger)" bg="var(--wm-ad-danger-dim)" onClick={() => onAction(id, role, name, status, "blocked")} />
        </>
      )}
      {status === "suspended" && (
        <>
          <SmallBtn label="Reactivate" color="var(--wm-ad-green)" bg="var(--wm-ad-green-dim)" onClick={() => onAction(id, role, name, status, "active")} />
          <SmallBtn label="Block" color="var(--wm-ad-danger)" bg="var(--wm-ad-danger-dim)" onClick={() => onAction(id, role, name, status, "blocked")} />
        </>
      )}
      {status === "blocked" && (
        <SmallBtn label="Reactivate" color="var(--wm-ad-green)" bg="var(--wm-ad-green-dim)" onClick={() => onAction(id, role, name, status, "active")} />
      )}
    </div>
  );
}

function SmallBtn({ label, color, bg, onClick }: { label: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 11, fontWeight: 800, padding: "6px 14px", borderRadius: 8,
        background: bg, border: `1px solid ${color}22`, color,
        cursor: "pointer", transition: "all 0.15s", letterSpacing: 0.2,
      }}
    >
      {label}
    </button>
  );
}