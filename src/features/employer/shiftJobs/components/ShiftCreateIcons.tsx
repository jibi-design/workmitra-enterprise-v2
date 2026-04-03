// src/features/employer/shiftJobs/components/ShiftCreateIcons.tsx

export function IconInfo() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" /></svg>);
}
export function IconWorkers() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" /></svg>);
}
export function IconSchedule() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" /></svg>);
}
export function IconLocation() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>);
}
export function IconRequirements() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM9.5 16.5 6 13l1.41-1.41L9.5 13.67l5.09-5.09L16 10l-6.5 6.5ZM13 9V3.5L18.5 9H13Z" /></svg>);
}
export function IconPlus() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" /></svg>);
}

const ICON_WRAP: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "rgba(22, 163, 74, 0.08)", color: "#16a34a", flexShrink: 0,
};

export function SectionHead(props: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={ICON_WRAP}>{props.icon}</div>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>{props.title}</div>
      </div>
      {props.sub && (<div style={{ marginTop: 4, marginLeft: 42, fontSize: 12, color: "var(--wm-er-muted)" }}>{props.sub}</div>)}
    </div>
  );
}