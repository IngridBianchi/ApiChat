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

// Ejemplo de error específico
export class ValidationError extends BaseError {
  constructor(details) {
    super("Payload invalido", 422, "VALIDATION_ERROR", details);
  }
}