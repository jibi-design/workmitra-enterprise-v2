// App name: Job Mitra | EmployerFavoriteAddCard.tsx — surface-glass (Wave 3)

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
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift"
      data-testid="employer-favorites-add"
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>
        Add Worker by Mitra Labs ID
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="wm-input"
          value={addInput}
          onChange={(event) => onAddInputChange(event.target.value)}
          placeholder="Enter Mitra Labs ID"
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
          className="wm-primarybtn"
          onClick={onAddManual}
          disabled={!canAdd}
          style={{ flexShrink: 0 }}
        >
          Add
        </button>
      </div>

      {addError ? (
        <div role="alert" style={{ fontSize: 11, color: "var(--wm-error, #dc2626)", marginTop: 6 }}>
          {addError}
        </div>
      ) : null}

      {addSuccess ? (
        <div
          role="status"
          style={{ fontSize: 11, color: "var(--wm-er-accent-shift, #16a34a)", marginTop: 6 }}
        >
          {addSuccess}
        </div>
      ) : null}

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 6 }}>
        Workers rated &ldquo;Hire Again&rdquo; are added automatically. You can also add manually
        here.
      </div>
    </section>
  );
}
