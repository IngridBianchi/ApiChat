import assert from "node:assert/strict";
import http from "node:http";
import test, { after } from "node:test";
import { io as createSocketClient } from "socket.io-client";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_access_secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_refresh_secret";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000,http://127.0.0.1";

const [{ createApp }, { initChatSocket }, { container }, { tokenService }] = await Promise.all([
  import("../../src/app.js"),
  import("../../src/api/socket/chatSocket.js"),
  import("../../src/application/container.js"),
  import("../../src/infrastructure/security/tokenService.js"),
]);

const app = createApp();
const server = http.createServer(app);
const { io, closeRedisAdapter } = await initChatSocket(server);

await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", resolve);
});

const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

const originalSend = container.services.messageService.send;
container.services.messageService.send = async ({ roomId, userId, username, message }) => ({
  id: `m_${Date.now()}`,
  roomId,
  userId,
  username,
  message,
  createdAt: new Date().toISOString(),
});

function waitForConnect(socket, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout esperando conexion socket"));
    }, timeoutMs);

    function onConnect() {
      cleanup();
      resolve();
    }

    function onConnectError(err) {
      cleanup();
      reject(err);
    }

    function cleanup() {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    }

    socket.once("connect", onConnect);
    socket.once("connect_error", onConnectError);
  });
}

function waitForEvent(socket, eventName, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout esperando evento ${eventName}`));
    }, timeoutMs);

    function onEvent(payload) {
      cleanup();
      resolve(payload);
    }

    function cleanup() {
      clearTimeout(timer);
      socket.off(eventName, onEvent);
    }

    socket.once(eventName, onEvent);
  });
}

function emitWithAck(socket, eventName, payload, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout esperando ack de ${eventName}`));
    }, timeoutMs);

    socket.emit(eventName, payload, (ack) => {
      clearTimeout(timer);
      resolve(ack);
    });
  });
}

function createAuthenticatedClient({ id, username }) {
  const accessToken = tokenService.generateTokenPair({ id, username }).accessToken;

  return createSocketClient(baseUrl, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
    auth: { token: accessToken },
  });
}

after(async () => {
  container.services.messageService.send = originalSend;

  io.close();
  await closeRedisAdapter();

  await new Promise((resolve) => {
    server.close(() => resolve());
  });
});

test("Socket E2E: join + send + receive en sala", async () => {
  const sender = createAuthenticatedClient({ id: "u1", username: "ana_dev" });
  const receiver = createAuthenticatedClient({ id: "u2", username: "john_dev" });

  try {
    await Promise.all([waitForConnect(sender), waitForConnect(receiver)]);

    const joinSenderAck = await emitWithAck(sender, "chat.room.join", { roomId: "general" });
    assert.equal(joinSenderAck.status, "ok");

    const joinReceiverAck = await emitWithAck(receiver, "chat.room.join", { roomId: "general" });
    assert.equal(joinReceiverAck.status, "ok");

    const receivedMessagePromise = waitForEvent(receiver, "chat.message.received");

    const sendAck = await emitWithAck(sender, "chat.message.send", {
      roomId: "general",
      message: "hola desde e2e",
    });

    assert.equal(sendAck.status, "ok");
    assert.equal(typeof sendAck.messageId, "string");

    const receivedMessage = await receivedMessagePromise;
    assert.equal(receivedMessage.roomId, "general");
    assert.equal(receivedMessage.message, "hola desde e2e");
    assert.equal(receivedMessage.username, "ana_dev");
  } finally {
    sender.disconnect();
    receiver.disconnect();
  }
});

test("Socket E2E: reconnect manual y re-join con ack", async () => {
  const client = createAuthenticatedClient({ id: "u3", username: "reconnect_user" });

  try {
    await waitForConnect(client);

    client.disconnect();
    client.connect();

    await waitForConnect(client);

    const joinAck = await emitWithAck(client, "chat.room.join", { roomId: "general" });
    assert.equal(joinAck.status, "ok");
  } finally {
    client.disconnect();
  }
});
