/** Job Mitra | HelpSupportPage.tsx — DomainHero (pageHead purge) */

import { useState } from "react";
import { DomainHero } from "./layout/DomainHero";

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
    a: "After a shift or job is completed, both the worker and employer rate each other. Ratings are permanent and linked to your Mitra Labs ID. Higher ratings build trust and improve your chances.",
  },
  {
    q: "Can I edit my review?",
    a: "You can edit a review once within 48 hours of submitting it. After that, the review becomes permanent. An 'Edited' badge will be shown on edited reviews.",
  },
  {
    q: "How do I export my data?",
    a: "Go to Settings, scroll to 'Backup and restore', and tap 'Export my data'. A JSON file will be downloaded. You can import this file on a new device to restore it.",
  },
  {
    q: "What is my Mitra Labs ID?",
    a: "Your Mitra Labs ID (ML ID) is a unique, permanent identifier created from your name. Share it with employers so they can find and verify you. It appears on your profile and all job interactions. Format: ML-XXXX-ABC-XXXX.",
  },
  {
    q: "How do I verify an employer?",
    a: "Go to Work Vault, tap the 'Verify Employer' tab, and enter the employer's Mitra Labs ID. You'll see their rating, reviews, and track record before applying.",
  },
  {
    q: "How do I resign from a job?",
    a: "Go to your Career Jobs section, open your current employment, and tap 'Resign'. You'll need to provide a reason. Your employer will be notified and must confirm the resignation.",
  },
  {
    q: "How do I install Job Mitra on my phone?",
    a: "Open Job Mitra in your phone browser. You'll see an 'Add to Home Screen' or 'Install' option in the browser menu. Tap it to install Job Mitra as an app on your phone.",
  },
  {
    q: "My data is missing. What do I do?",
    a: "Job Mitra stores data on your device. If you cleared browser data, your data may be lost. If you had exported a backup, go to Settings and use 'Import backup' to restore it.",
  },
];

const ONBOARDING_KEY = "wm_onboarding_complete_v1";
const SUPPORT_EMAIL = "support@mitralabs.app";

function buildMailtoUrl(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

function HelpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm1.07-7.75-.9.92A1.99 1.99 0 0 0 12 12h-2v-.5c0-.55.22-1.05.59-1.41l1.24-1.26A1.5 1.5 0 0 0 12 7.5c-.83 0-1.5.67-1.5 1.5H8.5A3.5 3.5 0 0 1 12 5.5a3.5 3.5 0 0 1 2.07 6.25Z"
      />
    </svg>
  );
}

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        className="wm-helpFaqRow"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={q}
      >
        <span className="wm-helpFaqRow__q">{q}</span>
        <span
          className={`wm-helpFaqRow__chevron${open ? " wm-helpFaqRow__chevron--open" : ""}`}
          aria-hidden="true"
        >
          &#9662;
        </span>
      </button>
      {open ? <div className="wm-helpFaqAnswer">{a}</div> : null}
    </div>
  );
}

export function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tutorialReset, setTutorialReset] = useState(false);

  function handleTutorialReset() {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
    } catch {
      /* safe */
    }
    setTutorialReset(true);
    setTimeout(() => setTutorialReset(false), 2500);
  }

  return (
    <div>
      <DomainHero
        variant="settings"
        audience="employee"
        icon={<HelpIcon />}
        title="Help & Support"
        subtitle="Find answers, report issues, or contact us"
        description="FAQ, contact channels, and app info for Job Mitra."
      />

      <section className="wm-helpFaqCard" aria-label="Frequently Asked Questions">
        <div className="wm-helpSectionTitle">Frequently Asked Questions</div>
        <div className="wm-helpFaqList">
          {FAQ_ITEMS.length === 0 ? (
            <div className="wm-ent-empty">No FAQ items available yet.</div>
          ) : (
            FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={i}
                q={item.q}
                a={item.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))
          )}
        </div>
      </section>

      <section className="wm-helpContactCard" aria-label="Contact Us">
        <div className="wm-helpSectionTitle">Contact Us</div>
        <div className="wm-helpSectionSub">
          Having trouble or want to share feedback? Reach out to us.
        </div>

        <div className="wm-helpContactGrid">
          <a href={buildMailtoUrl("Job Mitra — Report a Problem")} className="wm-helpContactLink">
            <span aria-hidden="true">&#9888;</span>
            Report a problem
          </a>
          <a href={buildMailtoUrl("Job Mitra — Feature Suggestion")} className="wm-helpContactLink">
            <span aria-hidden="true">&#128161;</span>
            Suggest a feature
          </a>
          <a href={buildMailtoUrl("Job Mitra — General Enquiry")} className="wm-helpContactLink">
            <span aria-hidden="true">&#9993;</span>
            {SUPPORT_EMAIL}
          </a>
        </div>
      </section>

      <section className="wm-helpContactCard wm-helpContactCard--last" aria-label="App Info">
        <div className="wm-helpSectionTitle">App Info</div>
        <div className="wm-helpInfoRows">
          <div className="wm-helpInfoRow">
            <span className="wm-helpInfoRow__label">Version</span>
            <span className="wm-helpInfoRow__value">1.0.0</span>
          </div>
          <div className="wm-helpInfoRow">
            <span className="wm-helpInfoRow__label">Build</span>
            <span className="wm-helpInfoRow__value">Beta</span>
          </div>
        </div>

        <button
          type="button"
          className="wm-outlineBtn wm-helpTutorialBtn"
          onClick={handleTutorialReset}
          aria-label={tutorialReset ? "Tutorial will show on next visit" : "View tutorial again"}
        >
          {tutorialReset ? "Tutorial will show on next visit!" : "View tutorial again"}
        </button>
      </section>
    </div>
  );
}
