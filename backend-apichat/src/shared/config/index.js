import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

const port = Number.parseInt(process.env.PORT || "3000", 10);
if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port,
  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL || "",
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || "15m",
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  authRateLimitWindowMs: Number.parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "900000", 10),
  authRateLimitMax: Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX || "10", 10),
};