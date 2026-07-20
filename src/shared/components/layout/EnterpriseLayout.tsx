/** Job Mitra | EnterpriseLayout.tsx | src/shared/components/layout/EnterpriseLayout.tsx */

import type { ReactNode } from "react";
import { DESIGN_TOKENS } from "../../../app/theme/designTokens";

/**
 * AUDIT NOTE:
 * Optimized imports for 'verbatimModuleSyntax'.
 * Removed unused 'React' import and switched 'ReactNode' to type-only.
 */

/**
 * 1. PageWrapper:
 * Controls the full-screen height, background, and scrolling behavior.
 * This is the master container for every page in the app.
 */
interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: DESIGN_TOKENS.colors.background,
        width: "100%",
        boxSizing: "border-box",
        fontFamily: `"Inter", system-ui, sans-serif`,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: DESIGN_TOKENS.geometry.maxContentWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 2. Section:
 * Controls standard vertical gaps and section headers for data blocks.
 * Ensures consistent spacing (32px gap) across all app domains.
 */
interface SectionProps {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  noPadding?: boolean;
}

export function Section({ eyebrow, title, children, noPadding = false }: SectionProps) {
  return (
    <section
      style={{
        padding: noPadding ? "0" : `0 ${DESIGN_TOKENS.geometry.pagePadding}px`,
        marginBottom: DESIGN_TOKENS.geometry.sectionGap,
      }}
    >
      {(eyebrow || title) && (
        <div style={{ marginBottom: 12 }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 750,
                color: "#94A3B8",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>
          )}
          {title && (
            <div
              style={{
                marginTop: 2,
                fontSize: 17,
                fontWeight: 700,
                color: DESIGN_TOKENS.colors.textDark,
              }}
            >
              {title}
            </div>
          )}
        </div>
      )}
      <div
        style={{ display: "flex", flexDirection: "column", gap: DESIGN_TOKENS.geometry.itemGap }}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * 3. PageHeader:
 * A standardized hero header for sub-pages.
 * Provides the premium 'SaaS Dashboard' typography feel.
 */
interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: HeaderProps) {
  return (
    <div style={{ padding: `48px ${DESIGN_TOKENS.geometry.pagePadding}px 32px` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: DESIGN_TOKENS.colors.textDark,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                marginTop: 8,
                fontSize: 15,
                color: DESIGN_TOKENS.colors.textMuted,
                fontWeight: 400,
                maxWidth: 320,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0, marginLeft: 12 }}>{action}</div>}
      </div>
    </div>
  );
}
