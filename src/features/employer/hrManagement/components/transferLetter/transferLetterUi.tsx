// App: Job Mitra / WorkMitra_Enterprise_v2
// File: transferLetterUi.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\transferLetter\transferLetterUi.tsx

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: "text" | "date";
};

function getInputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 600,
    border: "1px solid var(--wm-er-border, #e5e7eb)",
    borderRadius: 8,
    outline: "none",
    color: "var(--wm-er-text)",
    background: "#fff",
    boxSizing: "border-box",
  };
}

export function TransferLetterFieldLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: "var(--wm-er-muted)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
      }}
    >
      {text}
    </div>
  );
}

export function TransferLetterField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = "text",
}: FieldProps) {
  return (
    <div>
      <TransferLetterFieldLabel text={label} />

      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ ...getInputStyle(), resize: "vertical", fontFamily: "inherit" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={getInputStyle()}
        />
      )}
    </div>
  );
}

export function TransferLetterPreviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--wm-er-text)",
          marginTop: 2,
          whiteSpace: "pre-wrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
