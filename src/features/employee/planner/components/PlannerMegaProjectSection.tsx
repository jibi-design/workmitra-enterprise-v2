// Job Mitra | PlannerMegaProjectSection.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import type { PlannerPublicIndexEntry } from "../../../shared/planner/plannerPublic";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { employeePlanEngagementStorage } from "../storage/employeePlanEngagement.storage";
import { employeeProjectDetailPath } from "../../planner/helpers/plannerEmployeeRoutes";
import { PlannerPickChooseModal } from "./PlannerPickChooseModal";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { filterPlannerEntriesNearWorker } from "../helpers/plannerNearby.filter";

type Props = {
  onToast: (message: string) => void;
  onNeedProfile: () => void;
  isProfileComplete: boolean;
};

function getIndexSnapshot() {
  return plannerPublicIndex.getActiveEntries();
}

function getEngagementSnapshotKey() {
  return employeePlanEngagementStorage.getSnapshotKey();
}

function subscribeEngagement(cb: () => void) {
  return employeePlanEngagementStorage.subscribe(cb);
}

function formatMegaPay(entry: PlannerPublicIndexEntry): string {
  if (entry.payMin <= 0 && entry.payMax <= 0) return "";
  if (entry.payMin === entry.payMax) {
    return `${entry.payMin.toLocaleString("en-GB")}/day`;
  }
  return `${entry.payMin.toLocaleString("en-GB")}–${entry.payMax.toLocaleString("en-GB")}/day`;
}

function MegaCard({
  entry,
  isSaved,
  onPickChoose,
  onViewDetails,
  onToggleSave,
}: {
  entry: PlannerPublicIndexEntry;
  isSaved: boolean;
  onPickChoose: () => void;
  onViewDetails: () => void;
  onToggleSave: () => void;
}) {
  const payLabel = formatMegaPay(entry);
  const headline = payLabel
    ? `${entry.planName} - ${entry.dayCount} Days | ${payLabel}`
    : `${entry.planName} - ${entry.dayCount} Days`;

  return (
    <article
      key={entry.planId}
      className="wm-planner-megaCard wm-planner-megaCard--shimmer"
      role="button"
      tabIndex={0}
      onClick={onPickChoose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPickChoose();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="wm-planner-megaCardHeader">
        <div className="wm-planner-badge">Gig Project · {entry.openDayCount} days open</div>
        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 6 }}>{headline}</div>
        <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
          {entry.companyName} · {entry.category}
        </div>
      </div>
      <div style={{ padding: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="wm-planner-btnPrimary"
          style={{ flex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onPickChoose();
          }}
        >
          Pick days &amp; Apply
        </button>
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          View details
        </button>
        <button
          type="button"
          className="wm-planner-btnGhost"
          aria-pressed={isSaved}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
        >
          {isSaved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </article>
  );
}

export function PlannerMegaProjectSection({ onToast, onNeedProfile, isProfileComplete }: Props) {
  const nav = useNavigate();
  const rawEntries = useSyncExternalStore(
    plannerPublicIndex.subscribe,
    getIndexSnapshot,
    getIndexSnapshot,
  );

  const profileKey = useSyncExternalStore(
    employeeProfileStorage.subscribe,
    () => {
      const profile = employeeProfileStorage.get();
      return `${profile.basePincode}|${profile.commuteRadius}`;
    },
    () => "",
  );

  const entries = useMemo(() => {
    void profileKey;
    const profile = employeeProfileStorage.get();
    return filterPlannerEntriesNearWorker({
      entries: rawEntries,
      workerPincode: profile.basePincode,
      commuteRadiusKm: profile.commuteRadius,
    });
  }, [rawEntries, profileKey]);

  useSyncExternalStore(subscribeEngagement, getEngagementSnapshotKey, getEngagementSnapshotKey);

  const [activeEntry, setActiveEntry] = useState<PlannerPublicIndexEntry | null>(null);

  const entryById = useMemo(() => new Map(entries.map((e) => [e.planId, e])), [entries]);

  const savedEntries = employeePlanEngagementStorage
    .getSavedPlanIds()
    .map((id) => entryById.get(id))
    .filter((e): e is PlannerPublicIndexEntry => Boolean(e));

  const recentEntries = employeePlanEngagementStorage
    .getRecentlyViewedPlanIds(3)
    .map((id) => entryById.get(id))
    .filter((e): e is PlannerPublicIndexEntry => Boolean(e));

  const sorted = useMemo(() => {
    const recentIds = new Set(recentEntries.map((e) => e.planId));
    return [...entries]
      .filter((e) => !recentIds.has(e.planId))
      .sort((a, b) => b.publishedAt - a.publishedAt);
  }, [entries, recentEntries]);

  function openPickChoose(entry: PlannerPublicIndexEntry) {
    if (!isProfileComplete) {
      onNeedProfile();
      return;
    }
    setActiveEntry(entry);
  }

  function openProject(entry: PlannerPublicIndexEntry) {
    employeePlanEngagementStorage.markViewed(entry.planId);
    nav(employeeProjectDetailPath(entry.planId));
  }

  function toggleSave(planId: string) {
    const saved = employeePlanEngagementStorage.toggleSaved(planId);
    onToast(saved ? "Project saved" : "Removed from saved projects");
  }

  function renderCard(entry: PlannerPublicIndexEntry, keyPrefix: string) {
    return (
      <MegaCard
        key={`${keyPrefix}-${entry.planId}`}
        entry={entry}
        isSaved={employeePlanEngagementStorage.isSaved(entry.planId)}
        onPickChoose={() => openPickChoose(entry)}
        onViewDetails={() => openProject(entry)}
        onToggleSave={() => toggleSave(entry.planId)}
      />
    );
  }

  return (
    <div id="project-plans" className="wm-planner-gigSectionBody">
      {entries.length === 0 ? (
        <div
          className="wm-planner-card"
          data-testid="planner-browse-mega-empty"
          style={{ fontSize: 12, color: "var(--wm-neutral-500)", lineHeight: 1.5, fontWeight: 600 }}
        >
          <div className="wm-planner-sectionTitle">Empty catalog</div>
          <p className="wm-typeHelper" style={{ margin: "8px 0 0" }}>
            No project plans listed yet. When employers publish multi-day plans, they appear here.
            Pick &amp; Choose, earnings, and conflict guard activate on each project.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {savedEntries.length > 0 ? (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "var(--wm-planner-accent-strong)",
                }}
              >
                Saved projects
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {savedEntries.map((entry) => renderCard(entry, "saved"))}
              </div>
            </div>
          ) : null}

          {recentEntries.length > 0 ? (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "var(--wm-neutral-500)",
                }}
              >
                Recently viewed
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {recentEntries.map((entry) => renderCard(entry, "recent"))}
              </div>
            </div>
          ) : null}

          <div>
            {savedEntries.length > 0 || recentEntries.length > 0 ? (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "var(--wm-neutral-500)",
                }}
              >
                All open projects
              </div>
            ) : null}
            <div style={{ display: "grid", gap: 12 }}>
              {sorted.map((entry) => renderCard(entry, "all"))}
            </div>
          </div>
        </div>
      )}

      {activeEntry && (
        <PlannerPickChooseModal
          entry={activeEntry}
          onClose={() => setActiveEntry(null)}
          onApplied={(count) => {
            setActiveEntry(null);
            onToast(`Applied for ${count} day${count !== 1 ? "s" : ""}!`);
          }}
          onNeedProfile={onNeedProfile}
          isProfileComplete={isProfileComplete}
        />
      )}
    </div>
  );
}
