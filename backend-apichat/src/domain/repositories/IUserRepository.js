export class IUserRepository {
  async create(userEntity) {
    throw new Error("Método no implementado");
  }

  async findByUsername(username) {
    throw new Error("Método no implementado");
  }

  async findByUsernameWithCredentials(username) {
    throw new Error("Método no implementado");
  }

  async findById(id) {
    throw new Error("Método no implementado");
  }

  async findByIdWithRefreshToken(id) {
    throw new Error("Método no implementado");
  }

  async saveRefreshTokenHash(userId, refreshTokenHash) {
    throw new Error("Método no implementado");
  }

  async clearRefreshTokenHash(userId) {
    throw new Error("Método no implementado");
  }
}

