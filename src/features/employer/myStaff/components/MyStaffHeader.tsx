// App: Job Mitra / WorkMitra_Enterprise_v2
// File: MyStaffHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\MyStaffHeader.tsx

type Props = {
  staffCount: number;
  onAdd: () => void;
};

export function MyStaffHeader({ staffCount, onAdd }: Props) {
  return (
    <div className="wm-pageHead">
      <div style={{ flex: 1 }}>
        <div className="wm-pageTitle">My Staff</div>
        <div className="wm-pageSub">
          {staffCount > 0
            ? `${staffCount} active employee${staffCount !== 1 ? "s" : ""}`
            : "No active employees"}
        </div>
      </div>

      {staffCount > 0 && (
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
      )}
    </div>
  );
}
