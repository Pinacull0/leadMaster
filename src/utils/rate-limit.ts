type AttemptState = {
  firstAttemptAt: number;
  attempts: number;
  blockedUntil: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LIMIT_MAP = new Map<string, AttemptState>();

function cleanup(now: number) {
  for (const [key, value] of LIMIT_MAP.entries()) {
    const stale = now - value.firstAttemptAt > WINDOW_MS && value.blockedUntil < now;
    if (stale) LIMIT_MAP.delete(key);
  }
}

export function loginRateLimitKey(ip: string, email: string) {
  return `${ip}:${email.toLowerCase()}`;
}

export function canAttemptLogin(key: string) {
  const now = Date.now();
  cleanup(now);

  const state = LIMIT_MAP.get(key);
  if (!state) {
    return { allowed: true, retryAfterSec: 0 };
  }

  if (state.blockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((state.blockedUntil - now) / 1000) };
  }

  return { allowed: true, retryAfterSec: 0 };
}

export function registerFailedLogin(key: string) {
  const now = Date.now();
  const current = LIMIT_MAP.get(key);

  if (!current || now - current.firstAttemptAt > WINDOW_MS) {
    LIMIT_MAP.set(key, {
      firstAttemptAt: now,
      attempts: 1,
      blockedUntil: 0,
    });
    return;
  }

  const attempts = current.attempts + 1;
  const blockedUntil = attempts >= MAX_ATTEMPTS ? now + BLOCK_MS : 0;
  LIMIT_MAP.set(key, {
    firstAttemptAt: current.firstAttemptAt,
    attempts,
    blockedUntil,
  });
}

export function clearFailedLogins(key: string) {
  LIMIT_MAP.delete(key);
}
