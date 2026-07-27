import { DocAccessDocumentList } from "../../../../shared/docAccess/components/DocAccessDocumentList";
import type {
  DocAccessDocument,
  DocAccessFolder,
} from "../../../../shared/docAccess/docAccessTypes";

export function ReviewTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 42,
        borderRadius: "var(--wm-radius-chip)",
        border: active ? "1px solid rgba(124,58,237,0.34)" : "1px solid rgba(148,163,184,0.18)",
        background: active
          ? "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(255,255,255,0.98))"
          : "rgba(255,255,255,0.92)",
        color: active ? "#7c3aed" : "var(--wm-er-muted)",
        fontSize: 13,
        fontWeight: 850,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function DocumentsTabPanel({
  folders,
  documents,
}: {
  folders: DocAccessFolder[];
  documents: DocAccessDocument[];
}) {
  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid rgba(124,58,237,0.16)",
        background: "linear-gradient(135deg, rgba(124,58,237,0.045), rgba(255,255,255,0.98))",
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 950,
          color: "var(--wm-er-text)",
          marginBottom: 5,
        }}
      >
        Shared Documents
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted)",
          lineHeight: 1.55,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        Only folders marked visible by the employee will appear here. Hidden folders and hidden
        documents are not shown.
      </div>
      <DocAccessDocumentList folders={folders} documents={documents} />
    </section>
  );
}
