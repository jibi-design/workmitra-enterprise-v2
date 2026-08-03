// App name: Job Mitra | EmployerShiftTemplatesPage.tsx — stackGrid layout (Wave 3)

import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
import { EmployerShiftTemplatesHeader } from "../components/EmployerShiftTemplatesHeader";
import { EmployerShiftTemplatesList } from "../components/EmployerShiftTemplatesList";
import { shiftTemplatesStorage, type ShiftTemplate } from "../storage/shiftTemplatesStorage";
import { getEmployerTemplatesKey } from "../storage/employerShift.keys";

let rawCache: string | null = "__init__";
let keyCache = "";
let templatesCache: ShiftTemplate[] = [];

function getSnapshot(): ShiftTemplate[] {
  const key = getEmployerTemplatesKey();
  const raw = localStorage.getItem(key);
  if (raw !== rawCache || key !== keyCache) {
    rawCache = raw;
    keyCache = key;
    templatesCache = shiftTemplatesStorage.getAll();
  }
  return templatesCache;
}

export function EmployerShiftTemplatesPage() {
  const nav = useNavigate();
  const templates = useSyncExternalStore(shiftTemplatesStorage.subscribe, getSnapshot, getSnapshot);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function handleUse(template: ShiftTemplate) {
    shiftTemplatesStorage.setPending({
      jobName: template.jobName,
      companyName: template.companyName,
      category: template.category,
      experience: template.experience,
      payPerDay: template.payPerDay,
      locationName: template.locationName,
      description: template.description,
      shiftTiming: template.shiftTiming,
      vacancies: template.vacancies,
      waitingBuffer: template.waitingBuffer,
      mustHave: template.mustHave,
      goodToHave: template.goodToHave,
      whatWeProvide: template.whatWeProvide,
      quickQuestions: template.quickQuestions,
      dressCode: template.dressCode,
    });
    nav(ROUTE_PATHS.employerShiftCreate);
  }

  function handleRenameOpen(template: ShiftTemplate) {
    setRenameId(template.id);
    setRenameValue(template.name);
  }

  function handleRenameSave() {
    if (!renameId || !renameValue.trim()) return;
    shiftTemplatesStorage.rename(renameId, renameValue);
    setRenameId(null);
    setRenameValue("");
  }

  function handleDelete() {
    if (!deleteId) return;
    shiftTemplatesStorage.delete(deleteId);
    setDeleteId(null);
  }

  return (
    <div
      className="wm-er-vShift wm-stackGrid"
      data-testid="employer-shift-templates-page"
      style={{ gap: "var(--wm-stack-gap)", paddingBottom: 32 }}
    >
      <EmployerShiftTemplatesHeader totalCount={templates.length} />

      <div
        className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shift-surface-glass--compact"
        role="note"
      >
        To save a template, open any shift post in{" "}
        <strong style={{ color: "var(--wm-er-text)" }}>My Posts</strong> and tap &ldquo;Save as
        Template&rdquo;.
      </div>

      {templates.length === 0 ? (
        <EnterpriseEmpty
          domain="shift"
          title="No templates yet"
          subtitle="Save frequently used shift formats as templates to fill new posts in one tap."
          primaryLabel="Go to My Posts"
          onPrimary={() => nav(ROUTE_PATHS.employerShiftPosts)}
          testId="shift-templates-empty"
        />
      ) : (
        <EmployerShiftTemplatesList
          templates={templates}
          renameId={renameId}
          renameValue={renameValue}
          deleteId={deleteId}
          onRenameValue={setRenameValue}
          onRenameSave={handleRenameSave}
          onRenameCancel={() => setRenameId(null)}
          onRenameOpen={handleRenameOpen}
          onDeleteRequest={setDeleteId}
          onDeleteConfirm={handleDelete}
          onDeleteCancel={() => setDeleteId(null)}
          onUse={handleUse}
        />
      )}
    </div>
  );
}
