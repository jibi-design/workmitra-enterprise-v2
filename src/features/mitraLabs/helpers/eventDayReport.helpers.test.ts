import { describe, expect, it } from "vitest";
import type { PassCheckInEvent } from "../validation/mitraLabs.schemas";
import {
  buildEventDayReport,
  buildEventDayReportCsv,
  isPinVerifiedCheckIn,
} from "./eventDayReport.helpers";

function event(partial: Partial<PassCheckInEvent> & Pick<PassCheckInEvent, "action" | "verifiedAt">): PassCheckInEvent {
  return {
    eventId: partial.eventId ?? `evt_${Math.random().toString(36).slice(2, 8)}`,
    passId: partial.passId ?? "pass_1",
    passToken: partial.passToken ?? "token_abcdefghijklmn",
    staffName: partial.staffName ?? "Ada",
    issuerId: partial.issuerId ?? "er_1",
    action: partial.action,
    verifiedAt: partial.verifiedAt,
    createdAt: partial.createdAt ?? Date.parse(partial.verifiedAt),
  };
}

describe("eventDayReport.helpers", () => {
  it("counts only PIN check_in as entered", () => {
    expect(isPinVerifiedCheckIn(event({ action: "check_in", verifiedAt: "2026-08-17T10:00:00.000Z" }))).toBe(
      true,
    );
    expect(
      isPinVerifiedCheckIn(event({ action: "scan_verify", verifiedAt: "2026-08-17T10:00:00.000Z" })),
    ).toBe(false);
  });

  it("builds today and 7-day totals without counting camera scans", () => {
    const now = new Date(2026, 7, 17, 15, 0, 0).getTime();
    const todayMorning = new Date(2026, 7, 17, 9, 0, 0).toISOString();
    const todayNoon = new Date(2026, 7, 17, 11, 0, 0).toISOString();
    const todayScan = new Date(2026, 7, 17, 12, 0, 0).toISOString();
    const tooOld = new Date(2026, 7, 10, 9, 0, 0).toISOString();
    const model = buildEventDayReport(
      [
        event({
          action: "check_in",
          passId: "p1",
          staffName: "Ada",
          verifiedAt: todayMorning,
          createdAt: now - 1000,
        }),
        event({
          action: "check_in",
          passId: "p1",
          staffName: "Ada",
          verifiedAt: todayNoon,
          createdAt: now,
        }),
        event({
          action: "scan_verify",
          passId: "p2",
          staffName: "Scan Only",
          verifiedAt: todayScan,
          createdAt: now,
        }),
        event({
          action: "check_in",
          passId: "p3",
          staffName: "Older",
          verifiedAt: tooOld,
          createdAt: now - 8 * 24 * 60 * 60 * 1000,
        }),
      ],
      now,
    );

    expect(model.todayCheckIns).toBe(2);
    expect(model.todayUnique).toBe(1);
    expect(model.windowCheckIns).toBe(2);
    expect(model.scanVerifyCount).toBe(1);
    expect(model.people).toHaveLength(2);
    expect(model.people.every((row) => row.status === "Entered")).toBe(true);
    expect(model.last7Days).toHaveLength(7);
  });

  it("builds CSV without an OUT column", () => {
    const csv = buildEventDayReportCsv([
      {
        eventId: "e1",
        staffName: "Ada, Guest",
        passId: "p1",
        entryAt: "2026-08-17T09:00:00.000Z",
        status: "Entered",
      },
    ]);
    expect(csv).toContain("Name,Pass ID,Entry time,Status");
    expect(csv).toContain('"Ada, Guest"');
    expect(csv.toLowerCase()).not.toContain("out");
    expect(csv.toLowerCase()).not.toContain("exit");
  });
});
