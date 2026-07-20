// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnounceStepPreview.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnounceStepPreview.tsx

import { useMemo } from "react";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { AnnounceFormData } from "../types/announceForm.types";
import { AnnounceStepPreviewSection } from "./AnnounceStepPreviewSection";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  form: AnnounceFormData;
  onSubmit: () => void;
  onEdit: (step: Step) => void;
  isSubmitting: boolean;
  errors: string[];
};

export function AnnounceStepPreview({ form, onSubmit, onEdit, isSubmitting, errors }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categories) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categories]);

  const totalVacancy = useMemo(() => {
    let total = 0;

    for (const categoryId of form.targetCategories) {
      for (const shift of form.shifts) {
        total += form.vacancyPerCategoryPerShift[categoryId]?.[shift.id] ?? 0;
      }
    }

    return total;
  }, [form]);

  return (
    <AnnounceStepPreviewSection
      form={form}
      categoryMap={categoryMap}
      totalVacancy={totalVacancy}
      onSubmit={onSubmit}
      onEdit={onEdit}
      isSubmitting={isSubmitting}
      errors={errors}
    />
  );
}
