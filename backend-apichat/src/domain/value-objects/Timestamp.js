export class Timestamp {
  constructor(value = new Date()) {
    if (!(value instanceof Date)) {
      throw new Error("Timestamp inválido");
    }
    this.value = value;
  }
}
