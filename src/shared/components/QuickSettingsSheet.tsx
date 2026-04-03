// src/shared/components/QuickSettingsSheet.tsx
// Premium bottom sheet — Instagram/GPay quality.
// Session 7: My Company (employer), Profile (employee) optional items.

import { useRef, useEffect, useCallback } from "react";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
interface QuickSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  currentRole: "employer" | "employee";
  userName: string;
  uniqueId: string;
  onOpenCompany?: () => void;
  onOpenProfile?: () => void;
  onSwitchRole: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export function QuickSettingsSheet({ open, ...props }: QuickSettingsSheetProps) {
  if (!open) return null;
  return <SheetInner {...props} />;
}

/* ------------------------------------------------ */
/* Inner — mounts fresh each open                   */
/* ------------------------------------------------ */
type InnerProps = Omit<QuickSettingsSheetProps, "open">;

function SheetInner({
  onClose,
  currentRole,
  userName,
  uniqueId,
  onOpenCompany,
  onOpenProfile,
  onSwitchRole,
  onLogout,
  onOpenSettings,
}: InnerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  /* Double-rAF for reliable animation trigger */
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (overlayRef.current) overlayRef.current.style.opacity = "1";
        if (sheetRef.current) sheetRef.current.style.transform = "translateY(0)";
      });
    });
  }, []);

  /* Dismiss with reverse animation */
  const dismiss = useCallback(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
    setTimeout(onClose, 300);
  }, [onClose]);

  /* Action + dismiss */
  const handleAction = useCallback(
    (action: () => void) => {
      if (overlayRef.current) overlayRef.current.style.opacity = "0";
      if (sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
      setTimeout(action, 310);
    },
    [],
  );

  /* Touch swipe tracking */
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

  /* Derived display values */
  const isEmployer = currentRole === "employer";
  const displayName = userName || (isEmployer ? "Employer" : "Employee");
  const roleLabel = isEmployer ? "Employer" : "Employee";
  const idText = uniqueId ? `${roleLabel} · ${uniqueId}` : roleLabel;
  const avatarBg = isEmployer ? "rgba(124,58,237,0.08)" : "rgba(22,163,74,0.08)";
  const avatarColor = isEmployer ? "#7c3aed" : "#16a34a";
  const switchBg = isEmployer ? "rgba(3,105,161,0.08)" : "rgba(124,58,237,0.08)";
  const switchColor = isEmployer ? "#0369a1" : "#7c3aed";
  const switchTitle = isEmployer ? "Switch to Employee" : "Switch to Employer";
  const switchSub = isEmployer
    ? "Use WorkMitra as an employee"
    : "Use WorkMitra as an employer";

  return (
    <>
      {/* Dark backdrop */}
      <div ref={overlayRef} style={overlayStyle} onClick={dismiss} />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        style={sheetStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div style={handleWrap}>
          <div style={handleBar} />
        </div>

        {/* Profile card */}
        <div style={profileCardStyle}>
          <div style={{ ...avatarStyle, background: avatarBg, color: avatarColor }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={profileNameStyle}>{displayName}</div>
            <div style={profileSubStyle}>{idText}</div>
          </div>
        </div>

        {/* Menu items */}
        <div style={menuListStyle}>
          {/* My Company (employer only) */}
          {onOpenCompany && (
            <>
              <button type="button" style={menuItemStyle} onClick={() => handleAction(onOpenCompany)}>
                <div style={{ ...iconBoxStyle, background: "rgba(124,58,237,0.08)", color: "#7c3aed" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 7V3H2v18h20V7H12ZM6 19H4v-2h2v2Zm0-4H4v-2h2v2Zm0-4H4V9h2v2Zm0-4H4V5h2v2Zm4 12H8v-2h2v2Zm0-4H8v-2h2v2Zm0-4H8V9h2v2Zm0-4H8V5h2v2Zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10Zm-2-8h-2v2h2v-2Zm0 4h-2v2h2v-2Z" />
                  </svg>
                </div>
                <div style={menuTextWrap}>
                  <div style={{ ...menuTitleStyle, color: "#7c3aed" }}>My Company</div>
                 <div style={menuSubStyle}>Profile, preferences, and company settings</div>
                </div>
              </button>
              <div style={dividerStyle} />
            </>
          )}

          {/* Profile (employee only) */}
          {onOpenProfile && (
            <>
              <button type="button" style={menuItemStyle} onClick={() => handleAction(onOpenProfile)}>
                <div style={{ ...iconBoxStyle, background: "rgba(22,163,74,0.08)", color: "#16a34a" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
                  </svg>
                </div>
                <div style={menuTextWrap}>
                  <div style={{ ...menuTitleStyle, color: "#16a34a" }}>Profile</div>
                  <div style={menuSubStyle}>View and edit your profile</div>
                </div>
              </button>
              <div style={dividerStyle} />
            </>
          )}

          {/* Settings (employee only — employer uses My Company) */}
          {!onOpenCompany && onOpenSettings && (
            <>
              <button type="button" style={menuItemStyle} onClick={() => handleAction(onOpenSettings)}>
                <div style={{ ...iconBoxStyle, background: "rgba(100,116,139,0.08)", color: "#64748b" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.24-1.12.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.39 1.05.7 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.24 1.12-.55 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
                  </svg>
                </div>
                <div style={menuTextWrap}>
                  <div style={menuTitleStyle}>Settings</div>
                  <div style={menuSubStyle}>Preferences and app settings</div>
                </div>
              </button>
              <div style={dividerStyle} />
            </>
          )}

          {/* Switch Role */}
          <button type="button" style={menuItemStyle} onClick={() => handleAction(onSwitchRole)}>
            <div style={{ ...iconBoxStyle, background: switchBg, color: switchColor }}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3ZM9 3 5 6.99h3V14h2V6.99h3L9 3Z" />
                <circle fill="currentColor" cx="15" cy="7" r="2.5" />
                <circle fill="currentColor" cx="9" cy="17" r="2.5" />
              </svg>
            </div>
            <div style={menuTextWrap}>
              <div style={{ ...menuTitleStyle, color: switchColor }}>{switchTitle}</div>
              <div style={menuSubStyle}>{switchSub}</div>
            </div>
          </button>

          <div style={dividerStyle} />

          {/* Log Out */}
          <button type="button" style={menuItemStyle} onClick={() => handleAction(onLogout)}>
            <div style={{ ...iconBoxStyle, background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5ZM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5Z" />
              </svg>
            </div>
            <div style={menuTextWrap}>
              <div style={{ ...menuTitleStyle, color: "#dc2626" }}>Log Out</div>
              <div style={menuSubStyle}>Return to landing page</div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  background: "rgba(0,0,0,0.35)",
  opacity: 0,
  transition: "opacity 0.25s ease",
};

const sheetStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  maxHeight: "50vh",
  background: "var(--wm-er-card, #fff)",
  borderRadius: "16px 16px 0 0",
  padding: "0 20px 32px",
  boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
  transform: "translateY(100%)",
  transition: "transform 0.3s ease-out",
  overflowY: "auto",
};

const handleWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "10px 0 14px",
  cursor: "grab",
};

const handleBar: React.CSSProperties = {
  width: 40,
  height: 4,
  borderRadius: 2,
  background: "#d1d5db",
};

const profileCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: 16,
  borderRadius: 12,
  background: "var(--wm-er-bg, #f9fafb)",
  marginBottom: 12,
};

const avatarStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const profileNameStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: "var(--wm-er-text, #111827)",
  lineHeight: 1.3,
};

const profileSubStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted, #6b7280)",
  marginTop: 2,
  fontWeight: 500,
};

const menuListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  width: "100%",
  padding: "14px 4px",
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};

const iconBoxStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const menuTextWrap: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const menuTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--wm-er-text, #111827)",
  lineHeight: 1.3,
};

const menuSubStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--wm-er-muted, #6b7280)",
  marginTop: 2,
  fontWeight: 500,
  lineHeight: 1.3,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "var(--wm-er-divider, #e5e7eb)",
  margin: "0 14px",
};