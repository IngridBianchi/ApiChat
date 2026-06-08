import jwt from 'jsonwebtoken';
import { config } from "../../shared/config/index.js";
import { logger } from "../../shared/logger/index.js";

export class SecretManager {
  constructor() {
    this.secrets = {
      current: {
        id: process.env.JWT_SECRET_ID || 'v1',
        value: config.jwtSecret,
        refreshValue: config.jwtRefreshSecret,
        createdAt: Date.now(),
        expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 días
      },
      previous: null,
    };
  }

  getCurrentSecret() {
    return this.secrets.current.value;
  }

  getRefreshSecret() {
    return this.secrets.current.refreshValue;
  }

  verifyTokenWithRotation(token, isRefresh = false) {
    const secret = isRefresh ? this.getRefreshSecret() : this.getCurrentSecret();
    try {
      return jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch (err) {
      // Si falla, intentar con secret anterior si existe
      if (this.secrets.previous) {
        const prevSecret = isRefresh ? this.secrets.previous.refreshValue : this.secrets.previous.value;
        try {
          return jwt.verify(token, prevSecret, { algorithms: ['HS256'] });
        } catch (prevErr) {
          throw err; // Lanzar error original
        }
      }
      throw err;
    }
  }

  rotateSecrets(newSecret, newRefreshSecret) {
    this.secrets.previous = this.secrets.current;
    this.secrets.current = {
      id: `v${parseInt(this.secrets.current.id.substring(1)) + 1}`,
      value: newSecret,
      refreshValue: newRefreshSecret,
      createdAt: Date.now(),
      expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000),
    };

    logger.info({ secretId: this.secrets.current.id }, "Secrets rotated");
  }
}

export const secretManager = new SecretManager();
