import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js";
import { registerSocketEvents } from "./socketEvents.js";
import { logger } from "../../shared/logger/index.js";
import { config } from "../../shared/config/index.js";
import { setupSocketRedisAdapter } from "../../infrastructure/cache/socketRedisAdapter.js";

export async function initChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsAllowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  const closeRedisAdapter = await setupSocketRedisAdapter(io);

  io.use(socketAuth);

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Nuevo cliente conectado");
    registerSocketEvents(io, socket);

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Cliente desconectado");

      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          io.to(roomId).emit("chat.user.left", {
            roomId,
            userId: socket.user?.id,
            username: socket.user?.username,
          });
        }
      }
    });
  });

  return { io, closeRedisAdapter };
}
