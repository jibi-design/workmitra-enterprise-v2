/**
 * Event folder attendance — /employer/labs/report/:folderId
 */

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { EnterpriseEmpty } from "../../../shared/components/enterprise/EnterpriseEmpty";
import { useAuthStore } from "../../../shared/store/authStore";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { EventDayReportPeopleList } from "../components/EventDayReportPeopleList";
import {
  buildEventFolderCards,
  buildFolderAttendanceRows,
  findEventFolderCard,
} from "../helpers/eventDayFolders.helpers";
import { exportEventFolderAttendancePdf } from "../helpers/eventDayReportPdf.helpers";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";

export function EventDayReportFolderPage() {
  const nav = useNavigate();
  const { folderId: rawId } = useParams<{ folderId: string }>();
  const folderId = rawId ? decodeURIComponent(rawId) : "";
  const issuerId = useAuthStore((s) => s.user?.id ?? "");
  const passes = useMitraLabsStore((s) => s.passes);
  const events = useMitraLabsStore((s) => s.checkInEvents);

  const minePasses = useMemo(
    () => (issuerId ? passes.filter((pass) => pass.issuerId === issuerId) : passes),
    [passes, issuerId],
  );
  const mineEvents = useMemo(
    () => (issuerId ? events.filter((event) => event.issuerId === issuerId) : events),
    [events, issuerId],
  );
  const folder = useMemo(
    () => findEventFolderCard(folderId, buildEventFolderCards(minePasses, mineEvents)),
    [folderId, minePasses, mineEvents],
  );
  const rows = useMemo(
    () => buildFolderAttendanceRows(folderId, minePasses, mineEvents),
    [folderId, minePasses, mineEvents],
  );
  const uiState = !folder ? "error" : rows.length === 0 ? "empty" : "active";

  return (
    <div
      className="wm-dashPage wm-erDash wm-mlPage"
      data-testid="event-day-report-folder-page"
      data-ui-state={uiState}
    >
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employerLabsReport)}
        >
          ← Event folders
        </button>
        <div className="wm-dashHero__kicker">
          <ClipboardList size={12} aria-hidden="true" /> Attendance
        </div>
        <h1 className="wm-dashHero__title">{folder?.eventName ?? "Event folder"}</h1>
        <p className="wm-dashHero__sub">
          {folder ? `${folder.venueName} · ${folder.dateLabel}` : "This folder is no longer on this device."}
        </p>
      </header>

      {folder ? (
        <button
          type="button"
          className="wm-primarybtn"
          data-testid="event-day-folder-export-pdf"
          onClick={() => void exportEventFolderAttendancePdf(folder, rows)}
        >
          Export as PDF
        </button>
      ) : null}

      {!folder ? (
        <EnterpriseEmpty
          title="Folder not found"
          subtitle="It may have been deleted from this device."
          testId="event-day-folder-missing"
        />
      ) : rows.length === 0 ? (
        <EnterpriseEmpty
          title="No PIN check-ins yet"
          subtitle="PIN-confirmed door entries for this event will appear here."
          testId="event-day-folder-empty"
        />
      ) : (
        <EventDayReportPeopleList
          kicker="Attendance"
          title="PIN-confirmed entries"
          rows={rows}
        />
      )}
    </div>
  );
}

export default EventDayReportFolderPage;
