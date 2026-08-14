// src/shared/components/notifications/NotificationCard.tsx
//
// Shared notification card with WhatsApp-style swipe-to-delete.
// Left swipe reveals red delete button. Tap to navigate.
// Unread: accent dot + strong text.
// Read: muted text.

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { formatNotificationTime } from "./notificationHelpers";
import { type NotificationDomainStyle } from "./notificationTypes";
import { stripNotificationDedupeSignature } from "../../notifications/guards";

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
/* CSS variables                                    */
/* ------------------------------------------------ */
type NotificationCardShellStyle = CSSProperties &
  Partial<{
    "--wm-notification-accent": string;
    "--wm-notification-surface": string;
    "--wm-notification-badge": string;
  }>;

type NotificationCardPanelStyle = CSSProperties &
  Partial<{
    "--wm-notification-card-transform": string;
    "--wm-notification-card-transition": string;
  }>;

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NotificationCard({
  id,
  title,
  body,
  createdAt,
  isRead,
  domainStyle,
  onTap,
  onDelete,
}: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const draggingRef = useRef(false);
  const isHorizontal = useRef<boolean | null>(null);

  const hasDeleteAction = Boolean(onDelete);

  const handleStart = useCallback(
    (x: number, y: number) => {
      if (!hasDeleteAction) return;

      startX.current = x;
      startY.current = y;
      draggingRef.current = true;
      setIsDragging(true);
      isHorizontal.current = null;
    },
    [hasDeleteAction],
  );

  const handleMove = useCallback(
    (x: number, y: number) => {
      if (!draggingRef.current || !hasDeleteAction) return;

      const dx = x - startX.current;
      const dy = y - startY.current;

      if (isHorizontal.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }

      if (!isHorizontal.current) return;

      const baseOffset = swiped ? dx - DELETE_BTN_WIDTH : dx;
      const clamped = Math.max(-MAX_SWIPE, Math.min(0, baseOffset));
      setOffsetX(clamped);
    },
    [hasDeleteAction, swiped],
  );

  const handleEnd = useCallback(() => {
    if (!draggingRef.current || !hasDeleteAction) return;

    draggingRef.current = false;
    setIsDragging(false);
    isHorizontal.current = null;

    if (offsetX < -SWIPE_THRESHOLD) {
      setOffsetX(-DELETE_BTN_WIDTH);
      setSwiped(true);
      return;
    }

    setOffsetX(0);
    setSwiped(false);
  }, [hasDeleteAction, offsetX]);

  function handleTap() {
    if (swiped) {
      setOffsetX(0);
      setSwiped(false);
      return;
    }

    onTap(id);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleTap();
  }

  function handleDelete() {
    if (!onDelete) return;

    setOffsetX(-200);
    window.setTimeout(() => onDelete(id), 200);
  }

  const shellStyle: NotificationCardShellStyle = {
    "--wm-notification-accent": domainStyle.color,
    "--wm-notification-surface": domainStyle.bgTint,
    "--wm-notification-badge": domainStyle.bgBadge,
  };

  const panelStyle: NotificationCardPanelStyle = {
    "--wm-notification-card-transform": `translateX(${offsetX}px)`,
    "--wm-notification-card-transition": isDragging
      ? "none"
      : "transform 0.25s var(--wm-motion-ease)",
  };

  return (
    <div
      className={`wm-notificationCardShell ${isRead ? "isRead" : "isUnread"} ${
        swiped ? "isSwiped" : ""
      }`}
      style={shellStyle}
    >
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete notification"
          className="wm-notificationDeleteButton"
        >
          <TrashIcon />
        </button>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label={`Open notification: ${title}`}
        className="wm-notificationCardPanel"
        style={panelStyle}
        onClick={handleTap}
        onKeyDown={handleKeyDown}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) handleStart(touch.clientX, touch.clientY);
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) handleMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        onMouseDown={(event) => handleStart(event.clientX, event.clientY)}
        onMouseMove={(event) => {
          if (draggingRef.current) handleMove(event.clientX, event.clientY);
        }}
        onMouseUp={handleEnd}
        onMouseLeave={() => {
          if (draggingRef.current) handleEnd();
        }}
      >
        <div className="wm-notificationCardHeader">
          <div className="wm-notificationCardTitleWrap">
            <span className="wm-notificationCardDot" aria-hidden="true" />

            <span className="wm-notificationCardTitle">{title}</span>
          </div>

          <span className="wm-notificationCardBadge">{domainStyle.label}</span>
        </div>

        {body ? (
          <div className="wm-notificationCardBody">{stripNotificationDedupeSignature(body)}</div>
        ) : null}

        <div className="wm-notificationCardTime">{formatNotificationTime(createdAt)}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Trash Icon SVG                                   */
/* ------------------------------------------------ */
function TrashIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="wm-notificationTrashIcon"
    >
      <path
        fill="currentColor"
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"
      />
    </svg>
  );
}
