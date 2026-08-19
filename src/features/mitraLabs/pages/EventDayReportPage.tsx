/**
 * Event Day report — /employer/labs/report
 * Auto folders from issued passes. Device-local only.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import { EnterpriseEmpty } from "../../../shared/components/enterprise/EnterpriseEmpty";
import { useAuthStore } from "../../../shared/store/authStore";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { EventDayFolderActionSheet } from "../components/EventDayFolderActionSheet";
import { EventDayFolderCard } from "../components/EventDayFolderCard";
import {
  EVENT_FOLDER_DELETE_WARNING,
  buildEventFolderCards,
  type EventFolderCard,
} from "../helpers/eventDayFolders.helpers";
import { EVENT_REPORT_DEVICE_COPY } from "../helpers/eventDayReport.helpers";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";

export function EventDayReportPage() {
  const nav = useNavigate();
  const issuerId = useAuthStore((s) => s.user?.id ?? "");
  const passes = useMitraLabsStore((s) => s.passes);
  const events = useMitraLabsStore((s) => s.checkInEvents);
  const deleteEventFolder = useMitraLabsStore((s) => s.deleteEventFolder);
  const [menuFolder, setMenuFolder] = useState<EventFolderCard | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EventFolderCard | null>(null);

  const minePasses = useMemo(
    () => (issuerId ? passes.filter((pass) => pass.issuerId === issuerId) : passes),
    [passes, issuerId],
  );
  const mineEvents = useMemo(
    () => (issuerId ? events.filter((event) => event.issuerId === issuerId) : events),
    [events, issuerId],
  );
  const folders = useMemo(
    () => buildEventFolderCards(minePasses, mineEvents),
    [minePasses, mineEvents],
  );
  const uiState = folders.length === 0 ? "empty" : "active";

  function openFolder(folderId: string) {
    nav(`${ROUTE_PATHS.employerLabsReport}/${encodeURIComponent(folderId)}`);
  }

  return (
    <div className="wm-dashPage wm-erDash wm-mlPage" data-testid="event-day-report-page" data-ui-state={uiState}>
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employerLabs)}
        >
          ← Event tools
        </button>
        <div className="wm-dashHero__kicker">
          <ClipboardList size={12} aria-hidden="true" /> Event report
        </div>
        <h1 className="wm-dashHero__title">Event report</h1>
        <p className="wm-dashHero__sub">
          Each pass with an event name, venue, and date creates a folder. Open a folder for attendance.
        </p>
      </header>

      <p className="wm-mlReportDisclaimer" data-testid="event-day-report-disclaimer">
        {EVENT_REPORT_DEVICE_COPY}
      </p>

      {folders.length === 0 ? (
        <EnterpriseEmpty
          title="No event folders yet"
          subtitle="Issue a guest or staff pass. A folder appears here automatically for that event date."
          testId="event-day-report-empty"
        />
      ) : (
        <div className="wm-mlFolderGrid" data-testid="event-day-folder-grid">
          {folders.map((folder) => (
            <EventDayFolderCard
              key={folder.folderId}
              folder={folder}
              onOpen={() => openFolder(folder.folderId)}
              onMenu={() => setMenuFolder(folder)}
            />
          ))}
        </div>
      )}

      <EventDayFolderActionSheet
        open={Boolean(menuFolder)}
        eventName={menuFolder?.eventName ?? "Event"}
        onClose={() => setMenuFolder(null)}
        onDelete={() => {
          setPendingDelete(menuFolder);
          setMenuFolder(null);
        }}
      />

      <ConfirmModal
        confirm={
          pendingDelete
            ? {
                title: "Delete event folder",
                message: EVENT_FOLDER_DELETE_WARNING,
                warning: "This cannot be undone on this device.",
                tone: "danger",
                confirmLabel: "Delete folder",
              }
            : null
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteEventFolder(pendingDelete.folderId);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

export default EventDayReportPage;
