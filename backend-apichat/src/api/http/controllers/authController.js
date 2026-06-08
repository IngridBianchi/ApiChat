import { container } from "../../../application/container.js";
import { securityLogger } from "../../../shared/logger/securityLogger.js";

const { authService } = container.services;

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.success(result, 'Usuario registrado', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  const { username } = req.body;
  const ip = req.ip;
  const userAgent = req.get("user-agent");

  try {
    const result = await authService.login(req.body);
    securityLogger.logAuthAttempt(username, true, ip, userAgent);
    res.success(result, 'Login exitoso');
  } catch (err) {
    securityLogger.logAuthAttempt(username, false, ip, userAgent);
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.success(tokens, 'Token refrescado');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.user?.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
