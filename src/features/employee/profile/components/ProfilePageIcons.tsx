// src/features/employee/profile/components/ProfilePageIcons.tsx

export function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}

export function IconWork() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2Zm-6 0h-4V4h4v2Z" />
    </svg>
  );
}

export function IconContact() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
    </svg>
  );
}

export function IconDocs() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z" />
    </svg>
  );
}

export function IconChecklist() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M22 5.18 10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18ZM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c1.57 0 3.04.46 4.28 1.25l1.45-1.45A9.94 9.94 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.76 0 5.26-1.12 7.07-2.93l-1.42-1.42A7.94 7.94 0 0 1 12 20Z" />
    </svg>
  );
}

export function IconCamera() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9Zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Z" />
    </svg>
  );
}

export function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6Zm-4 2h14v2H5v-2Z" />
    </svg>
  );
}

export function SectionHead(props: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(29, 78, 216, 0.08)", color: "var(--wm-brand-600)", flexShrink: 0 }}>
          {props.icon}
        </div>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text)" }}>{props.title}</div>
      </div>
      {props.sub && (
        <div style={{ marginTop: 4, marginLeft: 42, fontSize: 12, color: "var(--wm-emp-muted)" }}>{props.sub}</div>
      )}
    </div>
  );
}