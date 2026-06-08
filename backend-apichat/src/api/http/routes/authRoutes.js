import express from "express";
import { register, login, refresh, logout } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { createRateLimitMiddleware } from "../middlewares/rateLimitMiddleware.js";
import { loginSchema, refreshSchema, registerSchema } from "../dto/authDto.js";
import { config } from "../../../shared/config/index.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const authRateLimit = createRateLimitMiddleware({
	windowMs: config.authRateLimitWindowMs,
	max: config.authRateLimitMax,
});

router.post("/v1/auth/register", authRateLimit, validate(registerSchema), register);
router.post("/v1/auth/login", authRateLimit, validate(loginSchema), login);
router.post("/v1/auth/refresh", authRateLimit, validate(refreshSchema), refresh);
router.post("/v1/auth/logout", authMiddleware, logout);

export default router;
