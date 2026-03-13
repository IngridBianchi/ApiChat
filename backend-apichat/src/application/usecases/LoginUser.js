import { UnauthorizedError } from "../../shared/errors/BaseError.js";

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
  };
}

export class LoginUser {
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ username, password }) {
    const user = await this.userRepository.findByUsernameWithCredentials(username);
    if (!user) throw new UnauthorizedError("Credenciales inválidas");

    const valid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Credenciales inválidas");

    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      username: user.username,
    });
    const refreshTokenHash = this.tokenService.hashRefreshToken(tokens.refreshToken);
    await this.userRepository.saveRefreshTokenHash(user.id, refreshTokenHash);

    return { user: toPublicUser(user), tokens };
  }
}
