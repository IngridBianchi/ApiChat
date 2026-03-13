import assert from "node:assert/strict";
import test from "node:test";
import { RegisterUser } from "../../src/application/usecases/RegisterUser.js";
import { ConflictError } from "../../src/shared/errors/BaseError.js";

test("RegisterUser crea usuario, persiste refresh hash y retorna user público", async () => {
  const repoCalls = { saveRefreshTokenHash: 0 };

  const userRepository = {
    async findByUsername() {
      return null;
    },
    async create(entity) {
      return { id: "u1", username: entity.username };
    },
    async saveRefreshTokenHash() {
      repoCalls.saveRefreshTokenHash += 1;
    },
  };

  const passwordHasher = {
    async hash() {
      return "hashed-password";
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

  const useCase = new RegisterUser(userRepository, passwordHasher, tokenService);
  const result = await useCase.execute({ username: "ana_dev", password: "Aa!12345" });

  assert.deepEqual(result.user, { id: "u1", username: "ana_dev" });
  assert.equal(result.tokens.refreshToken, "r");
  assert.equal(repoCalls.saveRefreshTokenHash, 1);
});

test("RegisterUser lanza ConflictError si el username ya existe", async () => {
  const userRepository = {
    async findByUsername() {
      return { id: "u1", username: "ana_dev" };
    },
  };

  const useCase = new RegisterUser(userRepository, { hash: async () => "x" }, {
    generateTokenPair() {
      return { accessToken: "a", refreshToken: "r" };
    },
    hashRefreshToken() {
      return "h";
    },
  });

  await assert.rejects(
    () => useCase.execute({ username: "ana_dev", password: "Aa!12345" }),
    (err) => err instanceof ConflictError
  );
});
