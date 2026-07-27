/**
 * Job Mitra | Phase 3 Calling — Agora join + mute/end hook
 * Path: src/features/shared/calling/useAgoraCall.ts
 */

import { useEffect, useRef, useState } from "react";
import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";
import { callingGateApi, isCallingApiEnabled } from "./callingGateApi.service";
import type {
  AnswerCallInput,
  CallSessionDto,
  CallUiStatus,
  InitiateCallInput,
} from "./calling.types";

const DEFAULT_NO_ANSWER_MS = 30_000;

function hashUid(ml: string): number {
  let h = 0;
  const s = ml.trim().toUpperCase();
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  const uid = h % 100_000_000;
  return uid === 0 ? 1 : uid;
}

export type UseAgoraCallResult = {
  status: CallUiStatus;
  muted: boolean;
  error: string | null;
  session: CallSessionDto | null;
  partyMl: string | null;
  isBusy: boolean;
  initiate: (input: InitiateCallInput) => Promise<void>;
  answer: (input: AnswerCallInput) => Promise<void>;
  end: (status?: "ended" | "declined") => Promise<void>;
  toggleMute: () => Promise<void>;
  triggerFallback: (toE164: string) => Promise<void>;
  reset: () => void;
};

export function useAgoraCall(): UseAgoraCallResult {
  const [status, setStatus] = useState<CallUiStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<CallSessionDto | null>(null);
  const [partyMl, setPartyMl] = useState<string | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<ILocalAudioTrack | null>(null);
  const joiningRef = useRef(false);
  const mountedRef = useRef(true);
  const statusRef = useRef<CallUiStatus>("idle");
  const sessionRef = useRef<CallSessionDto | null>(null);
  const partyMlRef = useRef<string | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  statusRef.current = status;
  sessionRef.current = session;
  partyMlRef.current = partyMl;

  function clearFallbackTimer(): void {
    if (fallbackTimerRef.current != null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }

  function scheduleNoAnswerFallback(toE164: string, noAnswerMs: number): void {
    clearFallbackTimer();
    const dest = toE164.trim();
    if (!dest.startsWith("+")) return;
    const wait = Math.max(5_000, Math.min(noAnswerMs, 120_000));
    fallbackTimerRef.current = setTimeout(() => {
      const st = statusRef.current;
      if (st === "ended" || st === "declined" || st === "failed" || st === "idle") return;
      const current = sessionRef.current;
      const ml = partyMlRef.current;
      if (!current || !ml || !isCallingApiEnabled()) return;
      void callingGateApi
        .fallback({ callSessionId: current.id, partyMl: ml, toE164: dest })
        .catch((err: unknown) => {
          if (!mountedRef.current) return;
          setError(err instanceof Error ? err.message : "Fallback failed");
        });
    }, wait);
  }

  async function leaveChannel(): Promise<void> {
    try {
      localAudioRef.current?.stop();
      localAudioRef.current?.close();
      localAudioRef.current = null;
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
    } catch {
      console.warn("[AgoraCall] leaveChannel cleanup failed");
      clientRef.current = null;
      localAudioRef.current = null;
    }
  }

  async function joinWithCreds(creds: {
    appId: string;
    channelId: string;
    token: string;
    uid: number;
  }): Promise<void> {
    setStatus("connecting");
    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    client.on("user-published", async (user, mediaType) => {
      if (mediaType !== "audio") return;
      await client.subscribe(user, "audio");
      user.audioTrack?.play();
      clearFallbackTimer();
    });

    await client.join(creds.appId, creds.channelId, creds.token, creds.uid);
    if (!mountedRef.current) {
      await leaveChannel();
      return;
    }
    const mic = await AgoraRTC.createMicrophoneAudioTrack();
    if (!mountedRef.current) {
      mic.stop();
      mic.close();
      await leaveChannel();
      return;
    }
    localAudioRef.current = mic;
    await client.publish([mic]);
    if (!mountedRef.current) {
      await leaveChannel();
      return;
    }
    setMuted(false);
    setStatus("connected");
  }

  async function initiate(input: InitiateCallInput): Promise<void> {
    if (joiningRef.current) return;
    if (!isCallingApiEnabled()) {
      setStatus("failed");
      setError("Calling API requires auth backend (VITE_AUTH_BACKEND_ENABLED=true).");
      return;
    }

    joiningRef.current = true;
    setError(null);
    setStatus("ringing");
    setPartyMl(input.initiatorMl.trim().toUpperCase());
    clearFallbackTimer();

    try {
      const uid = input.uid ?? hashUid(input.initiatorMl);
      const { session: nextSession, agora } = await callingGateApi.initiate({
        workspaceId: input.workspaceId,
        initiatorMl: input.initiatorMl,
        receiverMl: input.receiverMl,
        fcmToken: input.fcmToken,
        uid,
      });
      if (!mountedRef.current) return;
      setSession(nextSession);
      sessionRef.current = nextSession;
      if (input.fallbackToE164) {
        scheduleNoAnswerFallback(input.fallbackToE164, input.noAnswerMs ?? DEFAULT_NO_ANSWER_MS);
      }
      await joinWithCreds(agora);
    } catch (err) {
      clearFallbackTimer();
      await leaveChannel();
      if (!mountedRef.current) return;
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      joiningRef.current = false;
    }
  }

  async function answer(input: AnswerCallInput): Promise<void> {
    if (joiningRef.current) return;
    if (!isCallingApiEnabled()) {
      setStatus("failed");
      setError("Calling API requires auth backend (VITE_AUTH_BACKEND_ENABLED=true).");
      return;
    }

    joiningRef.current = true;
    setError(null);
    setStatus("connecting");
    setPartyMl(input.partyMl.trim().toUpperCase());
    clearFallbackTimer();

    try {
      const uid = input.uid ?? hashUid(input.partyMl);
      const { session: nextSession, agora } = await callingGateApi.answer({
        callSessionId: input.callSessionId,
        partyMl: input.partyMl,
        uid,
      });
      if (!mountedRef.current) return;
      setSession(nextSession);
      await joinWithCreds(agora);
    } catch (err) {
      await leaveChannel();
      if (!mountedRef.current) return;
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      joiningRef.current = false;
    }
  }

  async function end(next: "ended" | "declined" = "ended"): Promise<void> {
    clearFallbackTimer();
    const current = sessionRef.current;
    const ml = partyMlRef.current;
    try {
      if (current && ml && isCallingApiEnabled()) {
        await callingGateApi.end({ callSessionId: current.id, partyMl: ml, status: next });
      }
    } catch {
      console.warn("[AgoraCall] end() session update failed — leaving local channel");
    }
    await leaveChannel();
    if (!mountedRef.current) return;
    setStatus(next === "declined" ? "declined" : "ended");
  }

  async function toggleMute(): Promise<void> {
    const track = localAudioRef.current;
    if (!track) return;
    const next = !muted;
    await track.setEnabled(!next);
    if (!mountedRef.current) return;
    setMuted(next);
  }

  async function triggerFallback(toE164: string): Promise<void> {
    const current = sessionRef.current;
    const ml = partyMlRef.current;
    if (!current || !ml) return;
    try {
      await callingGateApi.fallback({ callSessionId: current.id, partyMl: ml, toE164 });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Fallback failed");
    }
  }

  function reset(): void {
    clearFallbackTimer();
    void leaveChannel();
    setStatus("idle");
    setMuted(false);
    setError(null);
    setSession(null);
    setPartyMl(null);
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearFallbackTimer();
      void leaveChannel();
    };
  }, []);

  const isBusy = status === "ringing" || status === "connecting" || status === "connected";

  return {
    status,
    muted,
    error,
    session,
    partyMl,
    isBusy,
    initiate,
    answer,
    end,
    toggleMute,
    triggerFallback,
    reset,
  };
}
