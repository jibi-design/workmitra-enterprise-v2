// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferLetterModalHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\offerLetter\OfferLetterModalHeader.tsx

type Props = {
  step: 1 | 2;
};

export function OfferLetterModalHeader({ step }: Props) {
  return (
    <>
      <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
        {step === 1 ? "Prepare Offer Letter" : "Review & Send"}
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
        {step === 1
          ? "Fill in the offer details. The candidate will receive this in-app."
          : "Review the offer letter before sending. This cannot be changed after sending."}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            height: 3,
            borderRadius: 999,
            background: "var(--wm-er-accent-hr)",
          }}
        />

        <div
          style={{
            flex: 1,
            height: 3,
            borderRadius: 999,
            background: step === 2 ? "var(--wm-er-accent-hr)" : "var(--wm-er-border, #e5e7eb)",
          }}
        />
      </div>
    </>
  );
}
