/** Job Mitra | ShiftOpsCameraScanPage.tsx | Native gate / join QR camera */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { EventDayGateScannerModal } from "../../mitraLabs/components/EventDayGateScannerModal";

export function ShiftOpsCameraScanPage() {
  const nav = useNavigate();

  return (
    <div className="wm-ee-vShift" data-testid="shift-ops-camera-scan-page">
      <EventDayGateScannerModal
        open
        onClose={() => nav(ROUTE_PATHS.employeeShiftOpsHub, { replace: true })}
      />
    </div>
  );
}
