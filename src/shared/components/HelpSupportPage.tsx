// src/shared/components/HelpSupportPage.tsx
//
// Help & Support — FAQ accordion + Contact mailto + App info.
// Shared by both Employee and Employer settings.
// "View tutorial again" resets onboarding flag.

import { useState } from "react";

/* ------------------------------------------------ */
/* FAQ Data                                         */
/* ------------------------------------------------ */
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "How do I complete my profile?",
    a: "Go to your Profile page and fill in all sections — name, city, skills, experience, languages, job types, and availability. A complete profile increases your chances of getting hired.",
  },
  {
    q: "How do I apply for a job?",
    a: "Go to Find Shifts or Find Career Jobs, use filters to narrow your search, then tap on a job to see details and apply. If Quick Apply is enabled, you can apply with one tap.",
  },
  {
    q: "How does the rating system work?",
    a: "After a shift or job is completed, both the worker and employer rate each other. Ratings are permanent and linked to your WorkMitra ID. Higher ratings build trust and improve your chances.",
  },
  {
    q: "Can I edit my review?",
    a: "You can edit a review once within 48 hours of submitting it. After that, the review becomes permanent. An 'Edited' badge will be shown on edited reviews.",
  },
  {
    q: "How do I export my data?",
    a: "Go to Settings, scroll to 'Backup and restore', and tap 'Export my data'. A JSON file will be downloaded. You can import this file on a new device to restore your data.",
  },
  {
    q: "What is my WorkMitra ID?",
    a: "Your WorkMitra ID (WM ID) is a unique, permanent identifier created from your name. Share it with employers so they can find and verify you. It appears on your profile and all job interactions.",
  },
  {
    q: "How do I verify an employer?",
    a: "Go to Work Vault, tap the 'Verify Employer' tab, and enter the employer's WorkMitra ID. You'll see their rating, reviews, and track record before applying.",
  },
  {
    q: "How do I resign from a job?",
    a: "Go to your Career Jobs section, open your current employment, and tap 'Resign'. You'll need to provide a reason. Your employer will be notified and must confirm the resignation.",
  },
  {
    q: "How do I install WorkMitra on my phone?",
    a: "Open WorkMitra in your phone browser. You'll see an 'Add to Home Screen' or 'Install' option in the browser menu. Tap it to install WorkMitra as an app on your phone.",
  },
  {
    q: "My data is missing. What do I do?",
    a: "WorkMitra stores data on your device. If you cleared browser data, your data may be lost. If you had exported a backup, go to Settings and use 'Import backup' to restore it.",
  },
];

/* ------------------------------------------------ */
/* Onboarding reset                                 */
/* ------------------------------------------------ */
const ONBOARDING_KEY = "wm_onboarding_complete_v1";

/* ------------------------------------------------ */
/* Support email                                    */
/* ------------------------------------------------ */
const SUPPORT_EMAIL = "support@workmitra.com";

function buildMailtoUrl(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/* ------------------------------------------------ */
/* Accordion Item                                   */
/* ------------------------------------------------ */
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: "1px solid var(--wm-er-border, #eef1f5)" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%", padding: "12px 0", background: "none", border: "none",
          cursor: "pointer", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 12, textAlign: "left",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)", lineHeight: 1.4 }}>
          {q}
        </span>
        <span style={{
          fontSize: 16, color: "var(--wm-er-muted)", flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>
          &#9662;
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 0 12px", fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tutorialReset, setTutorialReset] = useState(false);

  function handleTutorialReset() {
    try { localStorage.removeItem(ONBOARDING_KEY); } catch { /* safe */ }
    setTutorialReset(true);
    setTimeout(() => setTutorialReset(false), 2500);
  }

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Help & Support</div>
          <div className="wm-pageSub">Find answers, report issues, or contact us.</div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
          Frequently Asked Questions
        </div>
        <div style={{ marginTop: 8 }}>
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              q={item.q}
              a={item.a}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
          Contact Us
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5 }}>
          Having trouble or want to share feedback? Reach out to us.
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <a
            href={buildMailtoUrl("WorkMitra — Report a Problem")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderRadius: 10,
              border: "1px solid var(--wm-er-border)", background: "var(--wm-er-bg, #f8fafc)",
              textDecoration: "none", color: "var(--wm-er-text)",
              fontSize: 13, fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 16 }}>&#9888;</span>
            Report a problem
          </a>
          <a
            href={buildMailtoUrl("WorkMitra — Feature Suggestion")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderRadius: 10,
              border: "1px solid var(--wm-er-border)", background: "var(--wm-er-bg, #f8fafc)",
              textDecoration: "none", color: "var(--wm-er-text)",
              fontSize: 13, fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 16 }}>&#128161;</span>
            Suggest a feature
          </a>
          <a
            href={buildMailtoUrl("WorkMitra — General Enquiry")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderRadius: 10,
              border: "1px solid var(--wm-er-border)", background: "var(--wm-er-bg, #f8fafc)",
              textDecoration: "none", color: "var(--wm-er-text)",
              fontSize: 13, fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 16 }}>&#9993;</span>
            {SUPPORT_EMAIL}
          </a>
        </div>
      </section>

      {/* App Info */}
      <section className="wm-ee-card" style={{ marginTop: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
          App Info
        </div>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--wm-er-muted)" }}>Version</span>
            <span style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>1.0.0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--wm-er-muted)" }}>Build</span>
            <span style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>Production</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTutorialReset}
          style={{
            marginTop: 12, width: "100%", padding: "10px 16px", borderRadius: 10,
            border: "1px solid var(--wm-er-border)", background: "#fff",
            color: "var(--wm-er-text)", fontSize: 12, fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {tutorialReset ? "Tutorial will show on next visit!" : "View tutorial again"}
        </button>
      </section>
    </div>
  );
}