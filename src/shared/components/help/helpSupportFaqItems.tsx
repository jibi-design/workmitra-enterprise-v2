/** Help & Support FAQ — branded copy via BrandName (no plain Job Mitra / Mitra Labs text). */

import type { ReactNode } from "react";
import { JobMitraBrandName, MitraLabsBrandName } from "../brand/BrandName";

export type HelpFaqItem = {
  readonly q: ReactNode;
  readonly a: ReactNode;
};

function mlIdPhrase(): ReactNode {
  return (
    <>
      <MitraLabsBrandName size="sm" /> ID
    </>
  );
}

export const HELP_SUPPORT_FAQ_ITEMS: readonly HelpFaqItem[] = [
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
    a: (
      <>
        After a shift or job is completed, both the worker and employer rate each other. Ratings are
        permanent and linked to your {mlIdPhrase()}. Higher ratings build trust and improve your
        chances.
      </>
    ),
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
    q: <>What is my {mlIdPhrase()}?</>,
    a: (
      <>
        Your {mlIdPhrase()} (ML ID) is a unique, permanent identifier created from your name. Share
        it with employers so they can find and verify you. It appears on your profile and all job
        interactions. Format: ML-XXXX-ABC-XXXX.
      </>
    ),
  },
  {
    q: "How do I verify an employer?",
    a: (
      <>
        Go to Work Vault, tap the &apos;Verify Employer&apos; tab, and enter the employer&apos;s{" "}
        {mlIdPhrase()}. You&apos;ll see their rating, reviews, and track record before applying.
      </>
    ),
  },
  {
    q: "How do I resign from a job?",
    a: "Go to your Career Jobs section, open your current employment, and tap 'Resign'. You'll need to provide a reason. Your employer will be notified and must confirm the resignation.",
  },
  {
    q: (
      <>
        How do I install <JobMitraBrandName size="sm" /> on my phone?
      </>
    ),
    a: (
      <>
        Open <JobMitraBrandName size="sm" /> in your phone browser. You&apos;ll see an &apos;Add to
        Home Screen&apos; or &apos;Install&apos; option in the browser menu. Tap it to install{" "}
        <JobMitraBrandName size="sm" /> as an app on your phone.
      </>
    ),
  },
  {
    q: "My data is missing. What do I do?",
    a: (
      <>
        <JobMitraBrandName size="sm" /> stores data on your device. If you cleared browser data,
        your data may be lost. If you had exported a backup, go to Settings and use &apos;Import
        backup&apos; to restore it.
      </>
    ),
  },
];
