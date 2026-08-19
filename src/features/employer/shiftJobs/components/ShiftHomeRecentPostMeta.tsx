import type { CSSProperties } from "react";

type Props = {
  statusLabel: string;
  statusColor: string;
  dateText: string;
  payText: string;
};

export function ShiftHomeRecentPostMeta({ statusLabel, statusColor, dateText, payText }: Props) {
  const statusStyle = { color: statusColor } satisfies CSSProperties;

  return (
    <div className="wm-shiftPostCard__meta">
      <span className="wm-shiftPostCard__status" style={statusStyle}>
        {statusLabel}
      </span>
      <span className="wm-shiftPostCard__sep" aria-hidden="true">
        {" · "}
      </span>
      <span className="wm-shiftPostCard__dates">{dateText}</span>
      <span className="wm-shiftPostCard__sep" aria-hidden="true">
        {" · "}
      </span>
      <span className="wm-shiftPostCard__rate">{payText}</span>
    </div>
  );
}
