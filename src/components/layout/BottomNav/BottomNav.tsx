/** Job Mitra | BottomNav.tsx | src/components/layout/BottomNav/BottomNav.tsx */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDynamicNav } from "../../../hooks/useDynamicNav";
import styles from "./BottomNav.module.css";

const BottomNav: React.FC = () => {
  const { navItems, themeColor, activeDomain } = useDynamicNav();
  const navigate = useNavigate();

  const handleNavigation = (path: string, isActive: boolean) => {
    if (isActive) return;
    navigate(path);
  };

  return (
    <nav
      className={styles.navContainer}
      data-nav-domain={activeDomain}
      style={
        {
          "--nav-theme-color": themeColor,
        } as React.CSSProperties
      }
    >
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={`${item.domain}-${item.path}`}
            onClick={() => handleNavigation(item.path, item.isActive)}
            className={`wm-press-btn ${styles.navItem} ${item.isActive ? styles.navItemActive : ""}`}
            style={{ border: "none", background: "none", padding: 0 }}
            aria-current={item.isActive ? "page" : undefined}
          >
            <div className={styles.iconBox}>
              <Icon size={22} strokeWidth={item.isActive ? 2.5 : 2} className={styles.icon} />
              {item.hasUnreadBadge && !item.isActive && (
                <span className={styles.unreadDot} aria-label="Pending direct invites" />
              )}
            </div>
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
