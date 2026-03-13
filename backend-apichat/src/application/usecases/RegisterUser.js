import { User } from "../../domain/entities/User.js";
import { ConflictError } from "../../shared/errors/BaseError.js";

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
  };
}

export class RegisterUser {
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ username, password }) {
    const existing = await this.userRepository.findByUsername(username);
    if (existing) {
      throw new ConflictError("Usuario ya existe");
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const userEntity = new User({ username, passwordHash });
    const savedUser = await this.userRepository.create(userEntity);

    const tokens = this.tokenService.generateTokenPair({
      id: savedUser.id,
      username: savedUser.username,
    });
    const refreshTokenHash = this.tokenService.hashRefreshToken(tokens.refreshToken);
    await this.userRepository.saveRefreshTokenHash(savedUser.id, refreshTokenHash);

    return { user: toPublicUser(savedUser), tokens };
  }
}
