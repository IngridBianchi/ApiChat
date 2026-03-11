import { config } from "../config/index.js";
import { logger } from "../logger/index.js";

export function errorHandler(err, req, res, next) {
  void next;

  const status = err.statusCode || 500;
  const isServerError = status >= 500;
  const shouldHideMessage = config.env === "production" && isServerError;

  const response = {
    code: err.code || "INTERNAL_ERROR",
    message: shouldHideMessage ? "Error interno del servidor" : err.message || "Error interno del servidor",
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    details: isServerError ? undefined : err.details || undefined,
  };

  logger.error({ requestId: req.requestId, err }, "Error capturado");
  res.status(status).json(response);
}