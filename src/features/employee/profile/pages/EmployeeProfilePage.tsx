/** Job Mitra | EmployeeProfilePage.tsx | Employee profile view + edit shell */

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import {
  getContactVerificationState,
  subscribeContactVerification,
} from "../../../../shared/phone";
import { employeeProfileStorage, type EmployeeProfile } from "../storage/employeeProfile.storage";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { MitraLabsIdLabel } from "../../../../shared/components/brand/MitraLabsIdLabel";
import { isSameProfile, computeChecklist } from "../helpers/profileHelpers";
import type { ChecklistId } from "../types/profileTypes";
import { ProfileCompletionCard } from "../components/ProfileCompletionCard";
import { ProfileBasicSection } from "../components/ProfileBasicSection";
import { ProfileLocationSection } from "../components/ProfileLocationSection";
import { ProfileContactSection } from "../components/ProfileContactSection";
import { persistEmployeeLocationAfterProfileSave } from "../helpers/persistEmployeeLocationAfterProfileSave";
import { ProfileWorkSection } from "../components/ProfileWorkSection";
import { ProfileDocumentsSection } from "../components/ProfileDocumentsSection";
import { CurrentlyEmployedBadge } from "../components/CurrentlyEmployedBadge";
import { ShareProfileButton } from "../components/ShareProfileButton";
import { UniqueIdSection } from "../components/UniqueIdSection";
import { resolvePendingGroupJoinOrchestration } from "../../../shiftOps/helpers/groupJoinDeepLink";
import { getProfileCompletion } from "../services/profileCompletionService";

