import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_access_secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_refresh_secret";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000";

const [{ createApp }, { container }] = await Promise.all([
  import("../../src/app.js"),
  import("../../src/application/container.js"),
]);

const app = createApp();

test("GET /v1/messages/history requiere token", async () => {
  const response = await request(app).get("/v1/messages/history").query({ roomId: "general" });

  assert.equal(response.status, 401);
  assert.equal(response.body.code, "UNAUTHORIZED");
});

test("GET /v1/messages/history valida query", async () => {
  const originalVerify = container.security.tokenService.verifyAccessToken;
  container.security.tokenService.verifyAccessToken = () => ({ id: "u1" });

  try {
    const response = await request(app)
      .get("/v1/messages/history")
      .set("Authorization", "Bearer valid-token");

    assert.equal(response.status, 422);
    assert.equal(response.body.code, "VALIDATION_ERROR");
  } finally {
    container.security.tokenService.verifyAccessToken = originalVerify;
  }
});

test("GET /v1/messages/history retorna 200 y pasa parámetros tipados al servicio", async () => {
  const originalVerify = container.security.tokenService.verifyAccessToken;
  const originalHistory = container.services.messageService.history;
  let receivedInput;

  container.security.tokenService.verifyAccessToken = () => ({ id: "u1" });
  container.services.messageService.history = async (input) => {
    receivedInput = input;
    return {
      data: [
        {
          id: "m1",
          roomId: "general",
          userId: "u1",
          username: "ana_dev",
          message: "hola",
          createdAt: new Date().toISOString(),
        },
      ],
      hasMore: false,
      nextCursor: null,
    };
  };

  try {
    const response = await request(app)
      .get("/v1/messages/history")
      .set("Authorization", "Bearer valid-token")
      .query({ roomId: "general", limit: "25" });

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body.data), true);
    assert.equal(receivedInput.roomId, "general");
    assert.equal(receivedInput.limit, 25);
  } finally {
    container.security.tokenService.verifyAccessToken = originalVerify;
    container.services.messageService.history = originalHistory;
  }
});
