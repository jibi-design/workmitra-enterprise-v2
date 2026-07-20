/** Job Mitra | EmployeeHomeTopTiles.tsx | src/features/employee/home/components/EmployeeHomeTopTiles.tsx */

import { IconCalendar, IconMegaphone } from "./employeeHomeIcons";

/**
 * ARCHITECTURE NOTE:
 * Updated interface to match parent EmployeeHomePage requirements.
 * Integrated HD LED Pulse for status awareness.
 */

type Props = {
  userName: string;
  upcomingShiftDisplay: string;
  shiftBroadcastUnreadDisplay: string;
  onShiftTile: () => void;
  onBroadcastTile: () => void;
};

export function EmployeeHomeTopTiles({
  userName,
  upcomingShiftDisplay,
  shiftBroadcastUnreadDisplay,
  onShiftTile,
  onBroadcastTile,
}: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. HERO DIGITAL ID CARD */}
      <div
        style={{
          padding: "24px 20px",
          borderRadius: 24,
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          color: "#FFFFFF",
          boxShadow: "0 12px 24px rgba(37, 99, 235, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -20,
            width: 120,
            height: 120,
            background: "rgba(255, 255, 255, 0.1)",
            filter: "blur(40px)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: 4,
              }}
            >
              {greeting},
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {userName}
            </div>
            <div
              style={{
                marginTop: 12,
                display: "inline-block",
                padding: "4px 10px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Worker Profile
            </div>
          </div>

          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {userName.charAt(0)}
          </div>
        </div>
      </div>

      {/* 2. CENTERED ACTION TILES */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* Tile A: Upcoming Shifts */}
        <button
          onClick={onShiftTile}
          style={{
            flex: 1,
            height: 110,
            padding: "20px",
            borderRadius: 24,
            position: "relative",
            background: "rgba(255, 255, 255, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ color: "#2563EB", marginBottom: 10 }}>
            <IconCalendar />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
            {upcomingShiftDisplay} Shifts
          </div>
          <div style={{ fontSize: 10, fontWeight: 500, color: "#94A3B8", marginTop: 2 }}>
            Upcoming
          </div>
        </button>

        {/* Tile B: Broadcasts */}
        <button
          onClick={onBroadcastTile}
          style={{
            flex: 1,
            height: 110,
            padding: "20px",
            borderRadius: 24,
            position: "relative",
            background: "rgba(255, 255, 255, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ color: "#27AE60", marginBottom: 10 }}>
            <IconMegaphone />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
            {shiftBroadcastUnreadDisplay} Alerts
          </div>
          <div style={{ fontSize: 10, fontWeight: 500, color: "#94A3B8", marginTop: 2 }}>
            Broadcasts
          </div>
        </button>
      </div>
    </div>
  );
}
