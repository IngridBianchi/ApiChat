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

test("POST /v1/auth/register retorna 422 con payload inválido", async () => {
  const response = await request(app).post("/v1/auth/register").send({
    username: "ab",
    password: "123",
  });

  assert.equal(response.status, 422);
  assert.equal(response.body.code, "VALIDATION_ERROR");
});

test("POST /v1/auth/register retorna 201 con payload válido", async () => {
  const original = container.services.authService.register;

  container.services.authService.register = async () => ({
    user: { id: "u1", username: "ana_dev" },
    tokens: { accessToken: "a", refreshToken: "r", tokenType: "Bearer", expiresIn: 900 },
  });

  try {
    const response = await request(app).post("/v1/auth/register").send({
      username: "ana_dev",
      password: "Aa!12345",
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.user.username, "ana_dev");
  } finally {
    container.services.authService.register = original;
  }
});

test("POST /v1/auth/logout requiere token", async () => {
  const response = await request(app).post("/v1/auth/logout").send();

  assert.equal(response.status, 401);
  assert.equal(response.body.code, "UNAUTHORIZED");
});

test("POST /v1/auth/logout revoca sesión y retorna 204", async () => {
  const originalVerify = container.security.tokenService.verifyAccessToken;
  const originalLogout = container.services.authService.logout;
  let revokedUserId;

  container.security.tokenService.verifyAccessToken = () => ({ id: "u1" });
  container.services.authService.logout = async (userId) => {
    revokedUserId = userId;
  };

  try {
    const response = await request(app)
      .post("/v1/auth/logout")
      .set("Authorization", "Bearer valid-token")
      .send();

    assert.equal(response.status, 204);
    assert.equal(revokedUserId, "u1");
  } finally {
    container.security.tokenService.verifyAccessToken = originalVerify;
    container.services.authService.logout = originalLogout;
  }
});
