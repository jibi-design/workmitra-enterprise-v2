// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffAvailabilityValidationHint.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\staffAvailability\StaffAvailabilityValidationHint.tsx

type Props = {
  totalSelected: number;
  requiredCount: number;
};

export function StaffAvailabilityValidationHint({ totalSelected, requiredCount }: Props) {
  if (totalSelected === 0 || totalSelected >= requiredCount) return null;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: "8px 12px",
        borderRadius: 8,
        background: "#fffbeb",
        border: "1px solid #fde68a",
        fontSize: 12,
        fontWeight: 700,
        color: "#d97706",
      }}
    >
      You need at least {requiredCount} employee{requiredCount > 1 ? "s" : ""} selected, but only{" "}
      {totalSelected} selected. Add more employees.
    </div>
  );
}
