import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    })
  : null;

// In-memory fallback (resets on deploy — acceptable for dev/staging)
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export async function checkRateLimit(
  key: string,
  max = 5,
  windowMs = 10 * 60 * 1000,
): Promise<{ allowed: boolean; remaining: number; retryAfterSec: number }> {
  if (redis) {
    const windowSec = Math.ceil(windowMs / 1000);
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    const ttl = await redis.ttl(key);
    if (count > max) {
      return { allowed: false, remaining: 0, retryAfterSec: Math.max(ttl, 1) };
    }
    return { allowed: true, remaining: max - count, retryAfterSec: 0 };
  }

  // Fallback: in-memory
  const now   = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfterSec: 0 };
  }
  if (entry.count >= max) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { allowed: true, remaining: max - entry.count, retryAfterSec: 0 };
}

// Cleanup stale in-memory entries every 15 min (no-op when Redis is active)
if (!redis && typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
  }, 15 * 60 * 1000);
}
