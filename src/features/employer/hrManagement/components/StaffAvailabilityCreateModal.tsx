// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffAvailabilityCreateModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\StaffAvailabilityCreateModal.tsx

import { useCallback, useMemo, useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { MAX_REQUIRED_COUNT, MIN_REQUIRED_COUNT } from "../helpers/staffAvailabilityConstants";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { staffAvailabilityStorage } from "../storage/staffAvailability.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type {
  AvailabilityFormBatch,
  AvailabilityFormEmployee,
  AvailabilityMode,
  StaffAvailabilityFormData,
} from "../types/staffAvailability.types";
import { StaffAvailabilityEmployeePicker } from "./StaffAvailabilityEmployeePicker";
import { StaffAvailabilityModalActions } from "./staffAvailability/StaffAvailabilityModalActions";
import { StaffAvailabilityModalHeader } from "./staffAvailability/StaffAvailabilityModalHeader";
import { StaffAvailabilityModeToggle } from "./staffAvailability/StaffAvailabilityModeToggle";
import { StaffAvailabilityRequestFields } from "./staffAvailability/StaffAvailabilityRequestFields";
import { StaffAvailabilityValidationHint } from "./staffAvailability/StaffAvailabilityValidationHint";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function StaffAvailabilityCreateModal({ open, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<AvailabilityMode>("simple");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateNeeded, setDateNeeded] = useState("");
  const [timeNeeded, setTimeNeeded] = useState("");
  const [location, setLocation] = useState("");
  const [requiredCount, setRequiredCount] = useState(1);

  const employees = useMemo<HRCandidateRecord[]>(
    () => (open ? hrManagementStorage.getAll().filter((record) => record.status === "active") : []),
    [open],
  );

  const [selectedEmployees, setSelectedEmployees] = useState<AvailabilityFormEmployee[]>([]);
  const [batches, setBatches] = useState<AvailabilityFormBatch[]>([]);

  const resetForm = useCallback(() => {
    setMode("simple");
    setTitle("");
    setDescription("");
    setDateNeeded("");
    setTimeNeeded("");
    setLocation("");
    setRequiredCount(1);
    setSelectedEmployees([]);
    setBatches([]);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleModeChange = (newMode: AvailabilityMode) => {
    setMode(newMode);
    setSelectedEmployees([]);
    setBatches([]);
  };

  const totalSelected =
    mode === "simple"
      ? selectedEmployees.length
      : batches.reduce((sum, batch) => sum + batch.employees.length, 0);

  const canSubmit =
    title.trim().length > 0 &&
    dateNeeded.length > 0 &&
    timeNeeded.trim().length > 0 &&
    totalSelected > 0 &&
    requiredCount >= MIN_REQUIRED_COUNT &&
    requiredCount <= MAX_REQUIRED_COUNT &&
    totalSelected >= requiredCount;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const form: StaffAvailabilityFormData = {
      title,
      description,
      dateNeeded,
      timeNeeded,
      location,
      mode,
      requiredCount,
      selectedEmployees: mode === "simple" ? selectedEmployees : [],
      batches: mode === "batch" ? batches : [],
    };

    staffAvailabilityStorage.createRequest(form);
    onSuccess();
    handleClose();
  };

  return (
    <CenterModal
      open={open}
      onBackdropClose={handleClose}
      ariaLabel="Create Availability Request"
      maxWidth={520}
    >
      <div style={{ padding: 20, maxHeight: "85vh", overflowY: "auto" }}>
        <StaffAvailabilityModalHeader />

        <StaffAvailabilityModeToggle mode={mode} onModeChange={handleModeChange} />

        <StaffAvailabilityRequestFields
          title={title}
          description={description}
          dateNeeded={dateNeeded}
          timeNeeded={timeNeeded}
          location={location}
          requiredCount={requiredCount}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onDateNeededChange={setDateNeeded}
          onTimeNeededChange={setTimeNeeded}
          onLocationChange={setLocation}
          onRequiredCountChange={setRequiredCount}
        />

        <div
          style={{
            padding: "14px 12px",
            borderRadius: 10,
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            background: "#fafafa",
            marginBottom: 16,
          }}
        >
          <StaffAvailabilityEmployeePicker
            employees={employees}
            mode={mode}
            selectedEmployees={selectedEmployees}
            onSelectedChange={setSelectedEmployees}
            batches={batches}
            onBatchesChange={setBatches}
          />
        </div>

        <StaffAvailabilityValidationHint
          totalSelected={totalSelected}
          requiredCount={requiredCount}
        />

        <StaffAvailabilityModalActions
          canSubmit={canSubmit}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      </div>
    </CenterModal>
  );
}
