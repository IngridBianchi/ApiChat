import { TooManyRequestsError } from "../../../shared/errors/BaseError.js";

// In-memory limiter for MVP. Replace with Redis-backed store for horizontal scaling.
function createMemoryLimiter({ windowMs, max }) {
  const buckets = new Map();

  return (key) => {
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.expiresAt <= now) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return { allowed: true, remaining: max - 1 };
    }

    current.count += 1;
    buckets.set(key, current);

    const remaining = Math.max(0, max - current.count);
    return { allowed: current.count <= max, remaining };
  };
}

export function createRateLimitMiddleware({ windowMs, max, keyGenerator }) {
  const check = createMemoryLimiter({ windowMs, max });

  return (req, res, next) => {
    const key = keyGenerator(req);
    const result = check(key);

    res.setHeader("x-ratelimit-limit", String(max));
    res.setHeader("x-ratelimit-remaining", String(result.remaining));

    if (!result.allowed) {
      return next(new TooManyRequestsError("Límite de intentos excedido"));
    }

    next();
  };
}
