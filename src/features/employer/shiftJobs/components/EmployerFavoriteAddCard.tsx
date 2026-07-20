// App name: Job Mitra
// File name: EmployerFavoriteAddCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerFavoriteAddCard.tsx

type EmployerFavoriteAddCardProps = {
  addInput: string;
  addName: string;
  addError: string;
  addSuccess: string;
  onAddInputChange: (value: string) => void;
  onAddNameChange: (value: string) => void;
  onAddManual: () => void;
};

export function EmployerFavoriteAddCard({
  addInput,
  addName,
  addError,
  addSuccess,
  onAddInputChange,
  onAddNameChange,
  onAddManual,
}: EmployerFavoriteAddCardProps) {
  const canAdd = Boolean(addInput.trim() && addName.trim());

  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>
        Add Worker by Job Mitra ID
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="wm-input"
          value={addInput}
          onChange={(event) => onAddInputChange(event.target.value)}
          placeholder="Enter Job Mitra ID"
          maxLength={20}
          style={{ flex: "2 1 140px" }}
        />

        <input
          className="wm-input"
          value={addName}
          onChange={(event) => onAddNameChange(event.target.value)}
          placeholder="Worker name"
          maxLength={80}
          style={{ flex: "2 1 120px" }}
        />

        <button
          type="button"
          onClick={onAddManual}
          disabled={!canAdd}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "0 16px",
            height: 42,
            borderRadius: 10,
            border: "none",
            background: "var(--wm-er-accent-shift, #16a34a)",
            color: "#fff",
            cursor: "pointer",
            opacity: canAdd ? 1 : 0.5,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Add
        </button>
      </div>

      {addError && (
        <div style={{ fontSize: 11, color: "var(--wm-error, #dc2626)", marginTop: 6 }}>
          {addError}
        </div>
      )}

      {addSuccess && (
        <div style={{ fontSize: 11, color: "var(--wm-er-accent-shift, #16a34a)", marginTop: 6 }}>
          {addSuccess}
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 6 }}>
        Workers rated &ldquo;Hire Again&rdquo; are added automatically. You can also add manually
        here.
      </div>
    </div>
  );
}
