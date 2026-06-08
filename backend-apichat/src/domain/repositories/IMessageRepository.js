export class IMessageRepository {
  async create(messageEntity) {
    throw new Error("Método no implementado");
  }

  async findByRoom(roomId, cursor, limit) {
    throw new Error("Método no implementado");
  }

  async addReaction(messageId, reaction) {
    throw new Error("Método no implementado");
  }

  async removeReaction(messageId, userId, emoji) {
    throw new Error("Método no implementado");
  }
}
