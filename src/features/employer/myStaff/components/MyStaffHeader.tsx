// App name: Job Mitra | MyStaffHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type Props = {
  staffCount: number;
  onAdd: () => void;
};

export function MyStaffHeader({ staffCount, onAdd }: Props) {
  return (
    <DomainHero
      variant="career"
      audience="employer"
      icon={<StaffIcon />}
      title="My Staff"
      subtitle={
        staffCount > 0
          ? `${staffCount} active employee${staffCount !== 1 ? "s" : ""}`
          : "No active employees"
      }
      description="Career staff directory for permanent hires and employment records."
      trailing={
        staffCount > 0 ? (
          <button
            className="wm-primarybtn"
            type="button"
            onClick={onAdd}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
            </svg>
            Add Staff
          </button>
        ) : null
      }
    />
  );
}

function StaffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
      />
    </svg>
  );
}
