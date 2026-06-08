import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { config } from "../../../shared/config/index.js";
import { TooManyRequestsError } from "../../../shared/errors/BaseError.js";
import { createClient } from "redis";
import { logger } from "../../../shared/logger/index.js";

let redisClient = null;
if (config.redisUrl) {
  redisClient = createClient({ url: config.redisUrl });
  redisClient.connect().catch(err => logger.error({ err }, "Error connecting Redis for Rate Limit"));
}

export function createRateLimitMiddleware({ windowMs, max, message, keyGenerator }) {
  const options = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res, next) => {
      next(new TooManyRequestsError(message || "Límite de intentos excedido"));
    }
  };

  if (redisClient) {
    options.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rate-limit:',
    });
  }

  return rateLimit(options);
}
