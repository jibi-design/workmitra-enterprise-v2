// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerEmploymentFeedbackSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\EmployerEmploymentFeedbackSection.tsx

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackTag,
} from "../../storage/careerEmploymentFeedback.storage";
import type { StaffRecord } from "../../storage/myStaff.storage";
import { EmployerEmploymentFeedbackConfirmModal } from "./feedback/EmployerEmploymentFeedbackConfirmModal";
import { EmployerEmploymentFeedbackForm } from "./feedback/EmployerEmploymentFeedbackForm";
import { EmployerEmploymentFeedbackSubmittedCard } from "./feedback/EmployerEmploymentFeedbackSubmittedCard";
import {
  CAREER,
  MUTED,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  TEXT,
  allConfirmed,
  emptyConfirmations,
  getLockMessage,
  parseSnapshot,
  toggleTag,
  type ConfirmationState,
} from "./feedback/employerEmploymentFeedback.helpers";

type Props = {
  record: StaffRecord;
};

export function EmploymentFeedbackSection({ record }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<CareerEmploymentFeedbackTag[]>([]);
  const [privateNote, setPrivateNote] = useState("");
  const [confirmations, setConfirmations] = useState<ConfirmationState>(() => emptyConfirmations());
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const raw = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    () => careerEmploymentFeedbackStorage.getStaffSnapshot(record.id),
    () => careerEmploymentFeedbackStorage.getStaffSnapshot(record.id),
  );

  const snapshot = useMemo(() => parseSnapshot(raw), [raw]);
  const task = snapshot.task;

  if (!task) return null;

  const activeTask = task;
  const isCompleted = activeTask.state === "completed";
  const editsUsed = activeTask.editCount ?? 0;
  const editsRemaining = Math.max(0, careerEmploymentFeedbackStorage.MAX_EDIT_COUNT - editsUsed);
  const editHistory = Array.isArray(activeTask.editHistory) ? activeTask.editHistory : [];
  const lastEdit = editHistory.at(-1)?.editedAt;
  const editWindowActive = Boolean(
    activeTask.editWindowExpiresAt && activeTask.editWindowExpiresAt > now,
  );
  const canEdit = snapshot.canEdit && editWindowActive && editsRemaining > 0;
  const canContinue = selectedTags.length > 0 && allConfirmed(confirmations);
  const lockMessage = getLockMessage(activeTask, editsRemaining);

  function resetForm(): void {
    setFormOpen(false);
    setSelectedTags([]);
    setPrivateNote("");
    setConfirmations(emptyConfirmations());
    setShowFinalConfirm(false);
  }

  function startEdit(): void {
    if (!canEdit) return;

    setSelectedTags(activeTask.selectedTags ?? []);
    setPrivateNote(activeTask.privateNote ?? "");
    setConfirmations(emptyConfirmations());
    setFormOpen(true);
  }

  function handleFinalSubmit(): void {
    if (!canContinue) return;

    const success = careerEmploymentFeedbackStorage.complete(
      activeTask.id,
      selectedTags,
      privateNote,
    );

    if (success) {
      resetForm();
    }
  }

  return (
    <>
      <section style={{ padding: "12px 20px 0" }}>
        <div
          className="wm-er-card"
          style={{
            padding: 16,
            borderLeft: `4px solid ${CAREER}`,
            background:
              "radial-gradient(circle at 96% 0%, rgba(79,70,229,0.1), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(239,246,255,0.62))",
          }}
        >
          <div style={{ fontSize: 14.5, fontWeight: 950, color: TEXT }}>
            Approved Work Feedback For Employee
          </div>

          <div
            style={{ marginTop: 5, fontSize: 12.2, color: MUTED, lineHeight: 1.5, fontWeight: 720 }}
          >
            Protected structured feedback for this completed Career employment record. This can
            support future approved work-record summaries.
          </div>

          {isCompleted && (
            <EmployerEmploymentFeedbackSubmittedCard
              task={task}
              editsUsed={editsUsed}
              lastEdit={lastEdit}
              canEdit={canEdit}
              lockMessage={lockMessage}
              onEdit={startEdit}
            />
          )}

          {!isCompleted && !formOpen && (
            <>
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 11px",
                  borderRadius: "var(--wm-radius-chip)",
                  background:
                    task.state === "dismissed"
                      ? "rgba(248,250,252,0.92)"
                      : "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(148,163,184,0.14)",
                  color: MUTED,
                  fontSize: 11.8,
                  lineHeight: 1.5,
                  fontWeight: 740,
                }}
              >
                {task.state === "dismissed"
                  ? "This task is hidden from Employer Home, but feedback can still be added from this closed record."
                  : "Work feedback is pending for this closed employment record."}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  style={PRIMARY_BUTTON_STYLE}
                >
                  Add Work Feedback
                </button>

                {task.state !== "dismissed" && (
                  <button
                    type="button"
                    onClick={() => careerEmploymentFeedbackStorage.dismiss(task.id)}
                    style={SECONDARY_BUTTON_STYLE}
                  >
                    Dismiss from Home
                  </button>
                )}
              </div>
            </>
          )}

          {formOpen && (
            <EmployerEmploymentFeedbackForm
              selectedTags={selectedTags}
              privateNote={privateNote}
              confirmations={confirmations}
              canContinue={canContinue}
              onToggleTag={(tag) => setSelectedTags((current) => toggleTag(current, tag))}
              onPrivateNoteChange={setPrivateNote}
              onConfirmationChange={(key, checked) =>
                setConfirmations((current) => ({ ...current, [key]: checked }))
              }
              onCancel={resetForm}
              onContinue={() => setShowFinalConfirm(true)}
            />
          )}
        </div>
      </section>

      <EmployerEmploymentFeedbackConfirmModal
        open={showFinalConfirm}
        isEdit={isCompleted}
        onClose={() => setShowFinalConfirm(false)}
        onConfirm={handleFinalSubmit}
      />
    </>
  );
}
