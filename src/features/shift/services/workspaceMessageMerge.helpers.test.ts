import { describe, expect, it } from "vitest";
import { mergeWorkspaceMessages } from "./workspaceMessageMerge.helpers";

describe("mergeWorkspaceMessages", () => {
  it("appends a server message onto the matching post workspace", () => {
    const workspaces = [
      {
        postId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        lastActivityAt: 1,
        unreadCount: 0,
        updates: [],
      },
    ];
    const next = mergeWorkspaceMessages(workspaces, "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", [
      {
        id: "11111111-2222-4333-8444-555555555555",
        postId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        kind: "direct",
        title: "Reply (Employee)",
        body: "hello from worker",
        actorRole: "employee",
        createdAt: 99,
      },
    ]);
    expect(next[0]?.updates[0]?.body).toBe("hello from worker");
    expect(next[0]?.unreadCount).toBe(1);
  });

  it("does not duplicate the same event id", () => {
    const id = "11111111-2222-4333-8444-555555555555";
    const workspaces = [
      {
        postId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        lastActivityAt: 1,
        unreadCount: 0,
        updates: [{ id, createdAt: 99, kind: "direct" as const, title: "Reply (Employee)", body: "hello" }],
      },
    ];
    const next = mergeWorkspaceMessages(workspaces, "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", [
      {
        id,
        postId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        kind: "direct",
        title: "Reply (Employee)",
        body: "hello",
        actorRole: "employee",
        createdAt: 99,
      },
    ]);
    expect(next[0]?.updates).toHaveLength(1);
  });

  it("attaches to the only live workspace when post ids differ", () => {
    const workspaces = [
      {
        postId: "local-shift-1",
        status: "active",
        lastActivityAt: 1,
        unreadCount: 0,
        updates: [],
      },
    ];
    const next = mergeWorkspaceMessages(workspaces, "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", [
      {
        id: "11111111-2222-4333-8444-555555555555",
        postId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        kind: "broadcast",
        title: "Announcement",
        body: "hello from employer",
        actorRole: "employer",
        createdAt: 99,
      },
    ]);
    expect(next[0]?.updates[0]?.body).toBe("hello from employer");
  });
});
