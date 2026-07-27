// App name: Job Mitra
// File name: ShiftToast.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\ShiftToast.tsx

export function ShiftToast({ message }: { readonly message: string }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 20px",
        borderRadius: "var(--wm-radius-button)",
        background: "var(--wm-er-accent-shift, #16a34a)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 800,
        zIndex: 100,
        boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
      }}
    >
      {message}
    </div>
  );
}
