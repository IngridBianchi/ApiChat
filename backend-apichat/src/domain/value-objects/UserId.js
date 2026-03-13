export class UserId {
  constructor(value) {
    if (!value || typeof value !== "string") {
      throw new Error("UserId inválido");
    }
    this.value = value;
  }
}
