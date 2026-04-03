// src/features/employer/myStaff/components/AddStaffModal.tsx
//
// 2-step modal: Step 1 → Unique ID lookup, Step 2 → Job details + submit.

import { useState } from "react";
import { myStaffStorage } from "../storage/myStaff.storage";
import type { StaffEmploymentType } from "../storage/myStaff.storage";
import { employmentLifecycleStorage } from "../../../employee/employment/storage/employmentLifecycle.storage";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { lookupUniqueId } from "../helpers/addStaffHelpers";
import type { IdRegistryEntry } from "../helpers/addStaffHelpers";
import { AddStaffStep1 } from "./AddStaffStep1";
import { AddStaffStep2 } from "./AddStaffStep2";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  open: boolean;
  categories: string[];
  onClose: () => void;
  onAdded: (name: string, jobTitle: string) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function AddStaffModal({ open, categories, onClose, onAdded }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [uniqueId, setUniqueId] = useState("");
  const [lookupResult, setLookupResult] = useState<IdRegistryEntry | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [employmentType, setEmploymentType] = useState<StaffEmploymentType>("full_time");
  const [nowMs] = useState(() => Date.now());
  const [joinDateStr, setJoinDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const reset = () => {
    setStep(1);
    setUniqueId("");
    setLookupResult(null);
    setLookupError("");
    setJobTitle("");
    setCategory("");
    setNewCategory("");
    setShowNewCategory(false);
    setEmploymentType("full_time");
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  /* ---- Step 1 handlers ---- */
  const handleUniqueIdChange = (val: string) => {
    setUniqueId(val);
    setLookupError("");
    setLookupResult(null);
  };

  const handleLookup = () => {
    const trimmed = uniqueId.trim();
    if (!trimmed) {
      setLookupError("Please enter a Unique ID.");
      return;
    }
    const existing = myStaffStorage.findByUniqueId(trimmed);
    if (existing) {
      setLookupError("This employee is already on your staff list.");
      setLookupResult(null);
      return;
    }
    const found = lookupUniqueId(trimmed);
    if (!found) {
      setLookupError("No employee found with this Unique ID. Please check and try again.");
      setLookupResult(null);
      return;
    }
    if (found.role !== "employee") {
      setLookupError("This ID belongs to an employer account, not an employee.");
      setLookupResult(null);
      return;
    }
    setLookupResult(found);
    setLookupError("");
  };

  /* ---- Step 2 submit ---- */
  const handleSubmit = async () => {
    if (!lookupResult || !jobTitle.trim()) return;

    const finalCategory = showNewCategory ? newCategory.trim() : category;

    if (showNewCategory && newCategory.trim()) {
      myStaffStorage.addCategory(newCategory.trim());
    }

    const parsedJoinDate = new Date(joinDateStr + "T00:00:00").getTime();
    const joinDate = Number.isNaN(parsedJoinDate) ? Date.now() : parsedJoinDate;
    const staffId = myStaffStorage.addStaff({
      employeeUniqueId: lookupResult.uniqueId,
      employeeName: lookupResult.name,
      jobTitle: jobTitle.trim(),
      category: finalCategory || "General",
      employmentType,
      joinedAt: joinDate,
      status: "active",
      addMethod: "manually_added",
      employeeConfirmed: false,
    });

    if (staffId) {
      try {
        const profileRaw = localStorage.getItem("wm_employer_profile_v1");
        const profile = profileRaw ? JSON.parse(profileRaw) as { companyName?: string } : null;
        const companyName = profile?.companyName || "Unknown Company";

        employmentLifecycleStorage.createEmployment({
          careerPostId: "manual_" + staffId,
          companyName,
          jobTitle: jobTitle.trim(),
          department: finalCategory || "General",
          location: "",
          joinedAt: joinDate,
          status: "active",
          verified: false,
          hireMethod: "manually_added",
        });
      } catch { /* non-critical */ }
    }

    try {
      const { hrManagementStorage } = await import(
        "../../../employer/hrManagement/storage/hrManagement.storage"
      );

      const profRaw = localStorage.getItem("wm_employer_profile_v1");
      const prof = profRaw ? JSON.parse(profRaw) as { companyName?: string } : null;

      hrManagementStorage.createDirectHRRecord({
        careerPostId: "manual_" + staffId,
        applicationId: "manual_" + staffId,
        employeeUniqueId: lookupResult.uniqueId,
        employeeName: lookupResult.name,
        jobTitle: jobTitle.trim(),
        department: finalCategory || "General",
        location: prof?.companyName || "",
      });
    } catch { /* non-critical */ }

    const addedName = lookupResult.name;
    const addedTitle = jobTitle.trim();
    handleClose();
    onAdded(addedName, addedTitle);
  };

  const canSubmit = !!lookupResult && !!jobTitle.trim();

  const maxDate = `${new Date(nowMs).getFullYear()}-${String(new Date(nowMs).getMonth() + 1).padStart(2, "0")}-${String(new Date(nowMs).getDate()).padStart(2, "0")}`;

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Add Staff">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 1000, color: "var(--wm-er-text)", marginBottom: 4 }}>
          Add Staff
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 14 }}>
          Step {step} of 2
        </div>

        {step === 1 && (
          <AddStaffStep1
            uniqueId={uniqueId}
            onUniqueIdChange={handleUniqueIdChange}
            lookupResult={lookupResult}
            lookupError={lookupError}
            onLookup={handleLookup}
            onNext={() => { if (lookupResult) setStep(2); }}
            onCancel={handleClose}
          />
        )}

        {step === 2 && lookupResult && (
          <AddStaffStep2
            lookupResult={lookupResult}
            jobTitle={jobTitle}
            onJobTitleChange={setJobTitle}
            category={category}
            onCategoryChange={setCategory}
            newCategory={newCategory}
            onNewCategoryChange={setNewCategory}
            showNewCategory={showNewCategory}
            onToggleNewCategory={setShowNewCategory}
            categories={categories}
            employmentType={employmentType}
            onEmploymentTypeChange={setEmploymentType}
            joinDateStr={joinDateStr}
            onJoinDateChange={setJoinDateStr}
            maxDate={maxDate}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </CenterModal>
  );
}