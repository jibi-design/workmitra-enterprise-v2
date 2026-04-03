// src/features/employer/hrManagement/pages/BulkNotificationsPage.tsx
//
// Bulk Notifications — send notices to All / Department / Location / Specific.

import { useState, useEffect, useMemo } from "react";
import { companyNoticeStorage } from "../storage/companyNotice.storage";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import type { CompanyNotice, NoticeTarget } from "../types/companyNotice.types";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { TARGET_OPTIONS, NOTIF_INPUT_STYLE, NOTIF_LABEL_STYLE } from "../helpers/bulkNotificationsHelpers";
import type { ExtendedTarget } from "../helpers/bulkNotificationsHelpers";
import { NoticeCard } from "../components/NoticeCard";

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function BulkNotificationsPage() {
  /* ---- Form state ---- */
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<ExtendedTarget>("all");
  const [targetValue, setTargetValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [empSearch, setEmpSearch] = useState("");

  /* ---- Data ---- */
  const [notices, setNotices] = useState<CompanyNotice[]>(() => companyNoticeStorage.getAll());
  const [departments] = useState<string[]>(() => companyNoticeStorage.getAvailableDepartments());
  const [locations] = useState<string[]>(() => companyNoticeStorage.getAvailableLocations());
  const [employees] = useState<HRCandidateRecord[]>(() =>
    hrManagementStorage.getAll().filter((r) => r.status === "active"),
  );

  /* ---- UI state ---- */
  const [sendConfirm, setSendConfirm] = useState<ConfirmData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const refresh = () => setNotices(companyNoticeStorage.getAll());
    refresh();
    return companyNoticeStorage.subscribe(refresh);
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!empSearch.trim()) return employees;
    const q = empSearch.toLowerCase().trim();
    return employees.filter((r) =>
      r.employeeName.toLowerCase().includes(q) ||
      r.jobTitle.toLowerCase().includes(q) ||
      (r.department?.toLowerCase().includes(q) ?? false) ||
      (r.location?.toLowerCase().includes(q) ?? false)
    );
  }, [employees, empSearch]);

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const canSend = title.trim().length > 0 && body.trim().length > 0 && (
    target === "all" ||
    (target === "department" && targetValue.length > 0) ||
    (target === "location" && targetValue.length > 0) ||
    (target === "specific" && selectedIds.size > 0)
  );

  const displayNotices = showAll ? notices : notices.slice(0, 5);

  /* ---- Send ---- */
  const handleSendRequest = () => {
    if (!canSend) return;

    let targetLabel: string;
    let recipientCount: number;

    if (target === "all") {
      targetLabel = "all employees";
      recipientCount = employees.length;
    } else if (target === "department") {
      targetLabel = `department "${targetValue}"`;
      recipientCount = employees.filter((r) => r.department?.trim().toLowerCase() === targetValue.toLowerCase()).length;
    } else if (target === "location") {
      targetLabel = `location "${targetValue}"`;
      recipientCount = employees.filter((r) => r.location?.trim().toLowerCase() === targetValue.toLowerCase()).length;
    } else {
      targetLabel = `${selectedIds.size} specific employee${selectedIds.size > 1 ? "s" : ""}`;
      recipientCount = selectedIds.size;
    }

    setSendConfirm({
      title: "Send Notice",
      message: `This will send "${title.trim()}" to ${targetLabel} (${recipientCount} recipient${recipientCount > 1 ? "s" : ""}). All selected employees will see this in their app.`,
      tone: "neutral",
      confirmLabel: `Send to ${recipientCount}`,
      cancelLabel: "Cancel",
    });
  };

  const handleSendConfirm = () => {
    if (target === "specific") {
      const key = "wm_company_notices_v1";
      const existing = (() => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return [];
          return JSON.parse(raw) as CompanyNotice[];
        } catch { return []; }
      })();

      const notice: CompanyNotice = {
        id: "ntc_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
        title: title.trim(),
        body: body.trim(),
        target: "all",
        targetValue: "Specific Employees",
        recipientCount: selectedIds.size,
        recipientIds: [...selectedIds],
        readReceipts: [],
        createdAt: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify([notice, ...existing]));
      window.dispatchEvent(new Event("wm:company-notices-changed"));
    } else {
      companyNoticeStorage.sendNotice({ title, body, target: target as NoticeTarget, targetValue });
    }

    setTitle("");
    setBody("");
    setTarget("all");
    setTargetValue("");
    setSelectedIds(new Set());
    setEmpSearch("");
    setSendConfirm(null);
    setSuccessMessage("Notice sent successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  /* ---- Delete ---- */
  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirm({
      title: "Delete Notice",
      message: "This will permanently delete this notice. Employees will no longer see it.",
      tone: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Keep",
    });
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId) companyNoticeStorage.deleteNotice(pendingDeleteId);
    setPendingDeleteId(null);
    setDeleteConfirm(null);
  };

  /* ---- Render ---- */
  return (
    <div>
      

      {/* Header */}
      <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: "rgba(3, 105, 161,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#0369a1" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: "var(--wm-er-text)" }}>Company Notices</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
              Send notices to all employees, teams, or specific people – no WhatsApp needed
            </div>
          </div>
        </div>
        {successMessage && (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            fontSize: 13, fontWeight: 700, color: "#15803d",
          }}>{successMessage}</div>
        )}
      </div>

      {/* Create Notice */}
      <div style={{
        marginTop: 10, padding: 16, background: "#fff", borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>Create Notice</div>

        <div>
          <label style={NOTIF_LABEL_STYLE}>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Office closed tomorrow" style={NOTIF_INPUT_STYLE} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={NOTIF_LABEL_STYLE}>Message *</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="Write your notice here..." rows={4}
            style={{ ...NOTIF_INPUT_STYLE, resize: "vertical" }} />
        </div>

        {/* Target Selection */}
        <div style={{ marginTop: 14 }}>
          <label style={NOTIF_LABEL_STYLE}>Send To</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TARGET_OPTIONS.map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => { setTarget(opt.value); setTargetValue(""); setSelectedIds(new Set()); setEmpSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 12px", textAlign: "left", width: "100%",
                  border: target === opt.value ? "2px solid var(--wm-er-accent-console, #0369a1)" : "1px solid var(--wm-er-border, #e5e7eb)",
                  borderRadius: 8,
                  background: target === opt.value ? "rgba(3, 105, 161,0.04)" : "#fff",
                  cursor: "pointer",
                }}>
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: `2px solid ${target === opt.value ? "var(--wm-er-accent-console, #0369a1)" : "var(--wm-er-border, #e5e7eb)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {target === opt.value && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--wm-er-accent-console, #0369a1)" }} />
                  )}
                </span>
                <div>
                  <div style={{ fontWeight: target === opt.value ? 800 : 600, fontSize: 13, color: "var(--wm-er-text)" }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>{opt.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Department Selector */}
        {target === "department" && (
          <div style={{ marginTop: 12 }}>
            <label style={NOTIF_LABEL_STYLE}>Select Department *</label>
            {departments.length > 0 ? (
              <select value={targetValue} onChange={(e) => setTargetValue(e.target.value)} style={{ ...NOTIF_INPUT_STYLE, cursor: "pointer" }}>
                <option value="">Choose department...</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: "8px 0" }}>No departments found. Assign departments to employees first.</div>
            )}
          </div>
        )}

        {/* Location Selector */}
        {target === "location" && (
          <div style={{ marginTop: 12 }}>
            <label style={NOTIF_LABEL_STYLE}>Select Location / Site *</label>
            {locations.length > 0 ? (
              <select value={targetValue} onChange={(e) => setTargetValue(e.target.value)} style={{ ...NOTIF_INPUT_STYLE, cursor: "pointer" }}>
                <option value="">Choose location...</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            ) : (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: "8px 0" }}>No locations found. Assign locations to employees first.</div>
            )}
          </div>
        )}

        {/* Specific Employees Selector */}
        {target === "specific" && (
          <div style={{ marginTop: 12 }}>
            <label style={NOTIF_LABEL_STYLE}>
              Select Employees * {selectedIds.size > 0 && (
                <span style={{ fontWeight: 600, color: "var(--wm-er-accent-console)" }}>({selectedIds.size} selected)</span>
              )}
            </label>
            <input type="text" value={empSearch} onChange={(e) => setEmpSearch(e.target.value)}
              placeholder="Search by name, role, department..."
              style={{ ...NOTIF_INPUT_STYLE, marginBottom: 8 }} />

            <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredEmployees.map((record) => {
                const isSelected = selectedIds.has(record.id);
                return (
                  <button key={record.id} type="button" onClick={() => toggleEmployee(record.id)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", textAlign: "left", width: "100%",
                    border: isSelected ? "2px solid var(--wm-er-accent-console, #0369a1)" : "1px solid var(--wm-er-border, #e5e7eb)",
                    borderRadius: 8,
                    background: isSelected ? "rgba(3, 105, 161,0.04)" : "#fff",
                    cursor: "pointer",
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `2px solid ${isSelected ? "var(--wm-er-accent-console, #0369a1)" : "var(--wm-er-border, #e5e7eb)"}`,
                      background: isSelected ? "var(--wm-er-accent-console, #0369a1)" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24"><path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      )}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {record.employeeName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
                        {record.jobTitle}{record.department && ` · ${record.department}`}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredEmployees.length === 0 && (
                <div style={{ textAlign: "center", padding: "16px 0", color: "var(--wm-er-muted)", fontSize: 12 }}>
                  {employees.length === 0 ? "No active employees." : "No employees match your search."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send */}
        <button className="wm-primarybtn" type="button" onClick={handleSendRequest}
          disabled={!canSend} style={{ width: "100%", marginTop: 16, opacity: canSend ? 1 : 0.5 }}>
          {target === "specific" && selectedIds.size > 0
            ? `Send Notice to ${selectedIds.size} Employee${selectedIds.size > 1 ? "s" : ""}`
            : "Send Notice"
          }
        </button>
      </div>

      {/* Sent History */}
      <div style={{
        marginTop: 10, padding: 16, background: "#fff", borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)", marginBottom: 32,
      }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>
          Sent Notices ({notices.length})
        </div>
        {notices.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} onDelete={handleDeleteRequest} />
            ))}
            {notices.length > 5 && !showAll && (
              <button type="button" onClick={() => setShowAll(true)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 800, color: "var(--wm-er-accent-console)", marginTop: 4, padding: 0,
              }}>View all {notices.length} notices →</button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
            No notices sent yet.
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal confirm={sendConfirm} onConfirm={handleSendConfirm} onCancel={() => setSendConfirm(null)} />
      <ConfirmModal confirm={deleteConfirm} onConfirm={handleDeleteConfirm}
        onCancel={() => { setPendingDeleteId(null); setDeleteConfirm(null); }} />
    </div>
  );
}
