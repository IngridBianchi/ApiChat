import { z } from "zod";
import { container } from "../../application/container.js";
import { logger } from "../../shared/logger/index.js";
import { validateAndSanitize } from "../../shared/utils/sanitizer.js";

const { messageService } = container.services;
const { messageRepository } = container.repositories;

// Esquemas de eventos
export const socketEventSchemas = {
  'chat.room.join': z.object({
    roomId: z.string().min(1).max(100),
  }),

  'chat.message.send': z.object({
    roomId: z.string().min(1).max(100),
    message: z.string().min(1).max(2000),
    clientId: z.string().optional(),
  }),

  'chat.typing': z.object({
    roomId: z.string().min(1).max(100),
  }),

  'chat.message.react': z.object({
    messageId: z.string().min(1),
    emoji: z.string().min(1).max(10),
  }),

  'chat.message.unreact': z.object({
    messageId: z.string().min(1),
    emoji: z.string().min(1).max(10),
  }),
};

function validateSocketEvent(eventName, data) {
  const schema = socketEventSchemas[eventName];
  if (!schema) return data;
  return validateAndSanitize(data, schema);
}

export function registerSocketEvents(io, socket) {
  socket.on("chat.room.join", (payload, ack) => {
    try {
      const validated = validateSocketEvent('chat.room.join', payload);
      const { roomId } = validated;

      socket.join(roomId);
      io.to(roomId).emit("chat.user.joined", { 
        roomId, 
        userId: socket.user.id, 
        username: socket.user.username,
        timestamp: new Date().toISOString()
      });

      if (ack) ack({ status: "ok" });
    } catch (err) {
      if (ack) ack({ status: "error", code: "VALIDATION_ERROR", message: err.message });
    }
  });

  socket.on("chat.message.send", async (payload, ack) => {
    try {
      const validated = validateSocketEvent('chat.message.send', payload);
      const { roomId, message, clientId } = validated;

      const savedMessage = await messageService.send({
        roomId,
        userId: socket.user.id,
        username: socket.user.username,
        message,
      });

      io.to(roomId).emit("chat.message.received", {
        ...savedMessage,
        clientId
      });

      if (ack) ack({ status: "ok", messageId: savedMessage.id, clientId });
    } catch (err) {
      logger.error({ err }, "Error al enviar mensaje");
      socket.emit("chat.error", {
        code: "MESSAGE_ERROR",
        message: err.message || "No se pudo enviar el mensaje",
      });
      if (ack) ack({ status: "error", message: err.message });
    }
  });

  socket.on("chat.message.react", async (payload, ack) => {
    try {
      const validated = validateSocketEvent('chat.message.react', payload);
      const { messageId, emoji } = validated;

      const updatedMessage = await messageRepository.addReaction(messageId, {
        emoji,
        userId: socket.user.id,
        username: socket.user.username,
        createdAt: new Date()
      });

      io.to(updatedMessage.roomId).emit("chat.message.reaction_updated", updatedMessage);

      if (ack) ack({ status: "ok" });
    } catch (err) {
      if (ack) ack({ status: "error", message: err.message });
    }
  });

  socket.on("chat.message.unreact", async (payload, ack) => {
    try {
      const validated = validateSocketEvent('chat.message.unreact', payload);
      const { messageId, emoji } = validated;

      const updatedMessage = await messageRepository.removeReaction(messageId, socket.user.id, emoji);

      io.to(updatedMessage.roomId).emit("chat.message.reaction_updated", updatedMessage);

      if (ack) ack({ status: "ok" });
    } catch (err) {
      if (ack) ack({ status: "error", message: err.message });
    }
  });

  socket.on("chat.typing", (payload) => {
    try {
      const validated = validateSocketEvent('chat.typing', payload);
      socket.to(validated.roomId).emit("chat.user.typing", {
        roomId: validated.roomId,
        userId: socket.user.id,
        username: socket.user.username
      });
    } catch (err) {
      // Ignorar errores de tipado silenciosamente
    }
  });
}
