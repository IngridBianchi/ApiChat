import express from "express";
import { history } from "../controllers/messageController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { historySchema } from "../dto/messageDto.js";

const router = express.Router();

router.get("/v1/messages/history", authMiddleware, validate(historySchema, "query"), history);

export default router;

