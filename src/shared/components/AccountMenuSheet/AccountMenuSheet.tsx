/** Job Mitra | AccountMenuSheet.tsx
 *  Premium bottom-sheet account menu.
 *  Mounts fresh on each open for clean animation state.
 *  Supports swipe-down-to-dismiss.
 */

import { useCallback, useEffect, useRef } from "react";
import type { AccountMenuSheetInnerProps, AccountMenuSheetProps } from "./AccountMenuSheet.types";
import { AccountMenuHeader } from "./AccountMenuHeader";
import { AccountMenuItems } from "./AccountMenuItems";
import { useOverlayBackClose } from "../../native/useOverlayBackClose";

export function AccountMenuSheet({ open, onClose, ...rest }: AccountMenuSheetProps) {
  useOverlayBackClose(open, onClose);
  if (!open) return null;
  return <AccountMenuSheetInner onClose={onClose} {...rest} />;
}

function AccountMenuSheetInner({
  onClose,
  currentRole,
  userName,
  uniqueId,
  userPhoto,
  onOpenProfile,
  onOpenSettings,
  onOpenGigProjects,
  onOpenWorkforce,
  onOpenHrManagement,
  onOpenManagerConsole,
  onSwitchRole,
  onLogout,
}: AccountMenuSheetInnerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (overlayRef.current) overlayRef.current.style.opacity = "1";
        if (sheetRef.current) sheetRef.current.style.transform = "translateY(0)";
      });
    });
  }, []);

  const dismiss = useCallback(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleAction = useCallback((action: () => void) => {
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
    setTimeout(action, 310);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
    const delta = touchCurrentY.current - touchStartY.current;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const handleTouchEnd = () => {
    const delta = touchCurrentY.current - touchStartY.current;
    if (sheetRef.current) sheetRef.current.style.transition = "transform 0.3s ease-out";
    if (delta > 80) {
      dismiss();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = "translateY(0)";
    }
  };

  const sheetRoleClass =
    currentRole === "employer" ? "wm-accountSheet--employer" : "wm-accountSheet--employee";

  return (
    <>
      <div
        ref={overlayRef}
        className="wm-accountSheet__overlay"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div
        ref={sheetRef}
        className={`wm-accountSheet ${sheetRoleClass}`}
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="wm-accountSheet__handleWrap">
          <div className="wm-accountSheet__handle" />
        </div>

        <AccountMenuHeader
          currentRole={currentRole}
          userName={userName}
          uniqueId={uniqueId}
          userPhoto={userPhoto}
        />

        <AccountMenuItems
          currentRole={currentRole}
          onOpenProfile={() => handleAction(onOpenProfile)}
          onOpenSettings={() => handleAction(onOpenSettings)}
          onOpenGigProjects={onOpenGigProjects ? () => handleAction(onOpenGigProjects) : undefined}
          onOpenWorkforce={onOpenWorkforce ? () => handleAction(onOpenWorkforce) : undefined}
          onOpenHrManagement={
            onOpenHrManagement ? () => handleAction(onOpenHrManagement) : undefined
          }
          onOpenManagerConsole={
            onOpenManagerConsole ? () => handleAction(onOpenManagerConsole) : undefined
          }
          onSwitchRole={onSwitchRole ? () => handleAction(onSwitchRole) : undefined}
          onLogout={() => handleAction(onLogout)}
        />
      </div>
    </>
  );
}
