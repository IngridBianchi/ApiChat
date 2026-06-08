import express from "express";
import cookieParser from "cookie-parser";
import routes from "./api/http/routes/index.js";
import { config } from "./shared/config/index.js";
import { errorHandler } from "./shared/errors/errorHandler.js";
import { requestLogger } from "./shared/logger/index.js";
import { NotFoundError } from "./shared/errors/BaseError.js";
import { observeRequestDuration } from "./shared/telemetry/index.js";
import { createSecurityHeadersMiddleware } from "./api/http/middlewares/securityHeaders.js";
import { responseMiddleware } from "./shared/utils/response.js";

function createCorsMiddleware() {
  return (req, res, next) => {
    const origin = req.headers.origin;

    if (origin && config.corsAllowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-request-id");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  };
}

export function createApp() {
  const app = express();

  app.use(createSecurityHeadersMiddleware());
  app.use(cookieParser());
  app.use(responseMiddleware);
  app.use(createCorsMiddleware());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);
  app.use(observeRequestDuration);

  app.use(routes);

  app.use((req, res, next) => {
    void res;
    next(new NotFoundError("Endpoint no encontrado"));
  });

  app.use(errorHandler);

  return app;
}
