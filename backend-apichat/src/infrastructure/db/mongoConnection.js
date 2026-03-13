import mongoose from "mongoose";
import { logger } from "../../shared/logger/index.js";
import { config } from "../../shared/config/index.js";

export async function connectMongo() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info("MongoDB conectado correctamente");
  } catch (err) {
    logger.error({ err }, "Error al conectar con MongoDB");
    process.exit(1); // Falla rápida si no hay DB
  }
}
