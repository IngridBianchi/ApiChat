import { config } from "../config/index.js";
import { logger } from "../logger/index.js";
import { BaseError, ValidationError } from "./BaseError.js";

function normalizeError(err) {
  if (err instanceof BaseError) {
    return err;
  }

  if (err?.name === "ZodError") {
    return new ValidationError(
      (err.issues || []).map((issue) => ({
        field: issue.path?.join(".") || "body",
        issue: issue.message,
      }))
    );
  }

  return err;
}

export function errorHandler(err, req, res, next) {
  void next;

  const normalizedError = normalizeError(err);

  const status = normalizedError.statusCode || 500;
  const isServerError = status >= 500;
  const shouldHideMessage = config.env === "production" && isServerError;

  const response = {
    code: normalizedError.code || "INTERNAL_ERROR",
    message: shouldHideMessage
      ? "Error interno del servidor"
      : normalizedError.message || "Error interno del servidor",
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    details: isServerError ? undefined : normalizedError.details || undefined,
  };

  logger.error({ requestId: req.requestId, err: normalizedError }, "Error capturado");
  res.status(status).json(response);
}