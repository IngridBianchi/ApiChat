import { UnauthorizedError } from "../../shared/errors/BaseError.js";

export class LogoutUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    if (!userId) {
      throw new UnauthorizedError("Usuario no autenticado");
    }

    await this.userRepository.clearRefreshTokenHash(userId);
  }
}
