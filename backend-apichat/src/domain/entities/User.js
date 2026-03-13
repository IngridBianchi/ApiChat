export class User {
  constructor({ id, username, passwordHash }) {
    if (!username || typeof username !== "string") {
      throw new Error("username inválido");
    }

    if (!passwordHash || typeof passwordHash !== "string") {
      throw new Error("passwordHash inválido");
    }

    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      throw new Error("username inválido");
    }

    this.id = id;
    this.username = normalizedUsername;
    this.passwordHash = passwordHash;
  }
}