export function EmployeeProfilePage() {
  const nav = useNavigate();
  const initialSaved = useMemo(() => employeeProfileStorage.get(), []);
  const [savedProfile, setSavedProfile] = useState<EmployeeProfile>(initialSaved);
  const [draft, setDraft] = useState<EmployeeProfile>(initialSaved);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [flashSave, setFlashSave] = useState(false);
  const [saveButtonDone, setSaveButtonDone] = useState(false);

  const refBasic = useRef<HTMLElement | null>(null);
  const refLocation = useRef<HTMLElement | null>(null);
  const refContact = useRef<HTMLElement | null>(null);
  const refWork = useRef<HTMLElement | null>(null);

  // Contact verify lives outside draft — subscribe so checklist rows stay live.
  const contactSnap = useSyncExternalStore(
    subscribeContactVerification,
    getContactVerificationState,
    getContactVerificationState,
  );
  const checklist = useMemo(() => {
    void contactSnap;
    return computeChecklist(draft);
  }, [draft, contactSnap]);
  const isDirty = useMemo(() => !isSameProfile(draft, savedProfile), [draft, savedProfile]);

  function updateDraft<K extends keyof EmployeeProfile>(key: K, value: EmployeeProfile[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function startEditing(): void {
    setDraft(savedProfile);
    setIsEditing(true);
  }

  function saveNow(): void {
    const updated = employeeProfileStorage.set(draft);
    persistEmployeeLocationAfterProfileSave(updated);

    setSavedProfile(updated);
    setDraft(updated);
    setSaveButtonDone(true);
    setFlashSave(true);

    window.setTimeout(() => {
      setIsEditing(false);
      setSaveButtonDone(false);
      // GJ-2: after profile setup, resume pending group join when checklist is complete
      if (getProfileCompletion().isComplete) {
        const next = resolvePendingGroupJoinOrchestration();
        if (next && next.includes("/employee/shift-ops/invite")) {
          nav(next, { replace: true });
        }
      }
    }, 450);
  }

  function handleSaveFlashEnd() {
    setFlashSave(false);
  }

  function cancelChanges(): void {
    setDraft(savedProfile);
    setIsEditing(false);
  }

  const copyId = useCallback(() => {
    if (!savedProfile.uniqueId) return;

    void navigator.clipboard.writeText(savedProfile.uniqueId);
    setNotice({
      title: "Copied!",
      message: (
        <>
          Your <MitraLabsIdLabel /> has been copied to clipboard.
        </>
      ),
      tone: "success",
    });
  }, [savedProfile.uniqueId]);

  function scrollToChecklistTarget(id: ChecklistId): void {
    const map: Record<ChecklistId, HTMLElement | null> = {
      fullName: refBasic.current,
      city: refBasic.current,
      basePincode: refLocation.current,
      skills: refWork.current,
      experience: refWork.current,
      languages: refWork.current,
      jobTypes: refWork.current,
      availability: refWork.current,
      phoneVerified: refContact.current,
      emailVerified: refContact.current,
    };

    const target = map[id];

    if (target) {
      if (!isEditing) startEditing();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="pb-safe-nav">
      <div className="wm-profileHero">
        <div className="wm-profileHero__avatar" aria-hidden="true">
          {(draft.fullName || savedProfile.fullName || "E")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join("") || "E"}
          {!isEditing ? (
            <button
              type="button"
              className="wm-profileHero__edit"
              aria-label="Edit profile"
              onClick={startEditing}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8-2h-2.17l-1.24-1.35A2 2 0 0 0 15.12 5H8.88a2 2 0 0 0-1.47.65L6.17 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-8 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : null}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="wm-profileHero__name">
            {draft.fullName?.trim() || savedProfile.fullName?.trim() || "Your profile"}
          </div>
          <span className="wm-profileHero__role">Employee</span>
          {savedProfile.uniqueId ? (
            <div
              className="wm-profileHero__id"
              role="button"
              tabIndex={0}
              onClick={() => {
                void navigator.clipboard.writeText(savedProfile.uniqueId ?? "");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void navigator.clipboard.writeText(savedProfile.uniqueId ?? "");
                }
              }}
            >
              {savedProfile.uniqueId}
            </div>
          ) : null}
          <CurrentlyEmployedBadge />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 5,
          }}
        >
          {!isEditing ? (
            <button
              className="wm-primarybtn"
              type="button"
              onPointerDown={startEditing}
              onMouseDown={startEditing}
              onClick={startEditing}
              style={{
                fontSize: 12,
                minHeight: 44,
                padding: "0 14px",
                cursor: "pointer",
                touchAction: "manipulation",
                position: "relative",
                zIndex: 10,
                pointerEvents: "auto",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Edit
            </button>
          ) : (
            <button
              className="wm-outlineBtn wm-press-btn"
              type="button"
              onClick={cancelChanges}
              style={{
                fontSize: 12,
                minHeight: 44,
                padding: "0 14px",
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className={flashSave ? "wm-saveFlash" : undefined} onAnimationEnd={handleSaveFlashEnd}>
        <UniqueIdSection uniqueId={savedProfile.uniqueId} onCopy={copyId} />

        {savedProfile.uniqueId && (
          <div style={{ marginTop: 12 }}>
            <ShareProfileButton />
          </div>
        )}

        {checklist.doneCount < checklist.totalCount ? (
          <div
            className="wm-er-card"
            data-testid="profile-incomplete-banner"
            style={{ marginTop: 12, padding: "11px 12px" }}
          >
            <div style={{ fontSize: 13, fontWeight: 950 }}>Resume still incomplete</div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)" }}>
              {checklist.totalCount - checklist.doneCount} profile items left. Complete them so
              employers can review you faster.
            </div>
          </div>
        ) : null}

        <ProfileCompletionCard
          doneCount={checklist.doneCount}
          totalCount={checklist.totalCount}
          rows={checklist.rows}
          onScrollTo={scrollToChecklistTarget}
        />

        <ProfileBasicSection
          draft={draft}
          disabled={!isEditing}
          onUpdate={updateDraft}
          sectionRef={refBasic}
          onNotice={setNotice}
        />

        <ProfileLocationSection
          draft={draft}
          disabled={!isEditing}
          onUpdate={updateDraft}
          sectionRef={refLocation}
        />

        <ProfileContactSection draft={draft} sectionRef={refContact} />

        <ProfileWorkSection
          draft={draft}
          disabled={!isEditing}
          onUpdate={updateDraft}
          sectionRef={refWork}
        />

        <ProfileDocumentsSection />

        {isEditing ? (
          <div className="wm-profileSaveBar">
            <button
              type="button"
              className={`wm-profileSaveBar__btn${saveButtonDone ? " wm-actionDone" : ""}`}
              onClick={saveNow}
              disabled={!isDirty}
              style={{ opacity: isDirty ? 1 : 0.55, cursor: isDirty ? "pointer" : "not-allowed" }}
            >
              <span className="wm-actionDone__label">Save profile</span>
            </button>
          </div>
        ) : null}
      </div>

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
