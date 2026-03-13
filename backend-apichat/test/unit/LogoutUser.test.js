import assert from "node:assert/strict";
import test from "node:test";
import { LogoutUser } from "../../src/application/usecases/LogoutUser.js";
import { UnauthorizedError } from "../../src/shared/errors/BaseError.js";

test("LogoutUser limpia refresh token hash del usuario", async () => {
  let clearedUserId;

  const userRepository = {
    async clearRefreshTokenHash(userId) {
      clearedUserId = userId;
    },
  };

  const useCase = new LogoutUser(userRepository);
  await useCase.execute("u1");

  assert.equal(clearedUserId, "u1");
});

test("LogoutUser lanza UnauthorizedError sin userId", async () => {
  const useCase = new LogoutUser({ clearRefreshTokenHash: async () => {} });

  await assert.rejects(() => useCase.execute(undefined), (err) => err instanceof UnauthorizedError);
});
