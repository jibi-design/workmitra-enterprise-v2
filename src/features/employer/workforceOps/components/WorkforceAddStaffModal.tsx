// src/features/employer/workforceOps/components/WorkforceAddStaffModal.tsx
//
// Modal for adding a new staff member to the Workforce directory.
// Lookup by unique ID → assign categories → optional rating/bio → add.

import { useState, useCallback, useMemo } from "react";
import { workforceStaffService } from "../services/workforceStaffService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { WorkforceCategory } from "../types/workforceTypes";
import { IconClose, IconSearch, IconPlus } from "./workforceIcons";
import { AMBER, AMBER_BG, categoryChipStyle } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (staffId: string) => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  width: "100%",
  maxWidth: 420,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 18px 12px",
  borderBottom: "1px solid var(--wm-er-border)",
};

const bodyStyle: React.CSSProperties = {
  padding: "16px 18px",
  display: "grid",
  gap: 16,
};

const footerStyle: React.CSSProperties = {
  padding: "12px 18px 16px",
  borderTop: "1px solid var(--wm-er-border)",
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--wm-er-muted)",
  marginTop: 2,
};

const lookupCardStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  background: "rgba(22, 163, 74, 0.06)",
  border: "1px solid rgba(22, 163, 74, 0.2)",
};

const notFoundCardStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  background: "rgba(220, 38, 38, 0.04)",
  border: "1px solid rgba(220, 38, 38, 0.15)",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function WorkforceAddStaffModal({ isOpen, onClose, onAdded }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);

  /* ── Form state ── */
  const [uniqueId, setUniqueId] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [plusPoints, setPlusPoints] = useState("");
  const [initialRating, setInitialRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");

  /* ── Lookup state ── */
  const [looked, setLooked] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ found: boolean; fullName: string; city: string; skills: string[] } | null>(null);

  /* ── Inline category add ── */
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatVal, setNewCatVal] = useState("");
  const [newCatErr, setNewCatErr] = useState("");
  const [catList, setCatList] = useState<WorkforceCategory[]>(categories);

  const addNewCategory = useCallback(() => {
    const r = workforceCategoryService.create(newCatVal);
    if (r.success) {
      setNewCatVal("");
      setShowNewCat(false);
      setNewCatErr("");
      setCatList(workforceCategoryService.getAll());
    } else {
      setNewCatErr(r.errors?.[0] ?? "Failed to add.");
    }
  }, [newCatVal]);

  /* ── Error state ── */
  const [errors, setErrors] = useState<string[]>([]);

  /* ── Handlers ── */
  const handleLookup = useCallback(() => {
    const trimmed = uniqueId.trim();
    if (!trimmed) return;
    const result = workforceStaffService.lookupEmployee(trimmed);
    setLookupResult(result);
    setLooked(true);
  }, [uniqueId]);

  const toggleCat = useCallback((catId: string) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  }, []);

  const resetForm = useCallback(() => {
    setUniqueId("");
    setSelectedCats([]);
    setBio("");
    setPlusPoints("");
    setInitialRating(null);
    setRatingComment("");
    setLooked(false);
    setLookupResult(null);
    setErrors([]);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(() => {
    const result = workforceStaffService.add({
      employeeUniqueId: uniqueId.trim(),
      categories: selectedCats,
      bio: bio.trim() || undefined,
      plusPoints: plusPoints.trim() || undefined,
      rating: initialRating ?? undefined,
      ratingComment: ratingComment.trim() || undefined,
    });

    if (result.success && result.id) {
      onAdded?.(result.id);
      handleClose();
    } else {
      setErrors(result.errors ?? ["Failed to add staff."]);
    }
  }, [uniqueId, selectedCats, bio, plusPoints, initialRating, ratingComment, onAdded, handleClose]);

  const canSubmit = uniqueId.trim().length > 0 && selectedCats.length > 0;

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div style={headerStyle}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>Add Staff Member</div>
          <button type="button" onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wm-er-muted)", padding: 4 }}>
            <IconClose />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={bodyStyle}>
          {/* Step 1: Employee ID + Lookup */}
          <div>
            <div style={labelStyle}>Employee Unique ID</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                className="wm-input"
                placeholder="Enter employee's unique ID"
                value={uniqueId}
                onChange={(e) => { setUniqueId(e.target.value); setLooked(false); setLookupResult(null); setErrors([]); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleLookup(); }}
                style={{ flex: 1, fontSize: 13 }}
                autoFocus
              />
              <button
                className="wm-primarybtn" type="button"
                onClick={handleLookup}
                disabled={!uniqueId.trim()}
                style={{ background: AMBER, fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <IconSearch /> Verify
              </button>
            </div>
            <div style={hintStyle}>The employee can find their unique ID in their profile settings.</div>
          </div>

          {/* Lookup Result */}
          {looked && lookupResult && (
            lookupResult.found ? (
              <div style={lookupCardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-success)" }}>Employee found</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-er-text)", marginTop: 4 }}>{lookupResult.fullName}</div>
                {lookupResult.city && <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>{lookupResult.city}</div>}
                {lookupResult.skills.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {lookupResult.skills.map((s, i) => (
                      <span key={i} style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(22,163,74,0.1)", color: "var(--wm-success)", fontSize: 10, fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={notFoundCardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-error)" }}>Employee not found</div>
                <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
                  No profile found for this ID. You can still add them — their details will update when they register.
                </div>
              </div>
            )
          )}

          {/* Step 2: Categories */}
          <div>
            <div style={labelStyle}>Assign Categories <span style={{ color: "var(--wm-error)" }}>*</span></div>
            {catList.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {catList.map((cat: WorkforceCategory) => {
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
                {!showNewCat && (
                  <button
                    type="button"
                    onClick={() => setShowNewCat(true)}
                    style={{
                      ...categoryChipStyle,
                      cursor: "pointer",
                      background: "var(--wm-er-bg)",
                      color: AMBER,
                      border: "1px dashed " + AMBER,
                    }}
                  >
                    <IconPlus /> New
                  </button>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
                No categories yet.
                {!showNewCat && (
                  <button type="button" onClick={() => setShowNewCat(true)} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, fontWeight: 700, fontSize: 12, marginLeft: 4 }}>
                    + Add Category
                  </button>
                )}
              </div>
            )}
            {showNewCat && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="text" className="wm-input" placeholder="Category name"
                  value={newCatVal} onChange={(e) => { setNewCatVal(e.target.value); setNewCatErr(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") addNewCategory(); if (e.key === "Escape") { setShowNewCat(false); setNewCatVal(""); setNewCatErr(""); } }}
                  style={{ flex: 1, fontSize: 12 }} autoFocus maxLength={40}
                />
                <button className="wm-primarybtn" type="button" onClick={addNewCategory} disabled={!newCatVal.trim()} style={{ background: AMBER, fontSize: 11, padding: "5px 10px" }}>Add</button>
                <button type="button" onClick={() => { setShowNewCat(false); setNewCatVal(""); setNewCatErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 700 }}>Cancel</button>
              </div>
            )}
            {newCatErr && <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{newCatErr}</div>}
            {selectedCats.length === 0 && looked && (
              <div style={{ fontSize: 11, color: "var(--wm-error)", marginTop: 4 }}>At least one category must be selected.</div>
            )}
          </div>

          {/* Step 3: Optional — Initial Rating */}
          <div>
            <div style={labelStyle}>Initial Rating <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 500 }}>(optional)</span></div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v} type="button"
                  onClick={() => setInitialRating(initialRating === v ? null : v)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: initialRating === v ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
                    background: initialRating === v ? AMBER : "#fff",
                    color: initialRating === v ? "#fff" : "var(--wm-er-text)",
                    fontSize: 14, fontWeight: 900, cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <div style={hintStyle}>Rate based on past experience working with this person.</div>
          </div>

          {/* Step 4: Optional — Notes */}
          <div>
            <div style={labelStyle}>Rating Comment <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 500 }}>(optional)</span></div>
            <input
              type="text" className="wm-input"
              placeholder="e.g. Very punctual, great teamwork"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              style={{ width: "100%", fontSize: 13 }}
              maxLength={200}
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
              {errors.map((err, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--wm-error)", lineHeight: 1.4 }}>{err}</div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={footerStyle}>
          <button
            type="button" onClick={handleClose}
            style={{
              padding: "8px 16px", borderRadius: "var(--wm-radius-10)",
              border: "1px solid var(--wm-er-border)", background: "#fff",
              fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            className="wm-primarybtn" type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ background: canSubmit ? AMBER : "var(--wm-er-muted)", fontSize: 13, padding: "8px 20px" }}
          >
            Add Staff
          </button>
        </div>
      </div>
    </div>
  );
}