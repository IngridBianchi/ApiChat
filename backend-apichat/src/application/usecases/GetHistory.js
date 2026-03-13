import { ValidationError } from "../../shared/errors/BaseError.js";

export class GetHistory {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ roomId, cursor, limit }) {
    if (!roomId) {
      throw new ValidationError([{ field: "roomId", issue: "roomId es requerido" }]);
    }

    return this.messageRepository.findByRoom(roomId, cursor, limit);
  }
}
