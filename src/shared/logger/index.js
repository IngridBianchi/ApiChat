import pino from "pino";
import { randomUUID } from "node:crypto";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: null, // evita metadata innecesaria
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Middleware para requestId
export function requestLogger(req, res, next) {
  const requestIdHeader = req.headers["x-request-id"];
  const requestId = Array.isArray(requestIdHeader)
    ? requestIdHeader[0]
    : requestIdHeader || randomUUID();

  req.requestId = requestId;
  req.logger = logger.child({ requestId });
  res.setHeader("x-request-id", requestId);

  req.logger.info({ path: req.path, method: req.method }, "Incoming request");
  next();
}