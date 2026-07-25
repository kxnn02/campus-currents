"use server";

import { headers } from "next/headers";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/rate-limit";

/**
 * Server-side rate limit check for login attempts.
 * Returns whether the attempt is allowed and remaining info.
 */
export async function checkLoginRateLimit(): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number | null;
}> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const result = checkRateLimit(ip);

  return {
    allowed: result.allowed,
    remainingAttempts: result.remainingAttempts,
    retryAfterSeconds: result.retryAfterMs ? Math.ceil(result.retryAfterMs / 1000) : null,
  };
}

/**
 * Record a failed login attempt server-side.
 */
export async function recordLoginFailure(): Promise<void> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  recordFailedAttempt(ip);
}

/**
 * Clear rate limit on successful login.
 */
export async function recordLoginSuccess(): Promise<void> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  clearRateLimit(ip);
}
