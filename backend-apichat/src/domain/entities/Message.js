export class Message {
  constructor({ id, roomId, userId, username, message, createdAt }) {
    if (!roomId || !userId || !username) {
      throw new Error("roomId, userId y username son requeridos");
    }

    if (!message || typeof message !== "string") {
      throw new Error("message inválido");
    }

    const normalizedRoomId = String(roomId).trim();
    const normalizedUserId = String(userId).trim();
    const normalizedUsername = String(username).trim();
    const normalizedMessage = message.trim();

    if (!normalizedRoomId || !normalizedUserId || !normalizedUsername || !normalizedMessage) {
      throw new Error("Campos de mensaje inválidos");
    }

    this.id = id;
    this.roomId = normalizedRoomId;
    this.userId = normalizedUserId;
    this.username = normalizedUsername;
    this.message = normalizedMessage;
    this.createdAt = createdAt || new Date();
  }
}
