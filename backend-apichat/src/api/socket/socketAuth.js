import { container } from "../../application/container.js";
import { logger } from "../../shared/logger/index.js";

const { tokenService } = container.security;

export async function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;

  // Validaciones básicas
  if (!token) {
    return next(new Error("Authentication error: token required"));
  }

  if (typeof token !== 'string' || token.length > 2000) {
    logger.warn({ socketId: socket.id }, "Token inválido detectado");
    return next(new Error("Authentication error: invalid token format"));
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    
    // Validaciones adicionales
    if (!payload.id || !payload.username) {
      return next(new Error("Authentication error: invalid token payload"));
    }

    // Asignar usuario al socket
    socket.user = {
      id: payload.id,
      username: payload.username,
      connectedAt: Date.now(),
    };

    logger.info(
      { userId: payload.id, socketId: socket.id },
      "WebSocket authenticated"
    );

    next();
  } catch (err) {
    logger.error(
      { socketId: socket.id, err },
      "WebSocket authentication failed"
    );
    next(new Error(`Authentication error: ${err.message}`));
  }
}
