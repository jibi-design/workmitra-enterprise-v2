// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessViewingStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessViewingStep.tsx

import type { DocAccessDocument, DocAccessFolder, DocAccessProfile } from "../docAccessTypes";
import { DocAccessDocumentList } from "./DocAccessDocumentList";
import { DocAccessSessionTimer } from "./DocAccessSessionTimer";

type DocAccessViewingStepProps = {
  workerName: string;
  profile: DocAccessProfile;
  folders: DocAccessFolder[];
  documents: DocAccessDocument[];
  onEndSession: () => void;
};

const VAULT_PURPLE = "#7c3aed";
const TEXT = "var(--wm-er-text, #1e293b)";
const MUTED = "var(--wm-er-muted, #64748b)";

export function DocAccessViewingStep({
  workerName,
  profile,
  folders,
  documents,
  onEndSession,
}: DocAccessViewingStepProps) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: TEXT, lineHeight: 1.2 }}>
            {workerName}&apos;s Profile & Documents
          </div>

          <div
            style={{
              fontSize: 12.2,
              color: MUTED,
              marginTop: 3,
              lineHeight: 1.45,
              fontWeight: 600,
            }}
          >
            Career verification view - employee shared access only
          </div>
        </div>

        <DocAccessSessionTimer />
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 13,
          background: "rgba(217,119,6,0.06)",
          border: "1px solid rgba(217,119,6,0.15)",
          fontSize: 11.8,
          color: "#92400e",
          fontWeight: 650,
          lineHeight: 1.5,
        }}
      >
        You can view only the safe profile details and visible document folders shared by the
        employee. Hidden folders are not shown.
      </div>

      <section
        style={{
          marginBottom: 12,
          padding: 13,
          borderRadius: 16,
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(148,163,184,0.16)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 950, color: TEXT, marginBottom: 12 }}>Profile</div>

        <div style={{ display: "grid", gap: 8 }}>
          {profile.fullName && <ProfileRow label="Name" value={profile.fullName} strong />}
          <ProfileRow label="Worker ID" value={profile.workerId || "Not shared"} />
          <ProfileRow label="City" value={profile.city || "Not shared"} />
          <ProfileRow label="Experience" value={profile.experience || "Not shared"} />
        </div>

        <TagSection title="Skills" values={profile.skills} tone="primary" />
        <TagSection title="Languages" values={profile.languages} tone="blue" />
      </section>

      <section
        style={{
          marginBottom: 12,
          padding: 13,
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(124,58,237,0.045), rgba(255,255,255,0.98))",
          border: "1px solid rgba(124,58,237,0.16)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 11,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 950, color: TEXT }}>Shared Documents</div>
            <div style={{ fontSize: 11.5, color: MUTED, fontWeight: 600, marginTop: 2 }}>
              Visible folders only
            </div>
          </div>
        </div>

        <DocAccessDocumentList folders={folders} documents={documents} />
      </section>

      <button
        type="button"
        onClick={onEndSession}
        style={{
          width: "100%",
          marginTop: 4,
          padding: "10px 0",
          borderRadius: 11,
          border: "1px solid rgba(220,38,38,0.25)",
          background: "rgba(220,38,38,0.06)",
          color: "#dc2626",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        End Session
      </button>
    </>
  );
}

function ProfileRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="wm-kv">
      <div className="k">{label}</div>
      <div className="v" style={{ fontWeight: strong ? 850 : 750 }}>
        {value}
      </div>
    </div>
  );
}

function TagSection({
  title,
  values,
  tone,
}: {
  title: string;
  values: string[];
  tone: "primary" | "blue";
}) {
  const color = tone === "primary" ? VAULT_PURPLE : "#0284c7";
  const background = tone === "primary" ? "rgba(124,58,237,0.10)" : "rgba(2,132,199,0.08)";
  const border = tone === "primary" ? "rgba(124,58,237,0.18)" : "rgba(2,132,199,0.18)";

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: MUTED,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.28,
        }}
      >
        {title}
      </div>

      {values.length > 0 ? (
        <div className="wm-chipRow">
          {values.slice(0, 8).map((value) => (
            <span
              key={value}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 999,
                background,
                color,
                border: `1px solid ${border}`,
              }}
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: MUTED, fontWeight: 650 }}>Not shared</div>
      )}
    </div>
  );
}
