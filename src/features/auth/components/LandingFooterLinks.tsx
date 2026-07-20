// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingFooterLinks.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\auth\components\LandingFooterLinks.tsx

type Props = {
  supportEmail: string;
  privacyPolicyUrl: string;
};

export function LandingFooterLinks({ supportEmail, privacyPolicyUrl }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16 /* Space between items */,
        fontSize: 13,
        fontWeight: 500,
        color: "#94A3B8" /* Subtle Grey */,
      }}
    >
      <a href={`mailto:${supportEmail}`} style={{ color: "inherit", textDecoration: "none" }}>
        Support
      </a>

      <span aria-hidden="true">&middot;</span>

      <a
        href={privacyPolicyUrl}
        target="_blank"
        rel="noreferrer"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        Privacy
      </a>

      <span aria-hidden="true">&middot;</span>

      <span style={{ cursor: "default" }}>English</span>
    </div>
  );
}
