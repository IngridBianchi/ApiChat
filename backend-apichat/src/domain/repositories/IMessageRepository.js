export class IMessageRepository {
  async create(messageEntity) {
    throw new Error("Método no implementado");
  }

  async findByRoom(roomId, cursor, limit) {
    throw new Error("Método no implementado");
  }
}
