import mongoose from "mongoose";
import { logger } from "../../shared/logger/index.js";
import { config } from "../../shared/config/index.js";

export async function connectMongo() {
  try {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 600000,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(config.mongoUri, options);
    
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB conectado');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'Error en conexión MongoDB');
    });

    logger.info("MongoDB configurado correctamente con Connection Pooling");
  } catch (err) {
    logger.error({ err }, "Error fatal al conectar con MongoDB");
    process.exit(1);
  }
}

export async function disconnectMongo() {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB desconectado correctamente');
  } catch (err) {
    logger.error({ err }, 'Error al desconectar MongoDB');
  }
}
