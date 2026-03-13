import crypto from "node:crypto";
import { UnauthorizedError } from "../../shared/errors/BaseError.js";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export class RefreshSession {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute(refreshToken) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findByIdWithRefreshToken(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError("Refresh token inválido");
    }

    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);
    if (!safeEqual(user.refreshTokenHash, refreshTokenHash)) {
      throw new UnauthorizedError("Refresh token inválido");
    }

    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      username: user.username,
    });
    const nextRefreshTokenHash = this.tokenService.hashRefreshToken(tokens.refreshToken);

    await this.userRepository.saveRefreshTokenHash(user.id, nextRefreshTokenHash);

    return tokens;
  }
}
