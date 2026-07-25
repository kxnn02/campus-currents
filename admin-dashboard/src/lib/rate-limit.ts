/**
 * Simple in-memory rate limiter for admin login attempts.
 * In production, consider using Redis or a dedicated rate limiting service.
 *
 * This protects against brute-force login attacks by limiting attempts
 * per IP address to MAX_ATTEMPTS within WINDOW_MS.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minute lockout after max attempts

// Cleanup old entries every 30 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstAttempt > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, 30 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterMs: number | null;
}

/**
 * Check if a login attempt is allowed for the given identifier (IP or email).
 * Call this BEFORE processing the login.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterMs: null };
  }

  // Check if locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMs: entry.lockedUntil - now,
    };
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > WINDOW_MS) {
    store.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterMs: null };
  }

  // Check attempt count
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMs: LOCKOUT_MS,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - entry.attempts,
    retryAfterMs: null,
  };
}

/**
 * Record a failed login attempt for the given identifier.
 */
export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry) {
    store.set(identifier, { attempts: 1, firstAttempt: now, lockedUntil: null });
    return;
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > WINDOW_MS) {
    store.set(identifier, { attempts: 1, firstAttempt: now, lockedUntil: null });
    return;
  }

  entry.attempts += 1;

  // Lock out if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
}

/**
 * Clear rate limit for an identifier (call on successful login).
 */
export function clearRateLimit(identifier: string): void {
  store.delete(identifier);
}
