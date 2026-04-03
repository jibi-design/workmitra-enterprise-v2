// src/shared/components/notifications/NotificationCard.tsx
//
// Shared notification card with WhatsApp-style swipe-to-delete.
// Left swipe reveals red delete button. Tap to navigate.
// Unread: tinted bg + colored dot + bold text.
// Read: transparent bg + muted text.

import { useRef, useState, useCallback } from "react";
import { type NotificationDomainStyle, TEXT_SECONDARY, TEXT_TERTIARY } from "./notificationTypes";
import { formatNotificationTime } from "./notificationHelpers";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  id: string;
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  domainStyle: NotificationDomainStyle;
  onTap: (id: string) => void;
  onDelete?: (id: string) => void;
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const SWIPE_THRESHOLD = 70;
const MAX_SWIPE = 80;
const DELETE_BTN_WIDTH = 80;

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NotificationCard({ id, title, body, createdAt, isRead, domainStyle, onTap, onDelete }: Props) {
  const ds = domainStyle;
  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const draggingRef = useRef(false);
  const isHorizontal = useRef<boolean | null>(null);

 const handleStart = useCallback((x: number, y: number) => {
    startX.current = x;
    startY.current = y;
    draggingRef.current = true;
    setIsDragging(true);
    isHorizontal.current = null;
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    if (!draggingRef.current) return;
    const dx = x - startX.current;
    const dy = y - startY.current;

    if (isHorizontal.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontal.current) return;

    const clamped = Math.max(-MAX_SWIPE, Math.min(0, swiped ? dx - DELETE_BTN_WIDTH : dx));
    setOffsetX(clamped);
  }, [swiped]);

  const handleEnd = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    isHorizontal.current = null;

    if (offsetX < -SWIPE_THRESHOLD) {
      setOffsetX(-DELETE_BTN_WIDTH);
      setSwiped(true);
    } else {
      setOffsetX(0);
      setSwiped(false);
    }
  }, [offsetX]);

  function handleTap() {
    if (swiped) { setOffsetX(0); setSwiped(false); return; }
    onTap(id);
  }

  function handleDelete() {
    setOffsetX(-200);
    setTimeout(() => onDelete?.(id), 200);
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "0 8px 8px 0", marginBottom: 8 }}>
      {/* Delete button behind card */}
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete notification"
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: DELETE_BTN_WIDTH, background: "#ef4444",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "0 8px 8px 0",
          }}
        >
          <TrashIcon />
        </button>
      )}

      {/* Slidable card */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleTap}
        onKeyDown={(e) => { if (e.key === "Enter") handleTap(); }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => { if (draggingRef.current) handleMove(e.clientX, e.clientY); }}
        onMouseUp={handleEnd}
         onMouseLeave={() => { if (draggingRef.current) handleEnd(); }}
        style={{
          position: "relative", zIndex: 1,
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? "none" : "transform 0.25s ease",
          padding: 12, textAlign: "left",
          borderLeft: `3px solid ${ds.color}`,
          background: isRead ? "var(--wm-er-bg, #fff)" : ds.bgTint,
          cursor: "pointer", userSelect: "none",
        }}
      >
        {/* Row 1: Dot + Title + Badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isRead ? "transparent" : ds.color, flexShrink: 0,
            }} />
            <span style={{
              fontSize: 13, fontWeight: isRead ? 500 : 600,
              color: isRead ? TEXT_SECONDARY : "var(--wm-er-text, #1e293b)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {title}
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
            background: ds.bgBadge, color: ds.color, flexShrink: 0, lineHeight: 1.5,
          }}>
            {ds.label}
          </span>
        </div>

        {/* Row 2: Body */}
        {body && (
          <div style={{
            fontSize: 12, color: isRead ? TEXT_TERTIARY : TEXT_SECONDARY,
            lineHeight: 1.4, paddingLeft: 16, marginTop: 4,
          }}>
            {body}
          </div>
        )}

        {/* Row 3: Timestamp */}
        <div style={{ fontSize: 11, color: TEXT_TERTIARY, marginTop: 4, paddingLeft: 16 }}>
          {formatNotificationTime(createdAt)}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Trash Icon SVG                                   */
/* ------------------------------------------------ */
function TrashIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path fill="#fff" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" />
    </svg>
  );
}