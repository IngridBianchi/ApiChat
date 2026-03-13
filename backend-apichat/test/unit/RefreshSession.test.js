import assert from "node:assert/strict";
import test from "node:test";
import { RefreshSession } from "../../src/application/usecases/RefreshSession.js";
import { UnauthorizedError } from "../../src/shared/errors/BaseError.js";

test("RefreshSession valida token, rota hash y devuelve nuevo par de tokens", async () => {
  let persistedHash;

  const userRepository = {
    async findByIdWithRefreshToken() {
      return { id: "u1", refreshTokenHash: "h_current" };
    },
    async saveRefreshTokenHash(_id, hash) {
      persistedHash = hash;
    },
  };

  const tokenService = {
    verifyRefreshToken() {
      return { sub: "u1" };
    },
    hashRefreshToken(token) {
      return token === "old-refresh" ? "h_current" : "h_next";
    },
    generateTokenPair() {
      return { accessToken: "new-access", refreshToken: "new-refresh" };
    },
  };

  const useCase = new RefreshSession(userRepository, tokenService);
  const tokens = await useCase.execute("old-refresh");

  assert.equal(tokens.accessToken, "new-access");
  assert.equal(persistedHash, "h_next");
});

test("RefreshSession lanza UnauthorizedError cuando hash no coincide", async () => {
  const userRepository = {
    async findByIdWithRefreshToken() {
      return { id: "u1", refreshTokenHash: "h_expected" };
    },
    async saveRefreshTokenHash() {},
  };

  const tokenService = {
    verifyRefreshToken() {
      return { sub: "u1" };
    },
    hashRefreshToken() {
      return "h_other";
    },
    generateTokenPair() {
      return { accessToken: "a", refreshToken: "r" };
    },
  };

  const useCase = new RefreshSession(userRepository, tokenService);

  await assert.rejects(() => useCase.execute("old-refresh"), (err) => err instanceof UnauthorizedError);
});
