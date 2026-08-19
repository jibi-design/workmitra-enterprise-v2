import { describe, expect, it } from "vitest";
import { pickServerPostId } from "./workspaceMessagePostId.helpers";

const SERVER = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

describe("pickServerPostId", () => {
  it("returns a uuid post id as-is", () => {
    expect(
      pickServerPostId({
        postId: SERVER,
        localPosts: [],
        serverDtos: [],
      }),
    ).toBe(SERVER);
  });

  it("matches a local post to the only server dto", () => {
    expect(
      pickServerPostId({
        postId: "shift_local_1",
        localPosts: [{ id: "shift_local_1", jobName: "Kitchen", startAt: 1_700_000_000_000 }],
        serverDtos: [
          { id: SERVER, job_name: "Kitchen", start_at: new Date(1_700_000_000_000).toISOString() },
        ],
      }),
    ).toBe(SERVER);
  });

  it("matches by job name when several server posts exist", () => {
    const other = "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff";
    expect(
      pickServerPostId({
        postId: "shift_local_1",
        localPosts: [{ id: "shift_local_1", jobName: "Kitchen", startAt: 1_700_000_000_000 }],
        serverDtos: [
          { id: other, job_name: "Warehouse", start_at: new Date(1_700_000_000_000).toISOString() },
          { id: SERVER, job_name: "Kitchen", start_at: new Date(1_700_000_000_000).toISOString() },
        ],
        jobName: "Kitchen",
      }),
    ).toBe(SERVER);
  });
});
