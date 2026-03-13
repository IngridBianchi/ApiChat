import { Message } from "../../domain/entities/Message.js";
import { ValidationError } from "../../shared/errors/BaseError.js";

export class SendMessage {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ roomId, userId, username, message }) {
    if (!roomId || !userId || !username || !message) {
      throw new ValidationError([
        { field: "message", issue: "roomId, userId, username y message son requeridos" },
      ]);
    }

    const messageEntity = new Message({ roomId, userId, username, message });
    return this.messageRepository.create(messageEntity);
  }
}
