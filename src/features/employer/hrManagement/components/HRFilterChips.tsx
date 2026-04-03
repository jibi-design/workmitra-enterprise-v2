// src/features/employer/hrManagement/components/HRFilterChips.tsx
//
// Filter chips for HR Management page.
// Filters: All | Probation | Contract Expiring
// Only visible when "Active" tab is selected (most useful there).

type FilterId = "all" | "probation" | "contract_expiring";

type Props = {
  activeFilter: FilterId;
  onChange: (filter: FilterId) => void;
};

type ChipDef = {
  key: FilterId;
  label: string;
};

const CHIPS: ChipDef[] = [
  { key: "all", label: "All" },
  { key: "probation", label: "Probation" },
  { key: "contract_expiring", label: "Contract expiring" },
];

export type { FilterId };

export function HRFilterChips({ activeFilter, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 2,
      }}
    >
      {CHIPS.map((chip) => {
        const isActive = activeFilter === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onChange(chip.key)}
            style={{
              flex: "0 0 auto",
              padding: "5px 12px",
              borderRadius: 999,
              border: isActive ? "none" : "1px solid var(--wm-er-border, #e5e7eb)",
              background: isActive ? "var(--wm-er-accent-hr, #7c3aed)" : "#fff",
              color: isActive ? "#fff" : "var(--wm-er-muted, #64748b)",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
