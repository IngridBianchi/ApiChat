import { createClient } from "redis";
import { config } from "../../shared/config/index.js";
import { logger } from "../../shared/logger/index.js";

let redisClient = null;

export async function getRedisClient() {
  if (redisClient) return redisClient;

  if (!config.redisUrl) {
    logger.warn("Redis URL no configurada, usando store en memoria para rate limiting");
    return null;
  }

  redisClient = createClient({ url: config.redisUrl });

  redisClient.on("error", (err) => {
    logger.error({ err }, "Error en cliente Redis");
  });

  await redisClient.connect();
  logger.info("Cliente Redis conectado");

  return redisClient;
}
