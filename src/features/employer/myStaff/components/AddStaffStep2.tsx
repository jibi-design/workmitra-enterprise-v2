// src/features/employer/myStaff/components/AddStaffStep2.tsx

import type { IdRegistryEntry } from "../helpers/addStaffHelpers";
import { EMPLOYMENT_TYPES } from "../helpers/addStaffHelpers";
import type { StaffEmploymentType } from "../storage/myStaff.storage";
import { INPUT_STYLE, LABEL_STYLE, CANCEL_BTN_STYLE, chipBtnStyle } from "../helpers/addStaffStyles";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type AddStaffStep2Props = {
  lookupResult: IdRegistryEntry;
  jobTitle: string;
  onJobTitleChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  newCategory: string;
  onNewCategoryChange: (val: string) => void;
  showNewCategory: boolean;
  onToggleNewCategory: (show: boolean) => void;
  categories: string[];
  employmentType: StaffEmploymentType;
  onEmploymentTypeChange: (val: StaffEmploymentType) => void;
  joinDateStr: string;
  onJoinDateChange: (val: string) => void;
  maxDate: string;
  canSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function AddStaffStep2({
  lookupResult,
  jobTitle,
  onJobTitleChange,
  category,
  onCategoryChange,
  newCategory,
  onNewCategoryChange,
  showNewCategory,
  onToggleNewCategory,
  categories,
  employmentType,
  onEmploymentTypeChange,
  joinDateStr,
  onJoinDateChange,
  maxDate,
  canSubmit,
  onSubmit,
  onBack,
}: AddStaffStep2Props) {
  return (
    <>
      <div
        style={{
          padding: 10,
          borderRadius: 8,
          background: "rgba(22,163,74,0.06)",
          border: "1px solid rgba(22,163,74,0.12)",
          marginBottom: 14,
          fontSize: 12,
          fontWeight: 800,
          color: "var(--wm-er-text)",
        }}
      >
        Adding: {lookupResult.name} ({lookupResult.uniqueId})
      </div>

      <label style={LABEL_STYLE}>Job Title *</label>
      <input
        type="text"
        value={jobTitle}
        onChange={(e) => onJobTitleChange(e.target.value)}
        placeholder="e.g. Warehouse Supervisor, Driver, Cleaner"
        maxLength={100}
        style={{ ...INPUT_STYLE, marginBottom: 12 }}
      />

      <label style={LABEL_STYLE}>Category / Department</label>
      {!showNewCategory ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          {categories.length > 0 ? (
            <>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  style={chipBtnStyle(category === cat)}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onToggleNewCategory(true)}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1px dashed var(--wm-er-border)",
                  background: "transparent",
                  color: "var(--wm-er-muted)",
                  cursor: "pointer",
                }}
              >
                + New
              </button>
            </>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 6 }}>
                No categories yet.
              </div>
              <button
                type="button"
                onClick={() => onToggleNewCategory(true)}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1px dashed var(--wm-er-border)",
                  background: "transparent",
                  color: "var(--wm-er-muted)",
                  cursor: "pointer",
                }}
              >
                + Create Category
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => onNewCategoryChange(e.target.value)}
            placeholder="New category name"
            maxLength={50}
            style={{ ...INPUT_STYLE, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => { onToggleNewCategory(false); onNewCategoryChange(""); }}
            style={{
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid var(--wm-er-border)",
              background: "transparent",
              fontWeight: 800,
              fontSize: 11,
              color: "var(--wm-er-muted)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <label style={{ ...LABEL_STYLE, marginTop: 12 }}>Employment Type</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
        {EMPLOYMENT_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onEmploymentTypeChange(t.value)}
            style={chipBtnStyle(employmentType === t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label style={{ ...LABEL_STYLE, marginTop: 12 }}>Joining Date</label>
      <input
        type="date"
        value={joinDateStr}
        max={maxDate}
        onChange={(e) => onJoinDateChange(e.target.value)}
        style={{ ...INPUT_STYLE, marginBottom: 4 }}
      />
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 8 }}>
        Select the date this employee actually started working. Defaults to today.
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" onClick={onBack} style={CANCEL_BTN_STYLE}>Back</button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: canSubmit ? "#16a34a" : "#e5e7eb",
            color: canSubmit ? "#fff" : "#9ca3af",
            fontWeight: 900,
            fontSize: 13,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          Add to My Staff
        </button>
      </div>
    </>
  );
}