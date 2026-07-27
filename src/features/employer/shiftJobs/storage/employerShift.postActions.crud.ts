import {
  readEmployerPosts,
  syncToEmployeeSearch,
  writeEmployerPosts,
} from "./employerShift.postStorage";
import { pushEmployerActivity } from "./employerShift.activityStorage";
import {
  buildShiftPostCreateBody,
  hydrateShiftPostsFromServer,
  mergeServerPostIntoLsCache,
} from "../../../shift/services/shiftDbTruth.service";
import { isShiftApiSyncEnabled, shiftGateApi } from "../../../shift/services/shiftGateApi.service";
import { isShiftServerUuid, shiftPostIdBridge } from "../../../shift/utils/shiftIdBridge";
import type { ShiftPost } from "./employerShift.types";
import { createLocalId, notifyEmployerShiftPostsChanged, uniq } from "./employerShift.utils";

export function getEmployerShiftPosts(): ShiftPost[] {
  if (isShiftApiSyncEnabled()) {
    void hydrateShiftPostsFromServer();
  }
  return readEmployerPosts();
}

export function getEmployerShiftPost(postId: string): ShiftPost | null {
  return getEmployerShiftPosts().find((post) => post.id === postId) ?? null;
}

export async function saveEmployerShiftPost(
  input: Omit<ShiftPost, "id"> & { id?: string },
): Promise<ShiftPost | null> {
  const posts = readEmployerPosts();
  const nowId = input.id && input.id.trim() ? input.id : createLocalId("shift");

  const post: ShiftPost = {
    ...input,
    id: nowId,
    shortlistIds: uniq(input.shortlistIds ?? []),
    waitingIds: uniq(input.waitingIds ?? []),
    confirmedIds: uniq(input.confirmedIds ?? []),
    rejectedIds: uniq(input.rejectedIds ?? []),
  };

  const exists = posts.some((item) => item.id === post.id);
  const prior = posts;
  const next = exists ? posts.map((item) => (item.id === post.id ? post : item)) : [post, ...posts];

  writeEmployerPosts(next);
  syncToEmployeeSearch(next);

  if (isShiftApiSyncEnabled() && !exists) {
    try {
      const dto = await shiftGateApi.createPost(buildShiftPostCreateBody(post));
      const merged = mergeServerPostIntoLsCache(dto, post.id);
      if (!merged) {
        writeEmployerPosts(prior);
        syncToEmployeeSearch(prior);
        return null;
      }

      pushEmployerActivity({
        postId: merged.id,
        kind: "post_created",
        title: "Shift post created",
        body: `${merged.jobName} at ${merged.companyName}`,
        route: `/employer/shift/post/${merged.id}`,
      });

      return merged;
    } catch {
      writeEmployerPosts(prior);
      syncToEmployeeSearch(prior);
      return null;
    }
  }

  if (!exists) {
    pushEmployerActivity({
      postId: post.id,
      kind: "post_created",
      title: "Shift post created",
      body: `${post.jobName} at ${post.companyName}`,
      route: `/employer/shift/post/${post.id}`,
    });
  }

  return post;
}

export function updateEmployerShiftPost(
  postId: string,
  patch: Partial<ShiftPost>,
): ShiftPost | null {
  const posts = readEmployerPosts();
  const current = posts.find((post) => post.id === postId);

  if (!current) return null;

  const updated: ShiftPost = {
    ...current,
    ...patch,
    id: current.id,
    shortlistIds: uniq(patch.shortlistIds ?? current.shortlistIds),
    waitingIds: uniq(patch.waitingIds ?? current.waitingIds),
    confirmedIds: uniq(patch.confirmedIds ?? current.confirmedIds),
    rejectedIds: uniq(patch.rejectedIds ?? current.rejectedIds),
  };

  const next = posts.map((post) => (post.id === postId ? updated : post));

  writeEmployerPosts(next);
  syncToEmployeeSearch(next);

  if (isShiftApiSyncEnabled()) {
    const serverPostId = shiftPostIdBridge.resolveServerId(postId) ?? postId;
    if (isShiftServerUuid(serverPostId)) {
      void shiftGateApi
        .updatePost(serverPostId, buildShiftPostCreateBody(updated))
        .then((dto) => {
          mergeServerPostIntoLsCache(dto, updated.id);
        })
        .catch(() => {
          // LS already updated; next hydrate reconciles
        });
    }
  }

  return updated;
}

export function setEmployerShiftHidden(postId: string, hidden: boolean): ShiftPost | null {
  const updated = updateEmployerShiftPost(postId, {
    isHiddenFromSearch: hidden,
  });

  if (!updated) return null;

  pushEmployerActivity({
    postId,
    kind: hidden ? "hidden" : "unhidden",
    title: hidden ? "Shift hidden from employee search" : "Shift visible in employee search",
    body: updated.jobName,
    route: `/employer/shift/post/${postId}`,
  });

  return updated;
}

export function deleteEmployerShiftPost(postId: string): void {
  const prior = readEmployerPosts();
  const posts = prior.filter((post) => post.id !== postId);

  writeEmployerPosts(posts);
  syncToEmployeeSearch(posts);
  notifyEmployerShiftPostsChanged();

  if (isShiftApiSyncEnabled()) {
    const serverPostId = shiftPostIdBridge.resolveServerId(postId);
    if (serverPostId) {
      void shiftGateApi.deletePost(serverPostId).catch(() => {
        // P0-3 — restore LS on API failure so next hydrate cannot resurrect a ghost
        writeEmployerPosts(prior);
        syncToEmployeeSearch(prior);
        notifyEmployerShiftPostsChanged();
      });
    }
  }
}
