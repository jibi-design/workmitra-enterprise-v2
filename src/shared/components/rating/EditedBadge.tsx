// src/shared/components/rating/EditedBadge.tsx
//
// Permanent "Edited" badge shown on rating cards after edit.
// Transparent — both sides know the review was modified.

type Props = {
  editedAt: number | null;
};

export function EditedBadge({ editedAt }: Props) {
  if (!editedAt) return null;

  const dateStr = new Date(editedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        color: "var(--wm-er-muted, #6b7280)",
        background: "rgba(107,114,128,0.08)",
        border: "1px solid rgba(107,114,128,0.15)",
        borderRadius: 999,
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
      title={`Edited on ${dateStr}`}
    >
      Edited
    </span>
  );
}