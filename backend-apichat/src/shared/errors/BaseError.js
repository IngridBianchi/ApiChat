export class BaseError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends BaseError {
  constructor(message = "Request inválido", details) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "No autenticado", details) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "No autorizado", details) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Recurso no encontrado", details) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflicto de estado", details) {
    super(message, 409, "CONFLICT", details);
  }
}

export class ValidationError extends BaseError {
  constructor(details, message = "Payload inválido") {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class TooManyRequestsError extends BaseError {
  constructor(message = "Demasiadas solicitudes", details) {
    super(message, 429, "TOO_MANY_REQUESTS", details);
  }
}