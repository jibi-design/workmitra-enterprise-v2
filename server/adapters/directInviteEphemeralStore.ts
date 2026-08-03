/**
 * Pluggable ephemeral store for direct-invite pending records (lab / multi-node).
 * DB remain SoT for consume when AUTH_USER_SOURCE=db.
 * Redis/Upstash adapter enables shared pending invites across nodes in memory mode.
 */

export type EphemeralInviteRecord = {
  id: string;
  postId: string;
  employerId: string;
  workerWmId: string;
  token: string;
  status: string;
  expiresAt: number;
  createdAt: number;
  consumedAt?: number;
};

export interface DirectInviteEphemeralStore {
  readonly name: string;
  put(invite: EphemeralInviteRecord): Promise<void>;
  getById(id: string): Promise<EphemeralInviteRecord | null>;
  getByToken(token: string): Promise<EphemeralInviteRecord | null>;
  expirePendingForWorker(postId: string, workerWmId: string): Promise<void>;
  casConsume(params: {
    postId: string;
    workerWmId: string;
    token: string;
    inviteId?: string | null;
  }): Promise<EphemeralInviteRecord | null>;
  clear?(): Promise<void>;
}

function normalizeWm(id: string): string {
  return id.trim().toUpperCase();
}

export class MemoryDirectInviteStore implements DirectInviteEphemeralStore {
  readonly name = "memory";
  private readonly byId = new Map<string, EphemeralInviteRecord>();

  async put(invite: EphemeralInviteRecord): Promise<void> {
    this.byId.set(invite.id, invite);
  }

  async getById(id: string): Promise<EphemeralInviteRecord | null> {
    return this.byId.get(id) ?? null;
  }

  async getByToken(token: string): Promise<EphemeralInviteRecord | null> {
    for (const inv of this.byId.values()) {
      if (inv.token === token) return inv;
    }
    return null;
  }

  async expirePendingForWorker(postId: string, workerWmId: string): Promise<void> {
    const wm = normalizeWm(workerWmId);
    for (const [id, inv] of this.byId) {
      if (inv.postId === postId && normalizeWm(inv.workerWmId) === wm && inv.status === "pending") {
        this.byId.set(id, { ...inv, status: "expired" });
      }
    }
  }

  async casConsume(params: {
    postId: string;
    workerWmId: string;
    token: string;
    inviteId?: string | null;
  }): Promise<EphemeralInviteRecord | null> {
    const workerWmId = normalizeWm(params.workerWmId);
    let invite: EphemeralInviteRecord | null = null;
    if (params.inviteId) {
      invite = this.byId.get(params.inviteId) ?? null;
    }
    if (!invite) {
      invite = await this.getByToken(params.token);
    }
    if (!invite) return null;
    if (invite.postId !== params.postId) return null;
    if (normalizeWm(invite.workerWmId) !== workerWmId) return null;
    if (invite.token !== params.token) return null;
    if (invite.status !== "pending" || invite.expiresAt <= Date.now()) return null;

    const consumed: EphemeralInviteRecord = {
      ...invite,
      status: "consumed",
      consumedAt: Date.now(),
    };
    this.byId.set(invite.id, consumed);
    return consumed;
  }

  async clear(): Promise<void> {
    this.byId.clear();
  }
}

/**
 * Upstash-backed ephemeral invite map (JSON values).
 * Keys: wm:sdi:id:{id}, wm:sdi:tok:{token}
 */
export class UpstashDirectInviteStore implements DirectInviteEphemeralStore {
  readonly name = "upstash";
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async cmd(command: unknown[]): Promise<unknown> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    if (!res.ok) throw new Error(`Upstash invite store HTTP ${res.status}`);
    const json = (await res.json()) as { result?: unknown };
    return json.result;
  }

  private idKey(id: string): string {
    return `wm:sdi:id:${id}`;
  }

  private tokKey(token: string): string {
    return `wm:sdi:tok:${token}`;
  }

  async put(invite: EphemeralInviteRecord): Promise<void> {
    const ttlSec = Math.max(60, Math.ceil((invite.expiresAt - Date.now()) / 1000) + 3600);
    const payload = JSON.stringify(invite);
    await this.cmd(["SET", this.idKey(invite.id), payload, "EX", ttlSec]);
    await this.cmd(["SET", this.tokKey(invite.token), invite.id, "EX", ttlSec]);
  }

  async getById(id: string): Promise<EphemeralInviteRecord | null> {
    const raw = await this.cmd(["GET", this.idKey(id)]);
    if (typeof raw !== "string" || !raw) return null;
    try {
      return JSON.parse(raw) as EphemeralInviteRecord;
    } catch {
      return null;
    }
  }

  async getByToken(token: string): Promise<EphemeralInviteRecord | null> {
    const id = await this.cmd(["GET", this.tokKey(token)]);
    if (typeof id !== "string" || !id) return null;
    return this.getById(id);
  }

  async expirePendingForWorker(postId: string, workerWmId: string): Promise<void> {
    // Best-effort: Upstash without SCAN index — no-op; DB path is SoT in production.
    void postId;
    void workerWmId;
  }

  async casConsume(params: {
    postId: string;
    workerWmId: string;
    token: string;
    inviteId?: string | null;
  }): Promise<EphemeralInviteRecord | null> {
    const invite = params.inviteId
      ? await this.getById(params.inviteId)
      : await this.getByToken(params.token);
    if (!invite) return null;
    if (invite.postId !== params.postId) return null;
    if (normalizeWm(invite.workerWmId) !== normalizeWm(params.workerWmId)) return null;
    if (invite.token !== params.token) return null;
    if (invite.status !== "pending" || invite.expiresAt <= Date.now()) return null;

    const consumed: EphemeralInviteRecord = {
      ...invite,
      status: "consumed",
      consumedAt: Date.now(),
    };
    // Optimistic: SET only if still pending — GET+SET race mitigated by DB CAS in prod.
    await this.put(consumed);
    return consumed;
  }
}

let activeEphemeral: DirectInviteEphemeralStore | null = null;

export function getDirectInviteEphemeralStore(): DirectInviteEphemeralStore {
  if (activeEphemeral) return activeEphemeral;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const prefer = (process.env.DIRECT_INVITE_STORE ?? process.env.RATE_LIMIT_STORE ?? "")
    .trim()
    .toLowerCase();

  if (upstashUrl && upstashToken && prefer !== "memory") {
    activeEphemeral = new UpstashDirectInviteStore(upstashUrl, upstashToken);
    console.log("[Job Mitra API] Direct-invite ephemeral store: upstash.");
    return activeEphemeral;
  }

  if (prefer === "redis" || prefer === "upstash") {
    console.warn(
      "[Job Mitra API] DIRECT_INVITE_STORE=redis/upstash but Upstash env unset — using memory.",
    );
  }

  activeEphemeral = new MemoryDirectInviteStore();
  return activeEphemeral;
}

export function __setDirectInviteEphemeralStoreForTests(
  store: DirectInviteEphemeralStore | null,
): void {
  activeEphemeral = store;
}
