// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffDetailPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\pages\EmployerWorkforceStaffDetailPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type {
  WorkforceCategory,
  WorkforceStaff,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  WF_CATEGORIES_CHANGED,
  WF_STAFF_CHANGED,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";
import { EmployerWorkforceStaffDetailActions } from "../components/EmployerWorkforceStaffDetailActions";
import { EmployerWorkforceStaffDetailCategories } from "../components/EmployerWorkforceStaffDetailCategories";
import { EmployerWorkforceStaffDetailHeader } from "../components/EmployerWorkforceStaffDetailHeader";
import { EmployerWorkforceStaffDetailProfile } from "../components/EmployerWorkforceStaffDetailProfile";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceStaffService } from "../services/workforceStaffService";

type Props = {
  staffId: string;
  onBack: () => void;
};

type DetailSnapshot = {
  staff: WorkforceStaff | null;
  categories: WorkforceCategory[];
  ver: number;
};

let snapCache: DetailSnapshot | null = null;
let snapVer = 0;
let cachedStaffId = "";

function getSnapshot(staffId: string): () => DetailSnapshot {
  return () => {
    if (snapCache && snapCache.ver === snapVer && cachedStaffId === staffId) return snapCache;

    cachedStaffId = staffId;

    const staff = workforceStaffService.getById(staffId);
    const categories = workforceCategoryService.getAll();

    snapCache = { staff, categories, ver: snapVer };
    return snapCache;
  };
}

function subscribe(cb: () => void): () => void {
  const events = [WF_STAFF_CHANGED, WF_CATEGORIES_CHANGED];

  const handler = () => {
    snapVer++;
    snapCache = null;
    cb();
  };

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }

  window.addEventListener("storage", handler);

  return () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }

    window.removeEventListener("storage", handler);
  };
}

const backButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
};

export function EmployerWorkforceStaffDetailPage({ staffId, onBack }: Props) {
  const snapshotFn = useMemo(() => getSnapshot(staffId), [staffId]);
  const data = useSyncExternalStore(subscribe, snapshotFn, snapshotFn);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of data.categories) {
      map.set(category.id, category.name);
    }

    return map;
  }, [data.categories]);

  const [editingBio, setEditingBio] = useState(false);
  const [bioVal, setBioVal] = useState("");
  const [plusVal, setPlusVal] = useState("");
  const [commentVal, setCommentVal] = useState("");

  const [editingCats, setEditingCats] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);

  const [confirmRemove, setConfirmRemove] = useState(false);

  const startEditBio = useCallback(() => {
    if (!data.staff) return;

    setBioVal(data.staff.bio);
    setPlusVal(data.staff.plusPoints);
    setCommentVal(data.staff.ratingComment);
    setEditingBio(true);
  }, [data.staff]);

  const saveBio = useCallback(() => {
    workforceStaffService.updateBio(staffId, bioVal, plusVal, commentVal);
    setEditingBio(false);
    snapVer++;
  }, [bioVal, commentVal, plusVal, staffId]);

  const startEditCats = useCallback(() => {
    if (!data.staff) return;

    setSelectedCats([...data.staff.categories]);
    setEditingCats(true);
  }, [data.staff]);

  const toggleCat = useCallback((catId: string) => {
    setSelectedCats((previous) =>
      previous.includes(catId)
        ? previous.filter((categoryId) => categoryId !== catId)
        : [...previous, catId],
    );
  }, []);

  const saveCats = useCallback(() => {
    if (selectedCats.length === 0) return;

    workforceStaffService.updateCategories(staffId, selectedCats);
    setEditingCats(false);
    snapVer++;
  }, [selectedCats, staffId]);

  const submitRating = useCallback(() => {
    const result = workforceStaffService.rate(staffId, ratingVal);

    if (result.success) {
      setRatingOpen(false);
      snapVer++;
    }
  }, [ratingVal, staffId]);

  const handleRemove = useCallback(() => {
    workforceStaffService.remove(staffId);
    onBack();
  }, [onBack, staffId]);

  if (!data.staff) {
    return (
      <div className="wm-er-vWorkforce">
        <div className="wm-pageHead">
          <button type="button" onClick={onBack} style={backButtonStyle}>
            <IconBack />
          </button>

          <div className="wm-pageTitle">Staff not found</div>
        </div>

        <div className="wm-er-card" style={{ marginTop: 14, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--wm-er-muted)" }}>
            This staff member may have been removed.
          </div>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onBack}
            style={{ marginTop: 12, background: AMBER }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const staff = data.staff;

  return (
    <div className="wm-er-vWorkforce">
      <EmployerWorkforceStaffDetailHeader staff={staff} onBack={onBack} />

      <EmployerWorkforceStaffDetailProfile staff={staff} />

      <EmployerWorkforceStaffDetailCategories
        staff={staff}
        categories={data.categories}
        categoryMap={categoryMap}
        editingCats={editingCats}
        selectedCats={selectedCats}
        onEditOrSave={editingCats ? saveCats : startEditCats}
        onToggleCategory={toggleCat}
      />

      <EmployerWorkforceStaffDetailActions
        staff={staff}
        editingBio={editingBio}
        bioVal={bioVal}
        plusVal={plusVal}
        commentVal={commentVal}
        ratingOpen={ratingOpen}
        ratingVal={ratingVal}
        confirmRemove={confirmRemove}
        onEditOrSaveBio={editingBio ? saveBio : startEditBio}
        onCancelBioEdit={() => setEditingBio(false)}
        onBioChange={setBioVal}
        onPlusChange={setPlusVal}
        onCommentChange={setCommentVal}
        onToggleRating={() => setRatingOpen((current) => !current)}
        onRatingChange={setRatingVal}
        onSubmitRating={submitRating}
        onCancelRating={() => setRatingOpen(false)}
        onRequestRemove={() => setConfirmRemove(true)}
        onConfirmRemove={handleRemove}
        onCancelRemove={() => setConfirmRemove(false)}
      />
    </div>
  );
}
