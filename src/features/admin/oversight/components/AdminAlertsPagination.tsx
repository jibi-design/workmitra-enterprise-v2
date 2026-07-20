// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminAlertsPagination.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminAlertsPagination.tsx

type Props = {
  totalPages: number;
  safePage: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function AdminAlertsPagination({ totalPages, safePage, onPrevious, onNext }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="wm-ad-pagination">
      <button
        type="button"
        className="wm-ad-pageBtn"
        disabled={safePage === 0}
        onClick={onPrevious}
      >
        Previous
      </button>

      <span className="wm-ad-pageInfo">
        Page {safePage + 1} of {totalPages}
      </span>

      <button
        type="button"
        className="wm-ad-pageBtn"
        disabled={safePage >= totalPages - 1}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}
