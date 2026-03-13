import { container } from "../../application/container.js";
import { logger } from "../../shared/logger/index.js";

const { messageService } = container.services;

export function registerSocketEvents(io, socket) {
  socket.on("chat.room.join", (payload, ack) => {
    const roomId = payload?.roomId;
    if (!roomId) {
      if (ack) ack({ status: "error", code: "VALIDATION_ERROR" });
      return;
    }

    socket.join(roomId);
    io.to(roomId).emit("chat.user.joined", { roomId, userId: socket.user.id, username: socket.user.username });
    if (ack) ack({ status: "ok" });
  });

  // Evento: enviar mensaje
  socket.on("chat.message.send", async (payload, ack) => {
    try {
      const roomId = payload?.roomId;
      if (!roomId || !payload?.message) {
        if (ack) ack({ status: "error", code: "VALIDATION_ERROR" });
        return;
      }

      const savedMessage = await messageService.send({
        roomId,
        userId: socket.user.id,
        username: socket.user.username,
        message: payload.message,
      });

      io.to(roomId).emit("chat.message.received", savedMessage);

      if (ack) ack({ status: "ok", messageId: savedMessage.id });
    } catch (err) {
      logger.error({ err }, "Error al enviar mensaje");
      socket.emit("chat.error", {
        code: "MESSAGE_ERROR",
        message: "No se pudo enviar el mensaje",
      });
      if (ack) ack({ status: "error" });
    }
  });
}
