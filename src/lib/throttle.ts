const WINDOW_MS = 60_000;
const MAX_BUCKETS = 8;

const LIMITS = {
  login: 20,
  sample: 30,
  invite: 20,
  verify: 12,
  sheet: 240,
} as const;

export type ThrottleBucket = keyof typeof LIMITS;

const buckets = new Map<ThrottleBucket, { count: number; resetAt: number }>();

function evict(now: number) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

export function allow(bucket: ThrottleBucket, now = Date.now()) {
  evict(now);
  const current = buckets.get(bucket);
  if (!current || current.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS && !buckets.has(bucket)) return false;
    buckets.set(bucket, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= LIMITS[bucket]) return false;
  current.count += 1;
  return true;
}

export function resetThrottle() {
  buckets.clear();
}
