/** Job Mitra | UniqueIdSection.tsx | Worker identity card on employee profile */

import { ID_BRAND_NAME, ID_FORMAT_HINT } from "../../../../shared/identity/constants/idConstants";

const TRUST_BLUE = "#4338ca";
const TRUST_GREEN = "#15803d";
const TRUST_NAVY = "#0f172a";

type Props = {
  uniqueId: string | undefined;
  onCopy: () => void;
};

export function UniqueIdSection({ uniqueId, onCopy }: Props) {
  const hasId = !!uniqueId;

  return (
    <section
      style={{
        marginTop: 12,
        padding: 16,
        borderRadius: 24,
        background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        border: "1px solid rgba(203,213,225,0.95)",
        boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -38,
          right: -38,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(67,56,202,0.08)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 18,
              flexShrink: 0,
              background: "linear-gradient(180deg, rgba(67,56,202,0.1), rgba(21,128,61,0.07))",
              border: "1px solid rgba(67,56,202,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill={TRUST_BLUE}
                d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 2.19 7 3.11V11c0 4.24-2.73 8.1-7 9.93C7.73 19.1 5 15.24 5 11V6.3l7-3.11Z"
              />
            </svg>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 950,
                color: TRUST_BLUE,
                letterSpacing: 0.9,
                textTransform: "uppercase",
              }}
            >
              Worker Identity Card
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 17,
                fontWeight: 950,
                color: TRUST_NAVY,
                lineHeight: 1.25,
              }}
            >
              {ID_BRAND_NAME} Worker ID
            </div>

            <div
              style={{ marginTop: 5, fontSize: 12, color: "var(--wm-emp-muted)", lineHeight: 1.55 }}
            >
              Permanent Mitra Labs identity for employer lookup and team access.
            </div>
          </div>
        </div>

        {hasId ? (
          <>
            <div
              style={{
                marginTop: 16,
                padding: "14px 14px",
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
                border: "1px solid rgba(148,163,184,0.32)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 950,
                  color: TRUST_BLUE,
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                Worker ID
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 22,
                  fontWeight: 950,
                  color: TRUST_NAVY,
                  letterSpacing: 2.1,
                  fontFamily: "monospace",
                  wordBreak: "break-word",
                  lineHeight: 1.25,
                }}
              >
                {uniqueId}
              </div>
            </div>

            <button
              type="button"
              onClick={onCopy}
              style={{
                width: "100%",
                marginTop: 12,
                border: "1px solid rgba(67,56,202,0.2)",
                background: "linear-gradient(135deg, rgba(79,70,229,1), rgba(67,56,202,1))",
                color: "#fff",
                padding: "12px 14px",
                borderRadius: 16,
                fontSize: 13,
                fontWeight: 950,
                cursor: "pointer",
                touchAction: "manipulation",
                boxShadow: "0 10px 22px rgba(67,56,202,0.2)",
              }}
            >
              Copy Worker ID
            </button>

            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 16,
                background: "rgba(240,253,244,0.92)",
                border: "1px solid rgba(34,197,94,0.22)",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: TRUST_GREEN,
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />

              <div style={{ fontSize: 12, color: "#14532d", lineHeight: 1.55, fontWeight: 750 }}>
                Share this ID only with employers you want to connect with inside Mitra Labs.
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                marginTop: 16,
                padding: "14px 14px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.96)",
                border: "1px solid rgba(245,158,11,0.24)",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 950, color: "#b45309" }}>
                ID not generated yet
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 12,
                  color: "var(--wm-emp-muted)",
                  lineHeight: 1.65,
                }}
              >
                Add your real full name and save your profile. Your Worker ID is permanent after
                creation.
              </div>

              <div style={{ marginTop: 9, fontSize: 11, color: "#92400e", fontWeight: 900 }}>
                Format: {ID_FORMAT_HINT}
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 16,
                background: "rgba(255,251,235,0.94)",
                border: "1px solid rgba(245,158,11,0.24)",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />

              <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.55, fontWeight: 750 }}>
                Use your real name. A wrong name can create a wrong permanent ID.
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
