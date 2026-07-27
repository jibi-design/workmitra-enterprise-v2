import type { ReactNode } from "react";
import {
  CAREER_BLUE,
  CAREER_MUTED,
  CAREER_TEXT,
  PREMIUM_CARD_STYLE,
} from "./CareerCreateStepBasic.helpers";

export function SectionHead({
  icon,
  title,
  sub,
}: {
  icon: ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--wm-radius-chip)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            color: CAREER_BLUE,
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 4px 10px rgba(37,99,235,0.06), inset 0 1px 2px rgba(255,255,255,0.9)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 15.5,
              color: CAREER_TEXT,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
          {sub && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12.5,
                color: CAREER_MUTED,
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PremiumCard({ children, marginTop }: { children: ReactNode; marginTop?: number }) {
  return <section style={{ ...PREMIUM_CARD_STYLE, marginTop: marginTop ?? 0 }}>{children}</section>;
}

export function IconBriefcase() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

export function IconLocation() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}
