/** Job Mitra | AUTH-on nearby Career id cache. */

const EVENT = "wm:career-nearby-ids-changed";

let nearbyIds: string[] = [];

export function getNearbyCareerIds(): string[] {
  return nearbyIds;
}

export function getNearbyCareerIdsKey(): string {
  return nearbyIds.join(",");
}

export function setNearbyCareerIds(ids: string[]): void {
  nearbyIds = ids.filter((id) => id.trim().length > 0);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function subscribeNearbyCareerIds(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
