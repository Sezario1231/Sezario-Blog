interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface MemoryEntry {
  timestamps: number[];
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

export async function checkRateLimit(
  locals: any,
  scope: string,
  ip: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const key = `rl:${scope}:${ip}`;
  const kv = locals?.runtime?.env?.RATE_LIMIT_KV as KVLike | undefined;

  if (kv) {
    try {
      const raw = await kv.get(key);
      const timestamps: number[] = raw ? JSON.parse(raw) : [];
      const fresh = timestamps.filter((t) => now - t < windowMs);
      fresh.push(now);
      const ttl = Math.max(60, Math.ceil(windowMs / 1000));
      await kv.put(key, JSON.stringify(fresh), { expirationTtl: ttl });
      return fresh.length > limit;
    } catch {
      return checkMemory(scope, ip, limit, windowMs, now);
    }
  }

  return checkMemory(scope, ip, limit, windowMs, now);
}

function checkMemory(scope: string, ip: string, limit: number, windowMs: number, now: number): boolean {
  const key = `${scope}:${ip}`;
  const entry = memoryStore.get(key);
  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { timestamps: [now], resetAt: now + windowMs });
    return false;
  }
  const fresh = entry.timestamps.filter((t) => now - t < windowMs);
  fresh.push(now);
  entry.timestamps = fresh;
  return fresh.length > limit;
}
