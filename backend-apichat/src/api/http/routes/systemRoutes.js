import express from "express";
import mongoose from "mongoose";
import client from "prom-client";
import "../../../shared/telemetry/index.js";
import { getRedisHealth } from "../../../infrastructure/cache/socketRedisAdapter.js";
import { createCsrfProtection } from "../middlewares/csrfProtection.js";

const router = express.Router();
const csrfProtection = createCsrfProtection();

router.get("/v1/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/ready", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const database = dbState === 1 ? "up" : "down";
  const redis = getRedisHealth();
  const redisDependency = redis.enabled ? redis.status : "disabled";

  if (database !== "up" || (redis.enabled && redis.status !== "up")) {
    return res.status(503).json({
      status: "not_ready",
      dependencies: { database, redis: redisDependency },
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: "ready",
    dependencies: { database, redis: redisDependency },
    timestamp: new Date().toISOString(),
  });
});

router.get("/metrics", async (req, res, next) => {
  try {
    const metrics = await client.register.metrics();
    res.setHeader("Content-Type", client.register.contentType);
    res.status(200).send(metrics);
  } catch (err) {
    next(err);
  }
});

export default router;
