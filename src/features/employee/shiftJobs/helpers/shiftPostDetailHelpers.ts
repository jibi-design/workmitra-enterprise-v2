// src/features/employee/shiftJobs/helpers/shiftPostDetailHelpers.ts
const APPS_KEY = "wm_employee_shift_applications_v1";
const POSTS_KEY = "wm_employee_shift_posts_demo_v1";

export function hasConfirmedOverlap(postId: string, startAt: number, endAt: number): boolean {
  try {
    const apps = JSON.parse(localStorage.getItem(APPS_KEY) ?? "[]") as { postId: string; status: string }[];
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY) ?? "[]") as { id: string; startAt: number; endAt: number }[];
    const postMap = new Map(posts.map((p) => [p.id, p]));
    return apps.some((a) => {
      if (a.status !== "confirmed" || a.postId === postId) return false;
      const p = postMap.get(a.postId);
      return p ? p.startAt <= endAt && p.endAt >= startAt : false;
    });
  } catch { return false; }
}

export const PROVIDE_MAP: Record<string, { label: string; icon: string }> = {
  meals: { label: "Meals provided", icon: "🍱" },
  transport: { label: "Transport arranged", icon: "🚌" },
  uniform: { label: "Uniform provided", icon: "👔" },
  accommodation: { label: "Accommodation", icon: "🏠" },
  tools: { label: "Tools / Equipment", icon: "🔧" },
  ppe: { label: "Safety gear (PPE)", icon: "🦺" },
  training: { label: "On-site training", icon: "📋" },
  overtime: { label: "Overtime pay", icon: "💰" },
};