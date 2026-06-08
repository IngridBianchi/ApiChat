import { logger } from "./index.js";

export const securityLogger = {
  logAuthAttempt(username, success, ip, userAgent) {
    logger.info(
      {
        event: 'AUTH_ATTEMPT',
        username,
        success,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      },
      `Authentication attempt: ${success ? 'SUCCESS' : 'FAILED'}`
    );
  },

  logTokenGeneration(userId, type) {
    logger.info(
      {
        event: 'TOKEN_GENERATED',
        userId,
        tokenType: type,
        timestamp: new Date().toISOString(),
      },
      `Token ${type} generated`
    );
  },

  logUnauthorizedAccess(userId, endpoint, reason) {
    logger.warn(
      {
        event: 'UNAUTHORIZED_ACCESS',
        userId,
        endpoint,
        reason,
        timestamp: new Date().toISOString(),
      },
      'Unauthorized access attempt'
    );
  },

  logSuspiciousActivity(description, metadata) {
    logger.error(
      {
        event: 'SUSPICIOUS_ACTIVITY',
        description,
        ...metadata,
        timestamp: new Date().toISOString(),
      },
      'Suspicious activity detected'
    );
  },
};
