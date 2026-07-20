// App name: Job Mitra
// File name: ShiftControlCenterPreviewPosts.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftControlCenterPreviewPosts.tsx

import type { ShiftControlRecord } from "../types/shiftControlCenter.types";

type ShiftControlCenterPreviewPostsProps = {
  posts: ShiftControlRecord[];
  onBrowseAll: () => void;
  onOpenPost: (postId: string) => void;
};

type ShiftPayBasis = "per_hour" | "per_day" | "fixed_total" | "not_listed";

export function ShiftControlCenterPreviewPosts({
  posts,
  onBrowseAll,
  onOpenPost,
}: ShiftControlCenterPreviewPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="wm-shiftEmployeePreviewPosts">
      <div className="wm-shiftEmployeePreviewHead">
        <div className="wm-shiftEmployeePreviewTitle">Available Shifts</div>

        <button type="button" onClick={onBrowseAll} className="wm-shiftEmployeePreviewBrowseButton">
          Browse All
        </button>
      </div>

      <div className="wm-shiftEmployeePreviewList">
        {posts.map((post) => {
          const postId = readString(post["id"]);
          if (!postId) return null;

          return (
            <button
              key={postId}
              type="button"
              onClick={() => onOpenPost(postId)}
              className="wm-shiftEmployeePreviewPostButton"
            >
              <div className="wm-shiftEmployeePreviewPostRow">
                <div className="wm-shiftEmployeePreviewPostInfo">
                  <div className="wm-shiftEmployeePreviewPostTitle">
                    {readString(post["jobName"]) || "Shift"} -{" "}
                    {readString(post["companyName"]) || "Company"}
                  </div>

                  <div className="wm-shiftEmployeePreviewPostMeta">
                    {readString(post["locationName"]) || "Location"} -{" "}
                    {readString(post["category"]) || "General"}
                  </div>
                </div>

                <div className="wm-shiftEmployeePreviewPay">
                  {formatShiftPayDisplay(
                    readNumber(post["payPerDay"]),
                    readPayBasis(post["payBasis"]),
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatShiftPayDisplay(amount: number, payBasis: ShiftPayBasis | undefined): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount}/hour` : "Pay not listed";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "Pay not listed";

  return amount > 0 ? `${amount}/day` : "Pay not listed";
}

function readPayBasis(value: unknown): ShiftPayBasis | undefined {
  if (
    value === "per_hour" ||
    value === "per_day" ||
    value === "fixed_total" ||
    value === "not_listed"
  ) {
    return value;
  }

  return undefined;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
