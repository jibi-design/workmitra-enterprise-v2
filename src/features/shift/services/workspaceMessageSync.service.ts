/** Poll + send shift workspace messages across employee/employer devices. */

import { useEffect } from "react";
import { getEmployerShiftPosts, readEmployeeApplications } from "../../shared/shift/shiftEmployerPublic";
import { mergeServerPostsBatchIntoLsCache } from "./shiftDbTruth.service";
import { shiftGateApi } from "./shiftGateApi.service";
import {
  isWorkspaceMessageApiEnabled,
  workspaceMessageApi,
} from "./workspaceMessageApi.service";
import { persistWorkspaceMessages } from "./workspaceMessagePersist.service";
import {
  pickServerPostId,
  pickServerPostIdFromApplications,
  rememberPostIdBridge,
} from "./workspaceMessagePostId.helpers";
import { ApiRequestError } from "../../../shared/services/apiService";

export { isWorkspaceMessageApiEnabled } from "./workspaceMessageApi.service";
export { formatWorkspaceSendError } from "./workspaceMessagePostId.helpers";

const POLL_MS = 15_000;
const POLL_BACKOFF_MS = 45_000;

async function resolvePostIdForSend(
  role: "employee" | "employer",
  postId: string,
  hints?: { jobName?: string; startAt?: number },
): Promise<string | null> {
  if (role === "employer") {
    const serverDtos = await shiftGateApi.listMyPosts();
    mergeServerPostsBatchIntoLsCache(serverDtos);
    const localPosts = getEmployerShiftPosts().map((post) => ({
      id: post.id,
      jobName: post.jobName,
      startAt: post.startAt,
    }));
    const picked = pickServerPostId({
      postId,
      localPosts,
      serverDtos,
      jobName: hints?.jobName,
      startAt: hints?.startAt,
    });
    if (picked) rememberPostIdBridge(postId, picked);
    return picked;
  }

  const fromApps = pickServerPostIdFromApplications(postId, readEmployeeApplications());
  if (fromApps) {
    rememberPostIdBridge(postId, fromApps);
    return fromApps;
  }
  const localPosts = getEmployerShiftPosts().map((post) => ({
    id: post.id,
    jobName: post.jobName,
    startAt: post.startAt,
  }));
  const picked = pickServerPostId({
    postId,
    localPosts,
    serverDtos: [],
    jobName: hints?.jobName,
    startAt: hints?.startAt,
  });
  if (picked) rememberPostIdBridge(postId, picked);
  return picked;
}

export async function syncWorkspaceMessages(role: "employee" | "employer"): Promise<void> {
  if (!isWorkspaceMessageApiEnabled()) return;
  const messages = await workspaceMessageApi.listMine(role);
  persistWorkspaceMessages(messages);
}

export async function sendAndSyncWorkspaceMessage(input: {
  role: "employee" | "employer";
  postId: string;
  kind: "broadcast" | "direct";
  title: string;
  body: string;
  jobName?: string;
  startAt?: number;
}): Promise<boolean> {
  if (!isWorkspaceMessageApiEnabled()) return false;
  const serverPostId = await resolvePostIdForSend(input.role, input.postId, {
    jobName: input.jobName,
    startAt: input.startAt,
  });
  if (!serverPostId) return false;
  const message = await workspaceMessageApi.send(input.role, serverPostId, {
    kind: input.kind,
    title: input.title,
    body: input.body,
  });
  persistWorkspaceMessages([message]);
  await syncWorkspaceMessages(input.role).catch(() => undefined);
  return true;
}

export function useShiftWorkspaceMessageSync(role: "employee" | "employer"): void {
  useEffect(() => {
    if (!isWorkspaceMessageApiEnabled()) return;
    let cancelled = false;
    let timer = 0;
    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void runTick();
      }, ms);
    };
    const runTick = async () => {
      if (cancelled) return;
      try {
        await syncWorkspaceMessages(role);
        schedule(POLL_MS);
      } catch (error) {
        const limited = error instanceof ApiRequestError && error.status === 429;
        schedule(limited ? POLL_BACKOFF_MS : POLL_MS);
      }
    };
    void runTick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [role]);
}
