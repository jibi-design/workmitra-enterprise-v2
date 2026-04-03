// src/features/employer/workforceOps/pages/EmployerWorkforceAnnounceDashPage.tsx
//
// Workforce Ops Hub — Announcement Dashboard.
// View details, analyze applications, confirm selections, create group.

import { useMemo, useSyncExternalStore, useState, useCallback } from "react";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import { workforceGroupService } from "../services/workforceGroupService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type {
  WorkforceAnnouncement,
  WorkforceApplication,
} from "../types/workforceTypes";
import {
  WF_ANNOUNCEMENTS_CHANGED,
  WF_APPLICATIONS_KEY,
  WF_APPLICATIONS_CHANGED,
  WF_CATEGORIES_CHANGED,
  WF_GROUPS_CHANGED,
} from "../helpers/workforceStorageUtils";
import { readApplications } from "../helpers/workforceNormalizers";
import { IconBack, IconStar } from "../components/workforceIcons";
import { AMBER, statusBadgeStyle } from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  announcementId: string;
  onBack: () => void;
  onGroupCreated?: (groupId: string) => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Subscription                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type DashSnapshot = {
  announcement: WorkforceAnnouncement | null;
  applications: WorkforceApplication[];
  categoryMap: Map<string, string>;
  ver: number;
};

let snapCache: DashSnapshot | null = null;
let snapVer = 0;
let cachedAnnId = "";

function getSnapshot(annId: string): () => DashSnapshot {
  return () => {
    if (snapCache && snapCache.ver === snapVer && cachedAnnId === annId) return snapCache;
    cachedAnnId = annId;
    const announcement = workforceAnnouncementService.getById(annId);
    const applications = readApplications(WF_APPLICATIONS_KEY).filter((a) => a.announcementId === annId);
    const cats = workforceCategoryService.getAll();
    const categoryMap = new Map<string, string>();
    for (const c of cats) categoryMap.set(c.id, c.name);
    snapCache = { announcement, applications, categoryMap, ver: snapVer };
    return snapCache;
  };
}

function subscribe(cb: () => void): () => void {
  const events = [WF_ANNOUNCEMENTS_CHANGED, WF_APPLICATIONS_CHANGED, WF_CATEGORIES_CHANGED, WF_GROUPS_CHANGED];
  const handler = () => { snapVer++; snapCache = null; cb(); };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Status Helpers                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function annStatusColor(status: WorkforceAnnouncement["status"]): string {
  switch (status) {
    case "open": return AMBER;
    case "analyzing": return "var(--wm-warning)";
    case "confirmed": return "var(--wm-success)";
    case "completed": return "var(--wm-er-muted)";
    case "cancelled": return "var(--wm-error)";
  }
}

function appStatusColor(status: WorkforceApplication["status"]): string {
  switch (status) {
    case "applied": return "var(--wm-er-text)";
    case "selected": return "var(--wm-success)";
    case "waiting": return "var(--wm-warning)";
    case "not_selected": return "var(--wm-er-muted)";
    case "confirmed": return "var(--wm-success)";
    case "cancelled": return "var(--wm-error)";
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const backBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center",
};

const detailRowStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "6px 0", borderBottom: "1px solid var(--wm-er-border)",
};

const applicantCardStyle: React.CSSProperties = {
  padding: "10px 12px", borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)", background: "var(--wm-er-card)",
};

