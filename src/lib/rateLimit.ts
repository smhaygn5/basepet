import "server-only";

/**
 * Basit sabit-pencere rate limiter (plan §3.5 / §7.5).
 * - Upstash Redis REST env'leri varsa onu kullanır (dağıtık, serverless uyumlu).
 * - Yoksa in-memory fallback (tek instance; yerel/dev için yeterli).
 *
 * Not: in-memory fallback serverless'te instance başına ayrıdır; üretimde Upstash şart.
 */
const memStore = new Map<string, { count: number; resetAt: number }>();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
}

async function upstash(command: string[]): Promise<unknown> {
  const res = await fetch(`${UPSTASH_URL}/${command.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: unknown };
  return json.result;
}

/**
 * @param key benzersiz anahtar (ör. `verify:<ip>` veya `pm:<wallet>`)
 * @param limit pencere başına izin verilen istek
 * @param windowSec pencere süresi (saniye)
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const count = Number(await upstash(["INCR", key]));
    if (count === 1) await upstash(["EXPIRE", key, String(windowSec)]);
    return { success: count <= limit, remaining: Math.max(0, limit - count), limit };
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { success: true, remaining: limit - 1, limit };
  }
  entry.count += 1;
  return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count), limit };
}

/** İstekten kaba IP çıkarımı (proxy header'ları). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
