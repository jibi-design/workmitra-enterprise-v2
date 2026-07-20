// App name: Job Mitra
// File name: EmployerShiftPostsHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftPostsHeader.tsx

type EmployerShiftPostsHeaderProps = {
  readonly draftCount?: number;
  readonly onTemplates: () => void;
  readonly onCreate: () => void;
};

export function EmployerShiftPostsHeader({
  draftCount = 0,
  onTemplates,
  onCreate,
}: EmployerShiftPostsHeaderProps) {
  return (
    <div className="wm-pageHead">
      <div>
        <div className="wm-pageTitle">My Posts</div>

        <div className="wm-pageSub">
          All your shift posts
          {draftCount > 0 ? ` · ${draftCount} local draft${draftCount > 1 ? "s" : ""} saved` : ""}
        </div>
      </div>

      <div className="wm-shiftPostsHeaderActions">
        {draftCount > 0 && (
          <span className="wm-shiftPostsDraftBadge">
            {draftCount} Draft{draftCount > 1 ? "s" : ""}
          </span>
        )}

        <button
          className="wm-outlineBtn wm-shiftPostsTemplatesBtn"
          type="button"
          onClick={onTemplates}
        >
          Templates
        </button>

        <button className="wm-primarybtn wm-shiftPostsCreateBtn" type="button" onClick={onCreate}>
          <IconPlus /> New Shift
        </button>
      </div>
    </div>
  );
}

export function IconPlus() {
  return (
    <svg
      className="wm-shiftPostsPlusIcon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
    </svg>
  );
}
