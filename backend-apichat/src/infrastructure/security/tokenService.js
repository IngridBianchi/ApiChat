import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../../shared/config/index.js";
import { UnauthorizedError } from "../../shared/errors/BaseError.js";

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

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiration,
  });
}

function signRefreshToken(subject) {
  const payload = {
    sub: subject.id,
    typ: "refresh",
    username: subject.username,
  };

  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiration,
  });
}

function decodeToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new UnauthorizedError("Token inválido o expirado");
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
    const payload = decodeToken(token, config.jwtSecret);

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
    const payload = decodeToken(token, config.jwtRefreshSecret);

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
