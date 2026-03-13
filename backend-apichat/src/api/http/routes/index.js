import express from "express";
import authRoutes from "./authRoutes.js";
import messageRoutes from "./messageRoutes.js";
import systemRoutes from "./systemRoutes.js";

const router = express.Router();

router.use(systemRoutes);
router.use(authRoutes);
router.use(messageRoutes);

export default router;
