import { config } from "../config/index.js";
import { logger } from "../logger/index.js";
import { BaseError, ValidationError } from "./BaseError.js";
import { ApiResponse } from "../utils/response.js";

function normalizeError(err) {
  if (err instanceof BaseError) {
    return err;
  }

  // Handle Mongoose/Mongo errors
  if (err?.name === "ValidationError") {
    return new ValidationError([{ field: "database", issue: err.message }]);
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

  const message = shouldHideMessage
    ? "Error interno del servidor"
    : normalizedError.message || "Error interno del servidor";
  
  const code = normalizedError.code || "INTERNAL_ERROR";
  const details = isServerError ? undefined : normalizedError.details || undefined;

  logger.error({ requestId: req.requestId, err: normalizedError }, "Error capturado");
  
  // Use res.error if available (added by responseMiddleware)
  if (res.error) {
    return res.error(message, code, details, status);
  }

  // Fallback if middleware not applied
  res.status(status).json(ApiResponse.error(message, code, details, status));
}
