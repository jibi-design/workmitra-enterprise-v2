// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminBroadcastModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminBroadcastModal.tsx

import { CenterModal } from "../../../../shared/components/CenterModal";
import type { BroadcastTarget } from "../helpers/adminActions";

type Props = {
  open: boolean;
  target: BroadcastTarget;
  title: string;
  body: string;
  onClose: () => void;
  onTargetChange: (value: BroadcastTarget) => void;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSend: () => void;
};

export function AdminBroadcastModal({
  open,
  target,
  title,
  body,
  onClose,
  onTargetChange,
  onTitleChange,
  onBodyChange,
  onSend,
}: Props) {
  const canSend = Boolean(title.trim());

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Send Broadcast">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-ad-navy)" }}>
          Send Broadcast
        </div>

        <div
          style={{ fontSize: 12, color: "var(--wm-ad-navy-400)", marginTop: 4, lineHeight: 1.5 }}
        >
          Send a notification to selected user groups. Phase-0: stored in their notification list.
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--wm-ad-navy-400)",
              marginBottom: 8,
            }}
          >
            Send to
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "employers", "employees"] as BroadcastTarget[]).map((item) => (
              <button
                key={item}
                type="button"
                className="wm-ad-filterChip"
                data-active={target === item}
                onClick={() => onTargetChange(item)}
              >
                {item === "all" ? "All Users" : item === "employers" ? "Employers" : "Employees"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--wm-ad-navy-400)",
              marginBottom: 6,
            }}
          >
            Title (required)
          </div>

          <input
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Notification title..."
            maxLength={100}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid var(--wm-ad-border)",
              borderRadius: 10,
              background: "var(--wm-ad-card-inner)",
              color: "var(--wm-ad-navy)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--wm-ad-navy-400)",
              marginBottom: 6,
            }}
          >
            Message (optional)
          </div>

          <textarea
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder="Additional details..."
            maxLength={300}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid var(--wm-ad-border)",
              borderRadius: 10,
              background: "var(--wm-ad-card-inner)",
              color: "var(--wm-ad-navy)",
              resize: "vertical",
              minHeight: 60,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 800,
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px solid var(--wm-ad-border)",
              background: "var(--wm-ad-white)",
              color: "var(--wm-ad-navy)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSend}
            onClick={onSend}
            style={{
              fontSize: 13,
              fontWeight: 900,
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              background: "var(--wm-ad-green)",
              color: "#fff",
              cursor: "pointer",
              opacity: canSend ? 1 : 0.4,
            }}
          >
            Send Broadcast
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
