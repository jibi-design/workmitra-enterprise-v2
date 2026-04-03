// src/features/employee/profile/pages/EmployeeProfilePage.tsx

import { useCallback, useMemo, useRef, useState } from "react";
import { employeeProfileStorage, type EmployeeProfile } from "../storage/employeeProfile.storage";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { isSameProfile, computeChecklist } from "../helpers/profileHelpers";
import type { ChecklistId } from "../types/profileTypes";
import { ProfileCompletionCard } from "../components/ProfileCompletionCard";
import { ProfileBasicSection } from "../components/ProfileBasicSection";
import { ProfileContactSection } from "../components/ProfileContactSection";
import { ProfileWorkSection } from "../components/ProfileWorkSection";
import { ProfileDocumentsSection } from "../components/ProfileDocumentsSection";
import { CurrentlyEmployedBadge } from "../components/CurrentlyEmployedBadge";
import { ShareProfileButton } from "../components/ShareProfileButton";

/* ------------------------------------------------ */
/* Unique ID Section                                */
/* ------------------------------------------------ */
const AMBER = "#b45309";
const AMBER_TINT = "rgba(180, 83, 9, 0.04)";
const AMBER_BORDER = "rgba(180, 83, 9, 0.18)";

function UniqueIdSection({ uniqueId, onCopy }: { uniqueId: string | undefined; onCopy: () => void }) {
  const hasId = !!uniqueId;

  return (
    <section style={{
      marginTop: 12, padding: 16, borderRadius: "var(--wm-radius-14)",
      background: AMBER_TINT, border: `1px solid ${AMBER_BORDER}`,
      borderLeft: `4px solid ${AMBER}`,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "rgba(180, 83, 9, 0.10)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill={AMBER} d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z" />
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text)" }}>Your WorkMitra ID</div>
      </div>

      {hasId ? (
        <>
          {/* Generated state */}
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", letterSpacing: 1.5, marginBottom: 8, fontFamily: "monospace" }}>
            {uniqueId}
          </div>
          <button type="button" onClick={onCopy} style={{
            border: `1.5px solid ${AMBER}`, background: "transparent", color: AMBER,
            padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
            marginBottom: 10,
          }}>
            Copy ID
          </button>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", lineHeight: 1.6 }}>
            This ID was created from your name and is permanent. Share it with employers so they can find and add you to their team.
          </div>
        </>
      ) : (
        <>
          {/* Not generated state */}
          <div style={{ fontSize: 15, fontWeight: 700, color: AMBER, marginBottom: 8 }}>
            Not generated yet
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", lineHeight: 1.7, marginBottom: 6 }}>
            Your WorkMitra ID is created from your real name. Use your real, full name — not a nickname or fake name. Once created, your name and ID cannot be changed.
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", lineHeight: 1.7, marginBottom: 8 }}>
            Share this ID with employers so they can find and add you to their team.
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", fontWeight: 600, marginBottom: 10 }}>
            Format: WM-XXXX-ABC-XXXX
          </div>

          {/* Warning box */}
          <div style={{
            background: "#fef3c7", borderLeft: "3px solid #f59e0b",
            padding: "10px 12px", borderRadius: "0 8px 8px 0",
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
              <path fill="#f59e0b" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
            </svg>
            <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5, fontWeight: 600 }}>
              Use your real name. Fake names will create a permanent wrong ID that cannot be corrected.
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------ */
/* Main Component                                   */
/* ------------------------------------------------ */
export function EmployeeProfilePage() {
  const initialSaved = useMemo(() => employeeProfileStorage.get(), []);
  const [savedProfile, setSavedProfile] = useState<EmployeeProfile>(initialSaved);
  const [draft, setDraft] = useState<EmployeeProfile>(initialSaved);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const refBasic = useRef<HTMLElement | null>(null);
  const refWork = useRef<HTMLElement | null>(null);

  const checklist = useMemo(() => computeChecklist(draft), [draft]);
  const isDirty = useMemo(() => !isSameProfile(draft, savedProfile), [draft, savedProfile]);

  function updateDraft<K extends keyof EmployeeProfile>(key: K, value: EmployeeProfile[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
  }

  function saveNow(): void {
    employeeProfileStorage.set(draft);
    const updated = employeeProfileStorage.get();
    setSavedProfile(updated);
    setDraft(updated);
    setIsEditing(false);
    setNotice({ title: "Profile Saved", message: "Your profile has been saved successfully.", tone: "success" });
  }

  function cancelChanges(): void {
    setDraft(savedProfile);
    setIsEditing(false);
  }

  const copyId = useCallback(() => {
    if (!savedProfile.uniqueId) return;
    void navigator.clipboard.writeText(savedProfile.uniqueId);
    setNotice({ title: "Copied!", message: "Your WorkMitra ID has been copied to clipboard.", tone: "success" });
  }, [savedProfile.uniqueId]);

  function scrollToChecklistTarget(id: ChecklistId): void {
    const map: Record<ChecklistId, HTMLElement | null> = {
      fullName: refBasic.current,
      city: refBasic.current,
      skills: refWork.current,
      experience: refWork.current,
      languages: refWork.current,
      jobTypes: refWork.current,
      availability: refWork.current,
    };
    const target = map[id];
    if (target) {
      if (!isEditing) setIsEditing(true);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div>
      {/* ---- Page Header ---- */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(29,78,216,0.08)", color: "#1d4ed8", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">Profile</div>
            <div className="wm-pageSub">Who I am + work readiness</div>
            <CurrentlyEmployedBadge />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {!isEditing ? (
            <button className="wm-primarybtn" type="button" onClick={() => setIsEditing(true)} style={{ fontSize: 12, padding: "6px 14px" }}>Edit</button>
          ) : (
            <>
              <button className="wm-outlineBtn" type="button" onClick={cancelChanges} style={{ fontSize: 12, padding: "6px 14px" }}>Cancel</button>
              <button className="wm-primarybtn" type="button" onClick={saveNow} disabled={!isDirty} style={{ fontSize: 12, padding: "6px 14px" }}>Save</button>
            </>
          )}
        </div>
      </div>

      {/* ---- Unique ID ---- */}
      <UniqueIdSection uniqueId={savedProfile.uniqueId} onCopy={copyId} />

      {/* ---- Share Profile ---- */}
      {savedProfile.uniqueId && (
        <div style={{ marginTop: 12 }}>
          <ShareProfileButton />
        </div>
      )}

      {/* ---- Sections ---- */}
      <ProfileCompletionCard doneCount={checklist.doneCount} totalCount={checklist.totalCount} rows={checklist.rows} onScrollTo={scrollToChecklistTarget} />
      <ProfileBasicSection draft={draft} disabled={!isEditing} onUpdate={updateDraft} sectionRef={refBasic} onNotice={setNotice} />
      <ProfileContactSection draft={draft} />
      <ProfileWorkSection draft={draft} disabled={!isEditing} onUpdate={updateDraft} sectionRef={refWork} />
      <ProfileDocumentsSection disabled={!isEditing} />

      {/* ---- Notice Modal ---- */}
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}