import { beforeEach, describe, expect, it } from "vitest";
import { usePulseStore } from "../pulseStore";

describe("breathing light follows the current hop", () => {
  beforeEach(() => {
    usePulseStore.getState().clearAll();
  });

  it("lights only chain head until the hop is opened", () => {
    usePulseStore.getState().setChain(
      ["employee-home-shift-card", "shift-dashboard-applications", "employee-shift-shortlisted-card"],
      { severity: "warning" },
    );

    const store = usePulseStore.getState();
    expect(store.isNodeActive("employee-home-shift-card")).toBe(true);
    expect(store.isNodeActive("shift-dashboard-applications")).toBe(false);
    expect(store.isNodeActive("employee-shift-shortlisted-card")).toBe(false);

    store.advanceChain();

    const afterHome = usePulseStore.getState();
    expect(afterHome.chain[0]).toBe("shift-dashboard-applications");
    expect(afterHome.isNodeActive("employee-home-shift-card")).toBe(false);
    expect(afterHome.isNodeActive("shift-dashboard-applications")).toBe(true);
  });

  it("clears the path only on destination confirm", () => {
    usePulseStore.getState().setChain(
      ["home-shift-card", "shift-dashboard-applications", "employee-shift-shortlisted-card"],
      { severity: "warning" },
    );

    usePulseStore.getState().confirmPulseDestination("shift-dashboard-applications");
    expect(usePulseStore.getState().hasActiveChain()).toBe(true);

    usePulseStore.getState().confirmPulseDestination("employee-shift-shortlisted-card");

    const done = usePulseStore.getState();
    expect(done.chain).toEqual([]);
    expect(done.pendingGuidanceRoots).toEqual([]);
    expect(done.isNodeActive("home-shift-card")).toBe(false);
    expect(done.isNodeActive("shift-dashboard-applications")).toBe(false);
    expect(done.hasActiveChain()).toBe(false);
  });
});
