/**
 * Pluggable rate-limit + shared KV store (memory default; Upstash when configured).
 * Multi-node: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

export type BucketConsumeResult = {
  blocked: boolean;
  retryAfterSec: number;
  remaining: number;
  limit: number;
};

export interface RateLimitBucketStore {
  readonly name: string;
  consume(key: string, windowMs: number, maxHits: number): Promise<BucketConsumeResult>;
  /** Shared string KV (CSRF tokens, etc.) */
  setKv(key: string, value: string, ttlMs: number): Promise<void>;
  getKv(key: string): Promise<string | null>;
  delKv(key: string): Promise<void>;
  reset?(): Promise<void>;
}

type MemBucket = { count: number; resetAt: number };
type MemKv = { value: string; expiresAt: number };

export class MemoryRateLimitStore implements RateLimitBucketStore {
  readonly name = "memory";
  private readonly buckets = new Map<string, MemBucket>();
  private readonly kv = new Map<string, MemKv>();
  private hitCounter = 0;
  private readonly pruneEvery = 500;

  private prune(now: number): void {
    this.hitCounter += 1;
    if (this.hitCounter < this.pruneEvery) return;
    this.hitCounter = 0;
    for (const [key, bucket] of this.buckets) {
      if (now >= bucket.resetAt) this.buckets.delete(key);
    }
    for (const [key, entry] of this.kv) {
      if (now >= entry.expiresAt) this.kv.delete(key);
    }
  }

  async consume(key: string, windowMs: number, maxHits: number): Promise<BucketConsumeResult> {
    const now = Date.now();
    this.prune(now);
    const current = this.buckets.get(key);

    if (!current || now >= current.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return {
        blocked: false,
        retryAfterSec: 0,
        remaining: maxHits - 1,
        limit: maxHits,
      };
    }

    current.count += 1;
    if (current.count > maxHits) {
      const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      return { blocked: true, retryAfterSec, remaining: 0, limit: maxHits };
    }

    return {
      blocked: false,
      retryAfterSec: 0,
      remaining: Math.max(0, maxHits - current.count),
      limit: maxHits,
    };
  }

  async setKv(key: string, value: string, ttlMs: number): Promise<void> {
    this.kv.set(key, { value, expiresAt: Date.now() + Math.max(1000, ttlMs) });
  }

  async getKv(key: string): Promise<string | null> {
    const entry = this.kv.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      this.kv.delete(key);
      return null;
    }
    return entry.value;
  }

  async delKv(key: string): Promise<void> {
    this.kv.delete(key);
  }

  async reset(): Promise<void> {
    this.buckets.clear();
    this.kv.clear();
    this.hitCounter = 0;
  }
}

/**
 * Upstash REST fixed-window counter (INCR + EXPIRE) + string KV.
 */
export class UpstashRateLimitStore implements RateLimitBucketStore {
  readonly name = "upstash";
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async pipeline(commands: unknown[][]): Promise<unknown[]> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });
    if (!res.ok) {
      throw new Error(`Upstash rate-limit HTTP ${res.status}`);
    }
    const json = (await res.json()) as Array<{ result?: unknown }>;
    return json.map((row) => row.result);
  }

  private async cmd(command: unknown[]): Promise<unknown> {
    const results = await this.pipeline([command]);
    return results[0];
  }

  async consume(key: string, windowMs: number, maxHits: number): Promise<BucketConsumeResult> {
    const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));
    const redisKey = `wm:rl:${key}`;
    const results = await this.pipeline([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, ttlSec, "NX"],
      ["TTL", redisKey],
    ]);
    const count = Number(results[0] ?? 0);
    const ttl = Number(results[2] ?? ttlSec);
    if (count > maxHits) {
      return {
        blocked: true,
        retryAfterSec: Math.max(1, ttl > 0 ? ttl : ttlSec),
        remaining: 0,
        limit: maxHits,
      };
    }
    return {
      blocked: false,
      retryAfterSec: 0,
      remaining: Math.max(0, maxHits - count),
      limit: maxHits,
    };
  }

  async setKv(key: string, value: string, ttlMs: number): Promise<void> {
    const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
    await this.cmd(["SET", `wm:kv:${key}`, value, "EX", ttlSec]);
  }

  async getKv(key: string): Promise<string | null> {
    const raw = await this.cmd(["GET", `wm:kv:${key}`]);
    return typeof raw === "string" ? raw : null;
  }

  async delKv(key: string): Promise<void> {
    await this.cmd(["DEL", `wm:kv:${key}`]);
  }
}

let activeStore: RateLimitBucketStore | null = null;

export function getRateLimitStore(): RateLimitBucketStore {
  if (activeStore) return activeStore;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const prefer = (process.env.RATE_LIMIT_STORE ?? "").trim().toLowerCase();

  if ((prefer === "redis" || prefer === "upstash" || prefer === "") && upstashUrl && upstashToken) {
    activeStore = new UpstashRateLimitStore(upstashUrl, upstashToken);
    console.log("[Job Mitra API] Rate limit store: upstash (shared multi-node).");
    return activeStore;
  }

  if (prefer === "redis" || prefer === "upstash") {
    console.warn(
      "[Job Mitra API] RATE_LIMIT_STORE=redis/upstash but UPSTASH_REDIS_REST_URL/TOKEN unset — using memory.",
    );
  }

  activeStore = new MemoryRateLimitStore();
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[Job Mitra API] Rate limit / CSRF store: memory in production — " +
        "tokens and buckets reset on process restart. Set UPSTASH_REDIS_REST_URL + " +
        "UPSTASH_REDIS_REST_TOKEN for multi-node / restart-safe CSRF + rate limits.",
    );
  } else {
    console.log("[Job Mitra API] Rate limit store: memory (single-node).");
  }
  return activeStore;
}

/** Test / hot-swap hook */
export function __setRateLimitStoreForTests(store: RateLimitBucketStore | null): void {
  activeStore = store;
}
