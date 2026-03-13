import assert from "node:assert/strict";
import test from "node:test";
import { LoginUser } from "../../src/application/usecases/LoginUser.js";
import { UnauthorizedError } from "../../src/shared/errors/BaseError.js";

test("LoginUser retorna usuario público y rota refresh token hash", async () => {
  let savedHash;

  const userRepository = {
    async findByUsernameWithCredentials() {
      return { id: "u1", username: "ana_dev", passwordHash: "stored-hash" };
    },
    async saveRefreshTokenHash(_id, hash) {
      savedHash = hash;
    },
  };

  const passwordHasher = {
    async compare() {
      return true;
    },
  };

  const tokenService = {
    generateTokenPair() {
      return { accessToken: "a", refreshToken: "r" };
    },
    hashRefreshToken() {
      return "refresh-hash";
    },
  };

  const useCase = new LoginUser(userRepository, passwordHasher, tokenService);
  const result = await useCase.execute({ username: "ana_dev", password: "Aa!12345" });

  assert.deepEqual(result.user, { id: "u1", username: "ana_dev" });
  assert.equal(savedHash, "refresh-hash");
});

test("LoginUser lanza UnauthorizedError en credenciales inválidas", async () => {
  const baseRepo = {
    async saveRefreshTokenHash() {},
  };

  const noUserUseCase = new LoginUser(
    {
      ...baseRepo,
      async findByUsernameWithCredentials() {
        return null;
      },
    },
    { compare: async () => true },
    { generateTokenPair: () => ({}), hashRefreshToken: () => "h" }
  );

  await assert.rejects(
    () => noUserUseCase.execute({ username: "ana_dev", password: "Aa!12345" }),
    (err) => err instanceof UnauthorizedError
  );

  const badPasswordUseCase = new LoginUser(
    {
      ...baseRepo,
      async findByUsernameWithCredentials() {
        return { id: "u1", username: "ana_dev", passwordHash: "stored" };
      },
    },
    { compare: async () => false },
    { generateTokenPair: () => ({}), hashRefreshToken: () => "h" }
  );

  await assert.rejects(
    () => badPasswordUseCase.execute({ username: "ana_dev", password: "Aa!12345" }),
    (err) => err instanceof UnauthorizedError
  );
});
