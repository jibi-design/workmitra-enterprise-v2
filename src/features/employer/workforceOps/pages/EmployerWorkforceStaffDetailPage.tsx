// src/features/employer/workforceOps/pages/EmployerWorkforceStaffDetailPage.tsx
//
// Workforce Ops Hub — Staff Detail View.
// Profile, rating, categories, bio, plus points, remove action.

import { useSyncExternalStore, useState, useCallback, useMemo } from "react";
import { workforceStaffService } from "../services/workforceStaffService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { WorkforceStaff, WorkforceCategory } from "../types/workforceTypes";
import {
  WF_STAFF_CHANGED,
  WF_CATEGORIES_CHANGED,
} from "../helpers/workforceStorageUtils";
import {
  IconBack,
  IconStar,
  IconEdit,
  IconDelete,
  IconCategory,
  IconPlus,
} from "../components/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  sectionTitleStyle,
  sectionIconWrapStyle,
  categoryChipStyle,
  timeAgo,
} from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props (staffId passed from parent/router)                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  staffId: string;
  onBack: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Subscription                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type DetailSnapshot = {
  staff: WorkforceStaff | null;
  categories: WorkforceCategory[];
  ver: number;
};

let snapCache: DetailSnapshot | null = null;
let snapVer = 0;
let cachedStaffId = "";

function getSnapshot(staffId: string): () => DetailSnapshot {
  return () => {
    if (snapCache && snapCache.ver === snapVer && cachedStaffId === staffId) return snapCache;
    cachedStaffId = staffId;
    const staff = workforceStaffService.getById(staffId);
    const categories = workforceCategoryService.getAll();
    snapCache = { staff, categories, ver: snapVer };
    return snapCache;
  };
}

function subscribe(cb: () => void): () => void {
  const events = [WF_STAFF_CHANGED, WF_CATEGORIES_CHANGED];
  const handler = () => { snapVer++; snapCache = null; cb(); };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--wm-er-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--wm-er-text)",
  marginTop: 2,
};

const inlineEditBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
};

const dangerBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-error)",
  background: "rgba(220, 38, 38, 0.06)",
  color: "var(--wm-error)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceStaffDetailPage({ staffId, onBack }: Props) {
  const snapshotFn = useMemo(() => getSnapshot(staffId), [staffId]);
  const data = useSyncExternalStore(subscribe, snapshotFn, snapshotFn);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data.categories) map.set(c.id, c.name);
    return map;
  }, [data.categories]);

  /* ── Edit states ── */
  const [editingBio, setEditingBio] = useState(false);
  const [bioVal, setBioVal] = useState("");
  const [plusVal, setPlusVal] = useState("");
  const [commentVal, setCommentVal] = useState("");

  const [editingCats, setEditingCats] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);

  const [confirmRemove, setConfirmRemove] = useState(false);

  /* ── Bio Edit Handlers ── */
  const startEditBio = useCallback(() => {
    if (!data.staff) return;
    setBioVal(data.staff.bio);
    setPlusVal(data.staff.plusPoints);
    setCommentVal(data.staff.ratingComment);
    setEditingBio(true);
  }, [data.staff]);

  const saveBio = useCallback(() => {
    workforceStaffService.updateBio(staffId, bioVal, plusVal, commentVal);
    setEditingBio(false);
    snapVer++;
  }, [staffId, bioVal, plusVal, commentVal]);

  /* ── Category Edit Handlers ── */
  const startEditCats = useCallback(() => {
    if (!data.staff) return;
    setSelectedCats([...data.staff.categories]);
    setEditingCats(true);
  }, [data.staff]);

  const toggleCat = useCallback((catId: string) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  }, []);

  const saveCats = useCallback(() => {
    if (selectedCats.length === 0) return;
    workforceStaffService.updateCategories(staffId, selectedCats);
    setEditingCats(false);
    snapVer++;
  }, [staffId, selectedCats]);

  /* ── Rate Handler ── */
  const submitRating = useCallback(() => {
    const result = workforceStaffService.rate(staffId, ratingVal);
    if (result.success) {
      setRatingOpen(false);
      snapVer++;
    }
  }, [staffId, ratingVal]);

  /* ── Remove Handler ── */
  const handleRemove = useCallback(() => {
    workforceStaffService.remove(staffId);
    onBack();
  }, [staffId, onBack]);

  /* ── Guard ── */
  if (!data.staff) {
    return (
      <div className="wm-er-vWorkforce">
        <div className="wm-pageHead">
          <button type="button" onClick={onBack} style={inlineEditBtnStyle}><IconBack /></button>
          <div className="wm-pageTitle">Staff not found</div>
        </div>
        <div className="wm-er-card" style={{ marginTop: 14, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--wm-er-muted)" }}>This staff member may have been removed.</div>
          <button className="wm-primarybtn" type="button" onClick={onBack} style={{ marginTop: 12, background: AMBER }}>Go Back</button>
        </div>
      </div>
    );
  }

  const staff = data.staff;

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={inlineEditBtnStyle}><IconBack /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wm-pageTitle" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.employeeName}</div>
          <div className="wm-pageSub">ID: {staff.employeeUniqueId}</div>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ display: "grid", gap: 14 }}>
          {/* Name + City */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={fieldLabelStyle}>Full Name</div>
              <div style={fieldValueStyle}>{staff.employeeName || "—"}</div>
            </div>
            <div>
              <div style={fieldLabelStyle}>City</div>
              <div style={fieldValueStyle}>{staff.employeeCity || "—"}</div>
            </div>
          </div>

          {/* Skills */}
          {staff.employeeSkills.length > 0 && (
            <div>
              <div style={fieldLabelStyle}>Skills</div>
              <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {staff.employeeSkills.map((skill, i) => (
                  <span key={i} style={{ padding: "2px 8px", borderRadius: 999, background: "var(--wm-er-bg)", color: "var(--wm-er-text)", fontSize: 11, fontWeight: 600 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Added date */}
          <div>
            <div style={fieldLabelStyle}>Added</div>
            <div style={fieldValueStyle}>
              {new Date(staff.addedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              <span style={{ color: "var(--wm-er-muted)", fontWeight: 400, marginLeft: 6 }}>({timeAgo(staff.addedAt)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rating Section ── */}
      <div className="wm-er-card" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={sectionTitleStyle}>
            <IconStar /> Rating
          </div>
          <button type="button" onClick={() => setRatingOpen(!ratingOpen)} style={{ ...inlineEditBtnStyle, fontSize: 12, fontWeight: 700 }}>
            Rate
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          {staff.rating !== null ? (
            <>
              <div style={{ fontSize: 28, fontWeight: 900, color: AMBER }}>{staff.rating.toFixed(1)}</div>
              <div>
                <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{staff.ratingCount} rating{staff.ratingCount !== 1 ? "s" : ""}</div>
                <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={{ color: star <= Math.round(staff.rating ?? 0) ? AMBER : "var(--wm-er-border)", fontSize: 16 }}>★</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)" }}>No rating yet. Tap "Rate" to add one.</div>
          )}
        </div>

        {/* Rating Input */}
        {ratingOpen && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: AMBER_BG }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 8 }}>Select Rating</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v} type="button"
                  onClick={() => setRatingVal(v)}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    border: ratingVal === v ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
                    background: ratingVal === v ? AMBER : "#fff",
                    color: ratingVal === v ? "#fff" : "var(--wm-er-text)",
                    fontSize: 16, fontWeight: 900, cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button className="wm-primarybtn" type="button" onClick={submitRating} style={{ background: AMBER, fontSize: 12, padding: "6px 16px" }}>Submit</button>
              <button type="button" onClick={() => setRatingOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 700 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Categories Section ── */}
      <div className="wm-er-card" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconWrapStyle}><IconCategory /></div>
            Categories
          </div>
          <button type="button" onClick={editingCats ? saveCats : startEditCats} style={{ ...inlineEditBtnStyle, fontSize: 12, fontWeight: 700 }}>
            {editingCats ? "Save" : <IconEdit />}
          </button>
        </div>

        {!editingCats ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {staff.categories.map((catId) => (
              <span key={catId} style={categoryChipStyle}>{categoryMap.get(catId) ?? catId}</span>
            ))}
            {staff.categories.length === 0 && (
              <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No categories assigned</span>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {data.categories.map((cat) => {
              const isSelected = selectedCats.includes(cat.id);
              return (
                <button
                  key={cat.id} type="button"
                  onClick={() => toggleCat(cat.id)}
                  style={{
                    ...categoryChipStyle,
                    cursor: "pointer",
                    background: isSelected ? AMBER : AMBER_BG,
                    color: isSelected ? "#fff" : AMBER,
                  }}
                >
                  {isSelected ? "✓ " : <><IconPlus /> </>}{cat.name}
                </button>
              );
            })}
            {selectedCats.length === 0 && (
              <div style={{ fontSize: 11, color: "var(--wm-error)", marginTop: 4 }}>At least one category is required.</div>
            )}
          </div>
        )}
      </div>

      {/* ── Bio / Plus Points / Comment ── */}
      <div className="wm-er-card" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)" }}>Notes</div>
          <button type="button" onClick={editingBio ? saveBio : startEditBio} style={{ ...inlineEditBtnStyle, fontSize: 12, fontWeight: 700 }}>
            {editingBio ? "Save" : <IconEdit />}
          </button>
        </div>

        {!editingBio ? (
          <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
            <div>
              <div style={fieldLabelStyle}>Bio</div>
              <div style={{ fontSize: 13, color: staff.bio ? "var(--wm-er-text)" : "var(--wm-er-muted)", marginTop: 2 }}>{staff.bio || "No bio added"}</div>
            </div>
            <div>
              <div style={fieldLabelStyle}>Plus Points</div>
              <div style={{ fontSize: 13, color: staff.plusPoints ? "var(--wm-er-text)" : "var(--wm-er-muted)", marginTop: 2 }}>{staff.plusPoints || "None added"}</div>
            </div>
            <div>
              <div style={fieldLabelStyle}>Rating Comment</div>
              <div style={{ fontSize: 13, color: staff.ratingComment ? "var(--wm-er-text)" : "var(--wm-er-muted)", marginTop: 2 }}>{staff.ratingComment || "No comment"}</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
            <div>
              <label style={fieldLabelStyle}>Bio</label>
              <textarea className="wm-input" value={bioVal} onChange={(e) => setBioVal(e.target.value)} rows={2} style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "vertical" }} maxLength={300} placeholder="Short description about this staff member" />
            </div>
            <div>
              <label style={fieldLabelStyle}>Plus Points</label>
              <textarea className="wm-input" value={plusVal} onChange={(e) => setPlusVal(e.target.value)} rows={2} style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "vertical" }} maxLength={300} placeholder="Strengths, positive qualities" />
            </div>
            <div>
              <label style={fieldLabelStyle}>Rating Comment</label>
              <textarea className="wm-input" value={commentVal} onChange={(e) => setCommentVal(e.target.value)} rows={2} style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "vertical" }} maxLength={200} placeholder="Comment about their work quality" />
            </div>
            <button type="button" onClick={() => setEditingBio(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 700, justifySelf: "start" }}>Cancel</button>
          </div>
        )}
      </div>

      {/* ── Remove Staff ── */}
      <div style={{ marginTop: 14, marginBottom: 24 }}>
        {!confirmRemove ? (
          <button type="button" style={dangerBtnStyle} onClick={() => setConfirmRemove(true)}>
            <IconDelete /> Remove Staff Member
          </button>
        ) : (
          <div className="wm-er-card" style={{ border: "1px solid var(--wm-error)" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-error)" }}>Confirm Removal</div>
            <div style={{ fontSize: 13, color: "var(--wm-er-text)", marginTop: 6, lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>{staff.employeeName}</strong> from your staff directory? They will lose access to your announcements and groups.
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button className="wm-primarybtn" type="button" onClick={handleRemove} style={{ background: "var(--wm-error)", fontSize: 12, padding: "8px 16px" }}>Yes, Remove</button>
              <button type="button" onClick={() => setConfirmRemove(false)} style={{ background: "none", border: "1px solid var(--wm-er-border)", borderRadius: "var(--wm-radius-10)", cursor: "pointer", fontSize: 12, padding: "8px 16px", color: "var(--wm-er-text)", fontWeight: 700 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}