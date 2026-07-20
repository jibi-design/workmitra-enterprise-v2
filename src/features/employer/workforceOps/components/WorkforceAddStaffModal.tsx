// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforceAddStaffModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforceAddStaffModal.tsx

import { useCallback, useMemo, useState } from "react";
import type { WorkforceCategory } from "../../../../shared/domains/workforce/types/workforceTypes";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceStaffService } from "../services/workforceStaffService";
import { WorkforceAddStaffCategorySection } from "./WorkforceAddStaffCategorySection";
import { WorkforceAddStaffLookupSection } from "./WorkforceAddStaffLookupSection";
import type { WorkforceLookupResult } from "./WorkforceAddStaffLookupSection";
import { WorkforceAddStaffModalShell } from "./WorkforceAddStaffModalShell";
import { WorkforceAddStaffProfileSection } from "./WorkforceAddStaffProfileSection";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (staffId: string) => void;
};

export function WorkforceAddStaffModal({ isOpen, onClose, onAdded }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);

  const [uniqueId, setUniqueId] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [initialRating, setInitialRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");

  const [looked, setLooked] = useState(false);
  const [lookupResult, setLookupResult] = useState<WorkforceLookupResult | null>(null);

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatVal, setNewCatVal] = useState("");
  const [newCatErr, setNewCatErr] = useState("");
  const [catList, setCatList] = useState<WorkforceCategory[]>(categories);

  const [errors, setErrors] = useState<string[]>([]);

  const addNewCategory = useCallback(() => {
    const result = workforceCategoryService.create(newCatVal);

    if (result.success) {
      setNewCatVal("");
      setShowNewCat(false);
      setNewCatErr("");
      setCatList(workforceCategoryService.getAll());
      return;
    }

    setNewCatErr(result.errors?.[0] ?? "Failed to add.");
  }, [newCatVal]);

  const handleLookup = useCallback(() => {
    const trimmed = uniqueId.trim();

    if (!trimmed) return;

    const result = workforceStaffService.lookupEmployee(trimmed);
    setLookupResult(result);
    setLooked(true);
  }, [uniqueId]);

  const handleUniqueIdChange = useCallback((value: string) => {
    setUniqueId(value);
    setLooked(false);
    setLookupResult(null);
    setErrors([]);
  }, []);

  const toggleCat = useCallback((catId: string) => {
    setSelectedCats((previous) =>
      previous.includes(catId) ? previous.filter((id) => id !== catId) : [...previous, catId],
    );
  }, []);

  const cancelNewCategory = useCallback(() => {
    setShowNewCat(false);
    setNewCatVal("");
    setNewCatErr("");
  }, []);

  const resetForm = useCallback(() => {
    setUniqueId("");
    setSelectedCats([]);
    setInitialRating(null);
    setRatingComment("");
    setLooked(false);
    setLookupResult(null);
    setErrors([]);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(() => {
    const result = workforceStaffService.add({
      employeeUniqueId: uniqueId.trim(),
      categories: selectedCats,
      rating: initialRating ?? undefined,
      ratingComment: ratingComment.trim() || undefined,
    });

    if (result.success && result.id) {
      onAdded?.(result.id);
      handleClose();
      return;
    }

    setErrors(result.errors ?? ["Failed to add staff."]);
  }, [handleClose, initialRating, onAdded, ratingComment, selectedCats, uniqueId]);

  const canSubmit = uniqueId.trim().length > 0 && selectedCats.length > 0;

  if (!isOpen) return null;

  return (
    <WorkforceAddStaffModalShell
      errors={errors}
      canSubmit={canSubmit}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <WorkforceAddStaffLookupSection
        uniqueId={uniqueId}
        looked={looked}
        lookupResult={lookupResult}
        onUniqueIdChange={handleUniqueIdChange}
        onLookup={handleLookup}
      />

      <WorkforceAddStaffCategorySection
        catList={catList}
        selectedCats={selectedCats}
        looked={looked}
        showNewCat={showNewCat}
        newCatVal={newCatVal}
        newCatErr={newCatErr}
        onToggleCat={toggleCat}
        onShowNewCat={() => setShowNewCat(true)}
        onNewCatValueChange={(value) => {
          setNewCatVal(value);
          setNewCatErr("");
        }}
        onAddNewCategory={addNewCategory}
        onCancelNewCategory={cancelNewCategory}
      />

      <WorkforceAddStaffProfileSection
        initialRating={initialRating}
        ratingComment={ratingComment}
        onRatingChange={setInitialRating}
        onRatingCommentChange={setRatingComment}
      />
    </WorkforceAddStaffModalShell>
  );
}
