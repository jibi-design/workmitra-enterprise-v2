/** Job Mitra | EmployeeInsightsCard.tsx | src/features/employee/home/components/EmployeeInsightsCard.tsx */

/**
 * AUDIT NOTE:
 * Removed 'useNavigate' from 'react-router-dom' as it is no longer used.
 * The component now relies entirely on the 'onViewHistory' prop for navigation.
 */
interface InsightsCardProps {
  onViewHistory: () => void;
}

export function InsightsCard({ onViewHistory }: InsightsCardProps) {
  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onViewHistory}
      style={{
        cursor: "pointer",
        padding: "var(--wm-card-padding)",
        borderRadius: "var(--wm-radius-employee-card)",
        /* Enterprise Dark Anchor Styling - Deep Slate Blue Gradient */
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.15)",
        transition: "transform var(--wm-motion-base) var(--wm-motion-spring)",
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.1)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* Chart Icon SVG - Visual indicator for data/insights */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M21 12H3M12 3v18" />
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            Insights & Activity
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 400,
            }}
          >
            Track your history
          </p>
        </div>
      </div>

      <div
        style={{
          color: "rgba(255, 255, 255, 0.3)",
          fontSize: 20,
          fontWeight: 300,
        }}
      >
        →
      </div>
    </section>
  );
}
