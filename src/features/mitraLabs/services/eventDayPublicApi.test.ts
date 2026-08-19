import { describe, expect, it } from "vitest";
import { ApiRequestError } from "../../../shared/services/apiService";
import { PUBLIC_EVENT_DAY_API, publicCheckInErrorMessage } from "./eventDayPublicApi";

describe("eventDayPublicApi", () => {
  it("keeps public Event Day paths off Shift and Career", () => {
    expect(PUBLIC_EVENT_DAY_API).toBe("/v1/jobmitra/public/event-day");
    expect(PUBLIC_EVENT_DAY_API).not.toContain("/shift");
    expect(PUBLIC_EVENT_DAY_API).not.toContain("/career");
  });

  it("maps unique-entry and store-not-ready codes to door copy", () => {
    expect(publicCheckInErrorMessage(new ApiRequestError("x", 409, "ALREADY_CHECKED_IN"))).toContain(
      "already has a PIN entry",
    );
    expect(
      publicCheckInErrorMessage(new ApiRequestError("x", 503, "EVENT_DAY_STORE_NOT_READY")),
    ).toContain("not ready");
    expect(publicCheckInErrorMessage(new ApiRequestError("x", 401, "CHECK_IN_DENIED"))).toContain(
      "not accepted",
    );
  });
});
