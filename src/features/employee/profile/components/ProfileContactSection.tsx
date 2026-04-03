// src/features/employee/profile/components/ProfileContactSection.tsx

import type { ProfileSectionProps } from "../types/profileTypes";
import { SectionHead, IconContact } from "./ProfilePageIcons";

const BADGE_UNVERIFIED: React.CSSProperties = {
  height: 24, padding: "0 8px", borderRadius: 999, fontSize: 10, fontWeight: 900,
  display: "inline-flex", alignItems: "center",
 border: "1px solid rgba(217, 119, 6, 0.20)", background: "rgba(217, 119, 6, 0.08)", color: "#d97706",
};

export function ProfileContactSection({ draft }: Pick<ProfileSectionProps, "draft">) {
  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <SectionHead icon={<IconContact />} title="Contact & Verification" sub="Verify your contact details" />

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)" }}>Phone</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text)", marginTop: 2 }}>
              {draft.phoneMasked ?? "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022"}
            </div>
          </div>
          <span style={BADGE_UNVERIFIED}>Unverified</span>
        </div>

        <div style={{ borderTop: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.10))", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)" }}>Email</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text)", marginTop: 2 }}>
              {draft.emailMasked ?? "\u2022\u2022\u2022\u2022@\u2022\u2022\u2022\u2022"}
            </div>
          </div>
          <span style={BADGE_UNVERIFIED}>Unverified</span>
        </div>
      </div>
    </section>
  );
}