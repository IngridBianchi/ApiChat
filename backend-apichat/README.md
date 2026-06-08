# APICHAT - Backend API

High-performance real-time messaging backend with REST + WebSockets, JWT authentication, and Clean Architecture.

## 🚀 Key Features

*   **API HTTP Versioning:** All endpoints under `/v1`.
*   **Secure WebSockets:** Socket.IO with token-based authentication during handshake.
*   **Horizontal Scaling:** Redis adapter support for multi-instance deployments.
*   **JWT Hardening:** Algorithm enforcement (HS256), detailed validation, and **Automated Secret Rotation**.
*   **Advanced Security:**
    *   **Helmet.js:** Secure HTTP headers.
    *   **CSRF Protection:** Secure cookie-based validation.
    *   **Input Sanitization:** XSS prevention using `isomorphic-dompurify`.
    *   **Distributed Rate Limiting:** Redis-backed protection for Auth and API endpoints.
*   **Optimized Performance:**
    *   **Cursor-based Pagination:** Efficient infinite scrolling for message history.
    *   **Standard Response Envelope:** Consistent `{ status, data, message }` format.
    *   **Connection Pooling:** Efficient MongoDB connection management.
*   **Observability:** Request logging, tracing foundation, and Prometheus metrics.

## 🛠️ Tech Stack

*   **Runtime:** Node.js (ESM)
*   **Framework:** Express
*   **Real-time:** Socket.IO
*   **Database:** MongoDB + Mongoose
*   **Cache/Rate Limit:** Redis
*   **Security:** Helmet, CSRF, JWT, bcryptjs, DOMPurify
*   **Validation:** Zod
*   **Logging:** Pino
*   **Metrics:** Prometheus

## 📋 Requirements

*   Node.js 20+
*   MongoDB Instance
*   Redis (Required for rate limiting and scaling)

## ⚙️ Installation & Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    ```bash
    cp .env.example .env
    ```
    Adjust values in `.env`:
    *   `MONGO_URI`
    *   `JWT_SECRET`
    *   `JWT_REFRESH_SECRET`
    *   `REDIS_URL`

3.  **Start in Development:**
    ```bash
    npm run dev
    ```

## 🔌 API Endpoints

### **Authentication**
*   `POST /v1/auth/register` - Public
*   `POST /v1/auth/login` - Public
*   `POST /v1/auth/refresh` - Public
*   `POST /v1/auth/logout` - Protected (Bearer)

### **Messaging**
*   `GET /v1/messages/history?roomId=general&limit=50&cursor=<token>` - Protected (Bearer)

### **System**
*   `GET /v1/csrf-token` - Get CSRF protection token
*   `GET /health` - Health check
*   `GET /ready` - Readiness check (DB & Redis status)
*   `GET /metrics` - Prometheus metrics

## 📡 WebSockets

Handshake authentication:
```js
const socket = io("http://localhost:3000", {
  auth: { token: "<access-token>" },
});
```

### **Core Events**
*   `chat.room.join`: `{ roomId }`
*   `chat.message.send`: `{ roomId, message, clientId? }`
*   `chat.message.react`: `{ messageId, emoji }`
*   `chat.message.unreact`: `{ messageId, emoji }`

### **Server Events**
*   `chat.message.received`: New message.
*   `chat.message.reaction_updated`: Message with updated reactions.
*   `chat.user.joined` / `chat.user.left`: User status.
*   `chat.user.typing`: Typing indicators.

## 🏗️ Project Structure

```text
src/
  api/
    http/        # Routes, Controllers, Middlewares (Security, Rate Limit, etc.)
    socket/      # Socket events and auth
  application/   # Business Logic (Services & Use Cases)
  domain/        # Core Entities and Repository Interfaces
  infrastructure/# External Implementations (DB, Repos, Security)
  shared/        # Shared Utilities (Config, Errors, Logger, Telemetry)
```

## 🧪 Testing

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```
