/**
 * Employer Dashboard — Event day tab (passes + venue QR + gate security).
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, ClipboardList, FlaskConical, KeyRound, QrCode, Ticket } from "lucide-react";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { showMitraLabsAiPhotoDelivery } from "../../../../../shared/launch/launchVisibility";
import { EventDayGatePinModal } from "../../../../mitraLabs/components/EventDayGatePinModal";
import { EventDayGateScannerModal } from "../../../../mitraLabs/components/EventDayGateScannerModal";
import {
  dismissEventDayCoach,
  isEventDayCoachDismissed,
} from "../../helpers/eventDayCoach.session";
import { EmployerPassAuditLog } from "./EmployerPassAuditLog";
import { EmployerUtilityActionTile } from "./EmployerUtilityActionTile";
import { EventDayCoachMark } from "./EventDayCoachMark";

export function EmployerDashboardUtilitiesPanel() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCoach, setShowCoach] = useState(() => !isEventDayCoachDismissed());
  const [localPanel, setLocalPanel] = useState<"pin" | "scanner" | null>(null);
  const urlPanel = searchParams.get("panel");
  const pinOpen = urlPanel === "pin" || localPanel === "pin";
  const scannerOpen = urlPanel === "scanner" || localPanel === "scanner";

  function hideCoach() {
    dismissEventDayCoach();
    setShowCoach(false);
  }

  return (
    <div className="wm-erDashUtilities" data-testid="employer-dashboard-utilities">
      <section className="wm-erDashUtilities__block" aria-labelledby="er-dash-labs">
        <h2 id="er-dash-labs" className="wm-erDashUtilities__heading">
          Event day — 6-card workflow
        </h2>
        <p className="wm-erDashUtilities__sub" id="er-dash-labs-sub">
          Passes, QR, gate PIN, scanner, All Event Tools, and full report.
        </p>
        {showCoach ? <EventDayCoachMark onDismiss={hideCoach} /> : null}
        <div
          className="wm-erDashActionGrid wm-erDashActionGrid--wide"
          aria-describedby={showCoach ? "er-event-day-coach-body" : "er-dash-labs-sub"}
        >
          <EmployerUtilityActionTile
            testId="dash-labs-invites"
            icon={Ticket}
            title="Send guest & staff passes"
            sub="1 shift, 3-day, 1-week, or custom window"
            onClick={() => nav(ROUTE_PATHS.employerLabsInvites)}
          />
          <EmployerUtilityActionTile
            testId="dash-labs-qr"
            icon={QrCode}
            title="Create branded QR & export"
            sub="Poster designer — SVG, PNG, and PDF"
            onClick={() => nav(ROUTE_PATHS.employerLabsQr)}
          />
          <EmployerUtilityActionTile
            testId="dash-labs-gate-pin"
            icon={KeyRound}
            title="Security gate PIN"
            sub="Per-event PIN folders — view current PIN and reset"
            onClick={() => {
              setLocalPanel("pin");
            }}
          />
          <EmployerUtilityActionTile
            testId="dash-labs-scanner"
            icon={Camera}
            title="Live gate camera scanner"
            sub="In-app camera for valid or expired"
            onClick={() => {
              setLocalPanel("scanner");
            }}
          />
          <EmployerUtilityActionTile
            testId="dash-labs-hub"
            icon={FlaskConical}
            title="All Event Tools"
            sub="Pass counts — active now and revoked"
            onClick={() => nav(ROUTE_PATHS.employerLabs)}
          />
          <EmployerUtilityActionTile
            testId="dash-labs-report"
            icon={ClipboardList}
            title="Open full report"
            sub="Folders, attendance export, and backup"
            onClick={() => nav(ROUTE_PATHS.employerLabsReport)}
          />
          {showMitraLabsAiPhotoDelivery ? (
            <EmployerUtilityActionTile
              testId="dash-labs-ai-photo"
              icon={Camera}
              title="Photo delivery (beta)"
              sub="Not live capture — preview only"
              onClick={() => nav(ROUTE_PATHS.employerLabsAiPhoto)}
            />
          ) : null}
        </div>
      </section>

      <EmployerPassAuditLog />

      <EventDayGatePinModal
        open={pinOpen}
        onClose={() => {
          setLocalPanel(null);
          if (searchParams.get("panel")) {
            const next = new URLSearchParams(searchParams);
            next.delete("panel");
            setSearchParams(next, { replace: true });
          }
        }}
      />
      <EventDayGateScannerModal
        open={scannerOpen}
        onClose={() => {
          setLocalPanel(null);
          if (searchParams.get("panel")) {
            const next = new URLSearchParams(searchParams);
            next.delete("panel");
            setSearchParams(next, { replace: true });
          }
        }}
      />
    </div>
  );
}
