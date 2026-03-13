import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { config } from "../../shared/config/index.js";
import { logger } from "../../shared/logger/index.js";

const redisHealth = {
  enabled: false,
  connected: false,
  error: null,
};

function setRedisHealth(next) {
  redisHealth.enabled = next.enabled;
  redisHealth.connected = next.connected;
  redisHealth.error = next.error || null;
}

export function getRedisHealth() {
  if (!redisHealth.enabled) {
    return { enabled: false, status: "disabled", error: null };
  }

  return {
    enabled: true,
    status: redisHealth.connected ? "up" : "down",
    error: redisHealth.error,
  };
}

export async function setupSocketRedisAdapter(io) {
  if (!config.redisUrl) {
    setRedisHealth({ enabled: false, connected: false, error: null });
    logger.warn("Socket.IO Redis adapter deshabilitado: REDIS_URL no configurada");
    return async () => {};
  }

  const pubClient = createClient({ url: config.redisUrl });
  const subClient = pubClient.duplicate();

  const onError = (err) => {
    setRedisHealth({ enabled: true, connected: false, error: err?.message || "redis_error" });
    logger.error({ err }, "Error en clientes Redis para Socket.IO");
  };

  pubClient.on("error", onError);
  subClient.on("error", onError);

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));
  setRedisHealth({ enabled: true, connected: true, error: null });
  logger.info("Socket.IO Redis adapter habilitado");

  return async () => {
    await Promise.allSettled([pubClient.quit(), subClient.quit()]);
    setRedisHealth({ enabled: true, connected: false, error: null });
  };
}
