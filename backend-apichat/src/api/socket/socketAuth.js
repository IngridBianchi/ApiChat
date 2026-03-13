import { container } from "../../application/container.js";

const { tokenService } = container.security;

export function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Token requerido en handshake"));
    }

    const payload = tokenService.verifyAccessToken(token);
    socket.user = payload; // adjunta info del usuario al socket
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
}