const actionSmBtnStyle = (color: string): React.CSSProperties => ({
  padding: "4px 10px", borderRadius: 6, border: `1px solid ${color}`,
  background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 800, color,
});

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceAnnounceDashPage({ announcementId, onBack, onGroupCreated }: Props) {
  const snapshotFn = useMemo(() => getSnapshot(announcementId), [announcementId]);
  const data = useSyncExternalStore(subscribe, snapshotFn, snapshotFn);

  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [confirmGroupOpen, setConfirmGroupOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  /* ── Applications grouped by category × shift ── */
  const groupedApps = useMemo(() => {
    const groups = new Map<string, WorkforceApplication[]>();
    for (const app of data.applications) {
      for (const shiftId of app.shiftIds) {
        const key = `${app.categoryId}__${shiftId}`;
        const list = groups.get(key) ?? [];
        list.push(app);
        groups.set(key, list);
      }
    }
    for (const [key, list] of groups) {
      groups.set(key, list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
    }
    return groups;
  }, [data.applications]);

  const handleStatusChange = useCallback((newStatus: WorkforceAnnouncement["status"]) => {
    const result = workforceAnnouncementService.updateStatus(announcementId, newStatus);
    if (!result.success) setActionError(result.errors?.[0] ?? "Failed.");
    else { setActionError(""); snapVer++; }
  }, [announcementId]);

  const handleSaveTemplate = useCallback(() => {
    const result = workforceAnnouncementService.saveAsTemplate(announcementId, templateName);
    if (result.success) { setSaveTemplateOpen(false); setTemplateName(""); setTemplateError(""); }
    else setTemplateError(result.errors?.[0] ?? "Failed.");
  }, [announcementId, templateName]);

  const handleConfirmGroup = useCallback(() => {
    if (!data.announcement) return;
    const selectedApps = data.applications.filter((a) => a.status === "selected" || a.status === "confirmed");
    if (selectedApps.length === 0) {
      setActionError("No selected applicants. Analyze and select staff first.");
      return;
    }
    const confirmedMembers = selectedApps.map((a) => ({
      staffId: a.staffId, employeeUniqueId: a.employeeUniqueId,
      employeeName: a.employeeName, categoryId: a.categoryId, assignedShiftIds: a.shiftIds,
    }));
    const result = workforceGroupService.createFromAnnouncement({ announcement: data.announcement, confirmedMembers });
    if (result.success && result.groupId) {
      workforceAnnouncementService.updateStatus(announcementId, "confirmed");
      setConfirmGroupOpen(false);
      onGroupCreated?.(result.groupId);
    } else {
      setActionError(result.errors?.[0] ?? "Failed to create group.");
    }
  }, [announcementId, data.announcement, data.applications, onGroupCreated]);

  /* ── Guard ── */
  if (!data.announcement) {
    return (
      <div className="wm-er-vWorkforce">
        <div className="wm-pageHead">
          <button type="button" onClick={onBack} style={backBtnStyle}><IconBack /></button>
          <div className="wm-pageTitle">Announcement not found</div>
        </div>
        <div className="wm-er-card" style={{ marginTop: 14, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--wm-er-muted)" }}>This announcement may have been deleted.</div>
          <button className="wm-primarybtn" type="button" onClick={onBack} style={{ marginTop: 12, background: AMBER }}>Go Back</button>
        </div>
      </div>
    );
  }

  const ann = data.announcement;
  const totalVacancy = workforceAnnouncementService.getTotalVacancy(announcementId);
  const appliedCount = data.applications.filter((a) => a.status === "applied").length;
  const selectedCount = data.applications.filter((a) => a.status === "selected" || a.status === "confirmed").length;
  const isTerminal = ann.status === "completed" || ann.status === "cancelled";

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={backBtnStyle}><IconBack /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wm-pageTitle" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ann.title}</div>
          <div className="wm-pageSub">Announcement Dashboard</div>
        </div>
        <span style={{ ...statusBadgeStyle, color: annStatusColor(ann.status), fontSize: 13 }}>{ann.status.charAt(0).toUpperCase() + ann.status.slice(1)}</span>
      </div>

      {/* ── KPIs ── */}
      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Vacancies</div>
          <div className="wm-er-tileValue" style={{ color: AMBER }}>{totalVacancy}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Applied</div>
          <div className="wm-er-tileValue">{appliedCount}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Selected</div>
          <div className="wm-er-tileValue" style={{ color: selectedCount > 0 ? "var(--wm-success)" : undefined }}>{selectedCount}</div>
        </div>
      </div>

      {/* ── Details Card ── */}
      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 8 }}>Details</div>
        {[
          { label: "Work Date", value: ann.date ? new Date(ann.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—" },
          ...(ann.time ? [{ label: "Time", value: ann.time }] : []),
          ...(ann.location ? [{ label: "Location", value: ann.location }] : []),
          { label: "Shifts", value: ann.shifts.map((s) => s.name).join(", ") },
          { label: "Categories", value: ann.targetCategories.map((id) => data.categoryMap.get(id) ?? id).join(", ") },
          { label: "Auto-Replace", value: ann.autoReplace ? "ON" : "OFF" },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ ...detailRowStyle, borderBottom: i === arr.length - 1 ? "none" : detailRowStyle.borderBottom }}>
            <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{row.value}</span>
          </div>
        ))}
        {ann.description && <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>{ann.description}</div>}
      </div>

      {/* ── Applications ── */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 8 }}>Applications ({data.applications.length})</div>

        {data.applications.length === 0 ? (
          <div className="wm-er-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)" }}>No applications yet. Staff will appear here once they respond.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {ann.targetCategories.map((catId) =>
              ann.shifts.map((shift) => {
                const key = `${catId}__${shift.id}`;
                const apps = groupedApps.get(key) ?? [];
                const vacancy = ann.vacancyPerCategoryPerShift[catId]?.[shift.id] ?? 0;
                const filledCount = apps.filter((a) => a.status === "selected" || a.status === "confirmed").length;

                return (
                  <div key={key} className="wm-er-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: AMBER }}>{data.categoryMap.get(catId) ?? catId}</span>
                        <span style={{ fontSize: 12, color: "var(--wm-er-muted)", marginLeft: 6 }}>· {shift.name}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{filledCount}/{vacancy} filled</span>
                    </div>

                    {apps.length === 0 ? (
                      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: "8px 0" }}>No applicants</div>
                    ) : (
                      <div style={{ display: "grid", gap: 6 }}>
                        {apps.map((app) => (
                          <div key={app.id} style={applicantCardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                                  {app.employeeName}
                                  {app.hasDateConflict && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--wm-warning)", fontWeight: 800 }}>⚠ Conflict</span>}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                                  {app.rating !== null ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, color: AMBER, fontWeight: 700 }}><IconStar /> {app.rating.toFixed(1)}</span>
                                  ) : (
                                    <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No rating</span>
                                  )}
                                  <span style={{ ...statusBadgeStyle, color: appStatusColor(app.status) }}>{app.status.replace("_", " ")}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      {!isTerminal && (
        <div className="wm-er-card" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 10 }}>Actions</div>
          <div style={{ display: "grid", gap: 8 }}>
            {ann.status === "open" && (
              <button className="wm-primarybtn" type="button" onClick={() => handleStatusChange("analyzing")} style={{ width: "100%", background: "var(--wm-warning)", padding: "10px" }}>Start Analysis</button>
            )}
            {ann.status === "analyzing" && (
              <>
                <button className="wm-primarybtn" type="button" onClick={() => setConfirmGroupOpen(true)} style={{ width: "100%", background: "var(--wm-success)", padding: "10px" }}>
                  Confirm & Create Group ({selectedCount} selected)
                </button>
                <button type="button" onClick={() => handleStatusChange("open")} style={actionSmBtnStyle(AMBER)}>Back to Open</button>
              </>
            )}
            {ann.status === "confirmed" && (
              <button className="wm-primarybtn" type="button" onClick={() => handleStatusChange("completed")} style={{ width: "100%", background: "var(--wm-er-muted)", padding: "10px" }}>Mark as Completed</button>
            )}
            <button type="button" onClick={() => handleStatusChange("cancelled")} style={actionSmBtnStyle("var(--wm-error)")}>Cancel Announcement</button>
          </div>
        </div>
      )}

      {/* ── Confirm Group Inline ── */}
      {confirmGroupOpen && (
        <div className="wm-er-card" style={{ marginTop: 10, border: "2px solid var(--wm-success)" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-success)" }}>Confirm & Create Group</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 6, lineHeight: 1.5 }}>
            This will create a Work Group with {selectedCount} member{selectedCount !== 1 ? "s" : ""}. Staff will be notified.
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="wm-primarybtn" type="button" onClick={handleConfirmGroup} style={{ background: "var(--wm-success)", padding: "8px 16px" }}>Yes, Create Group</button>
            <button type="button" onClick={() => setConfirmGroupOpen(false)} style={actionSmBtnStyle("var(--wm-er-text)")}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Save as Template ── */}
      {!isTerminal && (
        <div className="wm-er-card" style={{ marginTop: 10 }}>
          {!saveTemplateOpen ? (
            <button type="button" onClick={() => setSaveTemplateOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: AMBER }}>Save as Template</button>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 6 }}>Template Name</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" className="wm-input" placeholder="e.g. Weekend Setup" value={templateName} onChange={(e) => { setTemplateName(e.target.value); setTemplateError(""); }} style={{ flex: 1, fontSize: 13 }} maxLength={60} autoFocus />
                <button className="wm-primarybtn" type="button" onClick={handleSaveTemplate} disabled={!templateName.trim()} style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}>Save</button>
                <button type="button" onClick={() => { setSaveTemplateOpen(false); setTemplateName(""); setTemplateError(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 700 }}>Cancel</button>
              </div>
              {templateError && <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{templateError}</div>}
            </div>
          )}
        </div>
      )}

      {actionError && (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          <div style={{ fontSize: 12, color: "var(--wm-error)" }}>{actionError}</div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}