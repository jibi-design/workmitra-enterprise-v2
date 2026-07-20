// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffAvailabilityModalActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\staffAvailability\StaffAvailabilityModalActions.tsx

type Props = {
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function StaffAvailabilityModalActions({ canSubmit, onCancel, onSubmit }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button className="wm-outlineBtn" type="button" onClick={onCancel}>
        Cancel
      </button>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{ opacity: canSubmit ? 1 : 0.5 }}
      >
        Send Request
      </button>
    </div>
  );
}
