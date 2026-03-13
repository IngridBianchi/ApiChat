import { container } from "../../../application/container.js";
import { UnauthorizedError } from "../../../shared/errors/BaseError.js";

const { tokenService } = container.security;

export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next(new UnauthorizedError("Token requerido"));
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new UnauthorizedError("Formato de Authorization inválido"));
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return next(new UnauthorizedError("Token inválido o expirado"));
  }
}
