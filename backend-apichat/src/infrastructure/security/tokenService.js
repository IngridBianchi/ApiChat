import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../../shared/config/index.js";
import { UnauthorizedError } from "../../shared/errors/BaseError.js";
import { secretManager } from "./secretManager.js";

function normalizeSubject(subject) {
  if (typeof subject === "string" || typeof subject === "number") {
    return { id: String(subject), username: undefined };
  }

  if (subject && typeof subject === "object" && subject.id) {
    return {
      id: String(subject.id),
      username: subject.username ? String(subject.username) : undefined,
    };
  }

  throw new Error("Subject inválido para generar token");
}

function signAccessToken(subject) {
  const payload = {
    sub: subject.id,
    typ: "access",
    username: subject.username,
  };

  return jwt.sign(payload, secretManager.getCurrentSecret(), {
    expiresIn: config.jwtExpiration,
    algorithm: 'HS256',
  });
}

function signRefreshToken(subject) {
  const payload = {
    sub: subject.id,
    typ: "refresh",
    username: subject.username,
  };

  return jwt.sign(payload, secretManager.getRefreshSecret(), {
    expiresIn: config.jwtRefreshExpiration,
    algorithm: 'HS256',
  });
}

function decodeToken(token, isRefresh = false) {
  try {
    return secretManager.verifyTokenWithRotation(token, isRefresh);
  } catch (err) {
    throw new UnauthorizedError(`Token inválido: ${err.message}`);
  }
}

export const tokenService = {
  generateTokenPair(subjectInput) {
    const subject = normalizeSubject(subjectInput);

    return {
      accessToken: signAccessToken(subject),
      refreshToken: signRefreshToken(subject),
      tokenType: "Bearer",
      expiresIn: 900,
    };
  },

  verifyAccessToken(token) {
    const payload = decodeToken(token, false);

    if (payload.typ !== "access") {
      throw new UnauthorizedError("Tipo de token inválido");
    }

    return {
      id: payload.sub,
      sub: payload.sub,
      username: payload.username,
    };
  },

  verifyRefreshToken(token) {
    const payload = decodeToken(token, true);

    if (payload.typ !== "refresh") {
      throw new UnauthorizedError("Tipo de token inválido");
    }

    return {
      id: payload.sub,
      sub: payload.sub,
      username: payload.username,
    };
  },

  hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  },
};
