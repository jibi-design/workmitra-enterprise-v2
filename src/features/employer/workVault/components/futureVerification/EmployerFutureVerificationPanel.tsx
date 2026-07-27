// App name: Job Mitra
// File name: EmployerFutureVerificationPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\futureVerification\EmployerFutureVerificationPanel.tsx

const VAULT_PURPLE = "#7c3aed";

export function EmployerFutureVerificationPanel() {
  return (
    <section
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(124,58,237,0.15)",
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(255,255,255,0.98) 54%, rgba(245,243,255,0.68))",
        boxShadow: "0 14px 32px rgba(15,23,42,0.055)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "5px 9px",
          borderRadius: "var(--wm-radius-pill)",
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.14)",
          color: VAULT_PURPLE,
          fontSize: 10,
          fontWeight: 950,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        Future backend feature
      </div>

      <div style={{ marginTop: 10, fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
        Business Documents & Verification
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 12,
          color: "var(--wm-er-muted)",
          fontWeight: 750,
          lineHeight: 1.5,
        }}
      >
        Future versions may support employer business documents, company proof, and compliance
        records after backend and account verification are added.
      </div>

      <div
        style={{
          marginTop: 11,
          padding: "9px 10px",
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(226,232,240,0.9)",
          color: "var(--wm-er-muted)",
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1.45,
        }}
      >
        Phase-0 note: no official verification, government validation, secure cloud storage, or
        compliance approval is active in this demo.
      </div>
    </section>
  );
}
