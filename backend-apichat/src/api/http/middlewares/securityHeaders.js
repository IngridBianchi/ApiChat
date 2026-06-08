import helmet from 'helmet';

export function createSecurityHeadersMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000", "ws://localhost:3000", "wss://localhost:3000"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  });
}
