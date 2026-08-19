/** Employee shift workspace reply composer. */

const REPLY_LIMIT = 360;
const REPLY_WARN_AT = 300;

export { REPLY_LIMIT };

export function ShiftWorkspaceReplyBox({
  readOnly,
  replyText,
  onReplyTextChange,
  onSendReply,
}: {
  readOnly: boolean;
  replyText: string;
  onReplyTextChange: (value: string) => void;
  onSendReply: () => void;
}) {
  const nearLimit = replyText.length > REPLY_WARN_AT;
  const counterColor = nearLimit ? "var(--wm-amber-700)" : "var(--wm-neutral-600)";

  return (
    <div style={{ marginTop: 14, borderTop: "1px solid rgba(226,232,240,0.95)", paddingTop: 14 }}>
      <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-neutral-900)" }}>
        Reply to Employer
      </div>

      {readOnly ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--wm-neutral-600)",
            fontWeight: 600,
            lineHeight: 1.45,
          }}
        >
          Reply is disabled because this work group is read-only.
        </div>
      ) : (
        <>
          <div className="wm-field" style={{ marginTop: 10 }}>
            <textarea
              className="wm-input"
              style={{
                height: 92,
                paddingTop: 10,
                fontFamily: "inherit",
                ...(nearLimit
                  ? {
                      borderColor: "var(--wm-amber-600)",
                      boxShadow:
                        "0 0 0 1px color-mix(in srgb, var(--wm-amber-600) 35%, transparent)",
                    }
                  : null),
              }}
              value={replyText}
              onChange={(event) => onReplyTextChange(event.target.value)}
              placeholder="Type your reply"
              maxLength={REPLY_LIMIT}
              aria-describedby="shift-reply-limit-hint"
            />

            <div
              id="shift-reply-limit-hint"
              style={{
                marginTop: 5,
                fontSize: 11,
                color: counterColor,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span>
                {nearLimit
                  ? "Approaching the 360-character limit."
                  : "Keep it clear and professional."}
              </span>
              <span style={{ fontWeight: nearLimit ? 850 : 600 }}>
                {replyText.length}/{REPLY_LIMIT}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="wm-primarybtn wm-shift-pressable"
            onClick={onSendReply}
            disabled={!replyText.trim()}
            style={{ width: "100%", marginTop: 12 }}
          >
            Send Reply
          </button>
        </>
      )}
    </div>
  );
}
