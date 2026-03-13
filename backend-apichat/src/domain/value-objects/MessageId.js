export class MessageId {
  constructor(value) {
    if (!value || typeof value !== "string") {
      throw new Error("MessageId inválido");
    }
    this.value = value;
  }
}
