// App name: Job Mitra
// File name: MyShiftWorkspacesSearch.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\MyShiftWorkspacesSearch.tsx

type MyShiftWorkspacesSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function MyShiftWorkspacesSearch({ query, onQueryChange }: MyShiftWorkspacesSearchProps) {
  return (
    <div className="wm-field" style={{ marginTop: 12 }}>
      <div className="wm-label">Search groups</div>
      <input
        className="wm-input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Company, job, or location"
        aria-label="Search groups"
      />
    </div>
  );
}
