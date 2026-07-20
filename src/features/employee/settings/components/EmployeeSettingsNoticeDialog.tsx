// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsNoticeDialog.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsNoticeDialog.tsx

export type EmployeeSettingsNoticeTone = "info" | "warn";

export type EmployeeSettingsNotice = {
  title: string;
  message: string;
  tone: EmployeeSettingsNoticeTone;
} | null;

type Props = {
  notice: EmployeeSettingsNotice;
  onClose: () => void;
};

export function EmployeeSettingsNoticeDialog({ notice, onClose }: Props) {
  if (!notice) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notice"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        className="wm-ee-card"
        style={{
          width: "100%",
          maxWidth: 460,
          margin: 0,
          borderColor: notice.tone === "warn" ? "rgba(217,119,6,0.22)" : "rgba(15,118,110,0.22)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: 14, color: "var(--wm-er-text)" }}>
          {notice.title}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
          {notice.message}
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
