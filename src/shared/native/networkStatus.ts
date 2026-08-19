/**
 * Network online status — Capacitor Network on native, navigator.onLine on web.
 */
import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";

type Listener = () => void;

let online = typeof navigator !== "undefined" ? navigator.onLine !== false : true;
const listeners = new Set<Listener>();
let bootstrapped = false;

function emit() {
  listeners.forEach((l) => l());
}

function setOnline(next: boolean) {
  if (online === next) return;
  online = next;
  emit();
}

async function bootstrap(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const status = await Network.getStatus();
      setOnline(status.connected);
      await Network.addListener("networkStatusChange", (s) => {
        setOnline(s.connected);
      });
    } catch {
      setOnline(typeof navigator === "undefined" ? true : navigator.onLine !== false);
    }
  }
}

void bootstrap();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): boolean {
  return online;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useNetworkOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getNetworkOnline(): boolean {
  return online;
}
