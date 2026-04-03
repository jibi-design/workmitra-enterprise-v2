// src/features/employer/shiftJobs/pages/EmployerFavoritesPage.tsx
//
// My Favorites — saved workers the employer wants to hire again.
// Search by WM ID to add manually.
// Invite to Shift — select open post → worker gets priority notification.
// Domain: Shift Green.

import { useMemo, useState, useSyncExternalStore } from "react";
import { favoritesStorage, type FavoriteWorker } from "../storage/favoritesStorage";
import { employerShiftStorage } from "../storage/employerShift.storage";

/* ------------------------------------------------ */
/* Snapshot                                         */
/* ------------------------------------------------ */
let _raw: string | null = "__init__";
let _cache: FavoriteWorker[] = [];

function getSnapshot(): FavoriteWorker[] {
  const raw = localStorage.getItem("wm_employer_shift_favorites_v1");
  if (raw !== _raw) { _raw = raw; _cache = favoritesStorage.getAll(); }
  return _cache;
}

/* ------------------------------------------------ */
/* Star display                                     */
/* ------------------------------------------------ */
function Stars({ avg }: { avg: number }) {
  if (avg === 0) {
    return <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No ratings yet</span>;
  }
  const full = Math.floor(avg);
  return (
    <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)} {avg.toFixed(1)}
    </span>
  );
}

/* ------------------------------------------------ */
/* Invite to Shift Modal                            */
/* ------------------------------------------------ */
type InviteTarget = { workerWmId: string; workerName: string };

