
// src/features/employer/hrManagement/components/PerformanceReviewFormParts.tsx

/* ------------------------------------------------ */
/* Field Label                                      */
/* ------------------------------------------------ */
export function FieldLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
      {text}
    </div>
  );
}

/* ------------------------------------------------ */
/* Field (text or textarea)                         */
/* ------------------------------------------------ */
const INPUT_STYLE: React.CSSProperties = {
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

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

export function Field({ label, value, onChange, placeholder, multiline }: FieldProps) {
  return (
    <div>
      <FieldLabel text={label} />
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit" }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={INPUT_STYLE}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Preview Block                                    */
/* ------------------------------------------------ */
export function PreviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 2, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}
