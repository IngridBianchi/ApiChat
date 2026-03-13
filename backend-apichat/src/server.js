import http from "node:http";
import { createApp } from "./app.js";
import { initChatSocket } from "./api/socket/chatSocket.js";
import { connectMongo } from "./infrastructure/db/mongoConnection.js";
import { config } from "./shared/config/index.js";
import { logger } from "./shared/logger/index.js";

async function bootstrap() {
  await connectMongo();

  const app = createApp();
  const server = http.createServer(app);
  await initChatSocket(server);

  server.listen(config.port, () => {
    logger.info({ port: config.port }, "Servidor iniciado");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Fallo fatal al iniciar la aplicación");
  process.exit(1);
});
