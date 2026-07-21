import { createHmac } from "node:crypto";
import { productionControlsRequired } from "@/lib/config/runtime";

export interface RateLimitResult {
  allowed: boolean;
  configured: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  reason?: "not_configured" | "unavailable" | "limited";
}

const UPSTASH_HOST_PATTERN = /^(?:[a-z0-9-]+\.)*upstash\.io$/i;

function trustedUpstashMultiExecUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    const parsed = new URL(value.trim());
    if (
      parsed.protocol !== "https:"
      || parsed.username
      || parsed.password
      || parsed.port
      || !UPSTASH_HOST_PATTERN.test(parsed.hostname)
    ) return undefined;

    return `https://${parsed.hostname}/multi-exec`;
  } catch {
    return undefined;
  }
}

function boundedInteger(value: string | undefined, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value || fallback);
  return Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), minimum), maximum) : fallback;
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    || request.headers.get("x-forwarded-for")
    || request.headers.get("x-real-ip")
    || "address-unavailable";
  return forwarded.split(",")[0]?.trim() || "address-unavailable";
}

export async function checkChatRateLimit(request: Request): Promise<RateLimitResult> {
  const limit = boundedInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 12, 2, 120);
  const windowSeconds = boundedInteger(process.env.RATE_LIMIT_WINDOW_SECONDS, 60, 10, 3_600);
  const retryAfterSeconds = windowSeconds - (Math.floor(Date.now() / 1_000) % windowSeconds);
  const redisUrl = trustedUpstashMultiExecUrl(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL);
  const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)?.trim();
  const hashSecret = process.env.RATE_LIMIT_HASH_SECRET?.trim();
  const required = productionControlsRequired();

  if (!redisUrl || !redisToken || !hashSecret || hashSecret.length < 32) {
    return {
      allowed: !required,
      configured: false,
      limit,
      remaining: required ? 0 : limit,
      retryAfterSeconds,
      reason: required ? "not_configured" : undefined,
    };
  }

  const bucket = Math.floor(Date.now() / (windowSeconds * 1_000));
  const addressHash = createHmac("sha256", hashSecret).update(clientAddress(request)).digest("hex");
  const key = `firststep:chat:${bucket}:${addressHash}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_800);

  try {
    // redisUrl is reduced to an HTTPS origin on the Upstash-owned domain above.
    // lgtm[js/request-forgery]
    const response = await fetch(redisUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds + 5],
      ]),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Rate limit provider unavailable");
    const payload = await response.json() as Array<{ result?: unknown }>;
    const count = Number(payload[0]?.result);
    if (!Number.isFinite(count)) throw new Error("Invalid rate limit response");

    return {
      allowed: count <= limit,
      configured: true,
      limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds,
      reason: count > limit ? "limited" : undefined,
    };
  } catch {
    return {
      allowed: !required,
      configured: true,
      limit,
      remaining: required ? 0 : limit,
      retryAfterSeconds,
      reason: required ? "unavailable" : undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
}