function InviteToShiftModal({
  target,
  onClose,
}: {
  target: InviteTarget;
  onClose: () => void;
}) {
  const openPosts = useMemo(
    () =>
      employerShiftStorage
        .getPosts()
        .filter((p) => p.status === "active" && !p.isHiddenFromSearch),
    [],
  );

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!selectedPostId) return;
    const post = openPosts.find((p) => p.id === selectedPostId);
    if (!post) return;

    /* Push priority notification to employee notifications */
    try {
      const NOTES_KEY = "wm_employee_notifications_v1";
      const existing = JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]") as object[];
      const note = {
        id: `n_inv_${Date.now().toString(16)}`,
        domain: "shift",
        title: "You're invited to a shift!",
        body: `${post.companyName} has invited you to: ${post.jobName} — ${post.locationName}. Pay: ${post.payPerDay}/day. You are a preferred worker.`,
        createdAt: Date.now(),
        isRead: false,
        route: `/employee/shift/search`,
      };
      localStorage.setItem(NOTES_KEY, JSON.stringify([note, ...existing].slice(0, 100)));
      window.dispatchEvent(new Event("wm:employee-notifications-changed"));
    } catch { /* safe */ }

    setSent(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 420,
          background: "var(--wm-er-card, #fff)",
          borderRadius: 16, padding: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          /* Success */
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", marginBottom: 6 }}>
              Invitation Sent!
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
              {target.workerName} has been notified about the shift.
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 16, padding: "9px 24px", borderRadius: 10,
                border: "none", background: "var(--wm-er-accent-shift, #16a34a)",
                color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>
              Invite to Shift
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 14 }}>
              Select a shift for <strong>{target.workerName}</strong>
            </div>

            {openPosts.length === 0 ? (
              <div style={{
                padding: "16px 12px", borderRadius: 10,
                background: "rgba(148,163,184,0.08)",
                border: "1px solid var(--wm-er-border)",
                fontSize: 12, color: "var(--wm-er-muted)", textAlign: "center",
              }}>
                No open shifts available. Create a shift first.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {openPosts.map((p) => {
                  const isSelected = selectedPostId === p.id;
                  const dateStr = new Date(p.startAt).toLocaleDateString(
                    undefined, { month: "short", day: "numeric" },
                  );
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPostId(p.id)}
                      style={{
                        padding: "10px 12px", borderRadius: 10, textAlign: "left",
                        border: isSelected
                          ? "1.5px solid var(--wm-er-accent-shift, #16a34a)"
                          : "1px solid var(--wm-er-border)",
                        background: isSelected
                          ? "rgba(22,163,74,0.06)"
                          : "var(--wm-er-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                        {p.jobName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                        {p.locationName} &middot; {dateStr} &middot; Pay: {p.payPerDay}/day
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{
              marginTop: 14, display: "flex",
              justifyContent: "flex-end", gap: 8,
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 16px", borderRadius: 10,
                  border: "1px solid var(--wm-er-border)",
                  background: "none", fontSize: 12,
                  fontWeight: 600, color: "var(--wm-er-muted)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!selectedPostId}
                style={{
                  padding: "8px 18px", borderRadius: 10, border: "none",
                  background: selectedPostId
                    ? "var(--wm-er-accent-shift, #16a34a)"
                    : "#e5e7eb",
                  color: selectedPostId ? "#fff" : "#9ca3af",
                  fontSize: 12, fontWeight: 600,
                  cursor: selectedPostId ? "pointer" : "not-allowed",
                }}
              >
                Send Invite
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerFavoritesPage() {
  const favorites = useSyncExternalStore(
    favoritesStorage.subscribe,
    getSnapshot,
    getSnapshot,
  );

  const [search, setSearch]           = useState("");
  const [addInput, setAddInput]       = useState("");
  const [addName, setAddName]         = useState("");
  const [addError, setAddError]       = useState("");
  const [addSuccess, setAddSuccess]   = useState("");
  const [removingId, setRemovingId]   = useState<string | null>(null);
  const [editNotesId, setEditNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue]   = useState("");
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (f) =>
        f.workerName.toLowerCase().includes(q) ||
        f.workerWmId.toLowerCase().includes(q) ||
        (f.jobTitle ?? "").toLowerCase().includes(q),
    );
  }, [favorites, search]);

  function handleAddManual() {
    const wmId = addInput.trim();
    const name = addName.trim();
    if (!wmId) { setAddError("Enter a WM ID."); return; }
    if (!name) { setAddError("Enter the worker's name."); return; }
    if (favoritesStorage.isFavorite(wmId)) {
      setAddError("This worker is already in your Favorites.");
      return;
    }
    favoritesStorage.addManual({ workerWmId: wmId, workerName: name });
    setAddInput(""); setAddName(""); setAddError("");
    setAddSuccess(`${name} added to Favorites.`);
    setTimeout(() => setAddSuccess(""), 2500);
  }

  function handleRemove(wmId: string) {
    favoritesStorage.remove(wmId);
    setRemovingId(null);
  }

  function handleSaveNotes() {
    if (!editNotesId) return;
    favoritesStorage.updateNotes(editNotesId, notesValue);
    setEditNotesId(null);
    setNotesValue("");
  }

  return (
    <div>
      {/* Invite Modal */}
      {inviteTarget && (
        <InviteToShiftModal
          target={inviteTarget}
          onClose={() => setInviteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">My Favorites</div>
          <div className="wm-pageSub">Workers you want to hire again</div>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
          background: "rgba(22,163,74,0.08)",
          color: "var(--wm-er-accent-shift, #16a34a)",
          border: "1px solid rgba(22,163,74,0.2)",
        }}>
          {favorites.length} saved
        </span>
      </div>

      {/* Add manually */}
      <div className="wm-er-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>
          Add Worker by WM ID
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="wm-input"
            value={addInput}
            onChange={(e) => { setAddInput(e.target.value); setAddError(""); }}
            placeholder="Enter WorkMitra ID"
            maxLength={20}
            style={{ flex: "2 1 140px" }}
          />
          <input
            className="wm-input"
            value={addName}
            onChange={(e) => { setAddName(e.target.value); setAddError(""); }}
            placeholder="Worker name"
            maxLength={80}
            style={{ flex: "2 1 120px" }}
          />
          <button
            type="button"
            onClick={handleAddManual}
            disabled={!addInput.trim() || !addName.trim()}
            style={{
              fontSize: 12, fontWeight: 600, padding: "0 16px", height: 42,
              borderRadius: 10, border: "none",
              background: "var(--wm-er-accent-shift, #16a34a)",
              color: "#fff", cursor: "pointer",
              opacity: !addInput.trim() || !addName.trim() ? 0.5 : 1,
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Add
          </button>
        </div>
        {addError   && <div style={{ fontSize: 11, color: "var(--wm-error, #dc2626)", marginTop: 6 }}>{addError}</div>}
        {addSuccess && <div style={{ fontSize: 11, color: "var(--wm-er-accent-shift, #16a34a)", marginTop: 6 }}>{addSuccess}</div>}
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 6 }}>
          Workers rated &ldquo;Hire Again&rdquo; are added automatically. You can also add manually here.
        </div>
      </div>

      {/* Search */}
      {favorites.length > 3 && (
        <div style={{ marginTop: 10 }}>
          <input
            className="wm-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or WM ID..."
          />
        </div>
      )}

      {/* Empty */}
      {favorites.length === 0 && (
        <div className="wm-er-card" style={{ marginTop: 12, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>&#9825;</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>No favorites yet</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.6 }}>
            Rate a worker and select &ldquo;Hire Again&rdquo; to automatically add them here. Or add by WM ID above.
          </div>
        </div>
      )}

      {/* Favorites list */}
      <div style={{ marginTop: 12, display: "grid", gap: 10, marginBottom: 32 }}>
        {filtered.map((fav) => (
          <div key={fav.id} className="wm-er-card" style={{ padding: 14 }}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {fav.workerName}
                </div>
                <div style={{ fontSize: 11, color: "var(--wm-er-accent-shift, #16a34a)", fontWeight: 700, marginTop: 2 }}>
                  {fav.workerWmId}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                background: fav.addedVia === "hire_again_rating"
                  ? "rgba(22,163,74,0.08)"
                  : "rgba(148,163,184,0.08)",
                color: fav.addedVia === "hire_again_rating"
                  ? "var(--wm-er-accent-shift, #16a34a)"
                  : "var(--wm-er-muted)",
                border: fav.addedVia === "hire_again_rating"
                  ? "1px solid rgba(22,163,74,0.2)"
                  : "1px solid var(--wm-er-border)",
              }}>
                {fav.addedVia === "hire_again_rating" ? "Hire Again" : "Manual"}
              </span>
            </div>

            {/* Stats row */}
            <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Stars avg={fav.avgStars} />
              <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                {fav.shiftsWorked} shift{fav.shiftsWorked !== 1 ? "s" : ""} worked
              </span>
              {fav.jobTitle && (
                <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{fav.jobTitle}</span>
              )}
            </div>

            {/* Notes */}
            {fav.notes && editNotesId !== fav.workerWmId && (
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
                Note: {fav.notes}
              </div>
            )}

            {/* Inline notes editor */}
            {editNotesId === fav.workerWmId && (
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <input
                  className="wm-input"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add a note about this worker..."
                  maxLength={120}
                  style={{ flex: 1, fontSize: 12 }}
                  autoFocus
                />
                <button type="button" onClick={handleSaveNotes}
                  style={{ fontSize: 12, fontWeight: 600, padding: "0 12px", height: 38, borderRadius: 8, border: "none", background: "var(--wm-er-accent-shift, #16a34a)", color: "#fff", cursor: "pointer" }}>
                  Save
                </button>
                <button type="button" onClick={() => { setEditNotesId(null); setNotesValue(""); }}
                  style={{ fontSize: 12, fontWeight: 600, padding: "0 10px", height: 38, borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-muted)", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>

              {/* Invite to Shift */}
              <button
                type="button"
                onClick={() => setInviteTarget({ workerWmId: fav.workerWmId, workerName: fav.workerName })}
                style={{
                  fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                  border: "1px solid rgba(22,163,74,0.3)",
                  background: "rgba(22,163,74,0.06)",
                  color: "var(--wm-er-accent-shift, #16a34a)", cursor: "pointer",
                }}
              >
                Invite to Shift
              </button>

              {editNotesId !== fav.workerWmId && (
                <button type="button"
                  onClick={() => { setEditNotesId(fav.workerWmId); setNotesValue(fav.notes ?? ""); }}
                  style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-muted)", cursor: "pointer" }}>
                  {fav.notes ? "Edit Note" : "Add Note"}
                </button>
              )}

              {removingId === fav.workerWmId ? (
                <>
                  <span style={{ fontSize: 11, color: "var(--wm-er-muted)", alignSelf: "center" }}>
                    Remove from Favorites?
                  </span>
                  <button type="button" onClick={() => handleRemove(fav.workerWmId)}
                    style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, border: "none", background: "rgba(220,38,38,0.1)", color: "var(--wm-error, #dc2626)", cursor: "pointer" }}>
                    Yes, Remove
                  </button>
                  <button type="button" onClick={() => setRemovingId(null)}
                    style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-muted)", cursor: "pointer" }}>
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setRemovingId(fav.workerWmId)}
                  style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.2)", background: "none", color: "var(--wm-error, #dc2626)", cursor: "pointer" }}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && favorites.length > 0 && (
          <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--wm-er-muted)" }}>
            No favorites match your search.
          </div>
        )}
      </div>
    </div>
  );
}