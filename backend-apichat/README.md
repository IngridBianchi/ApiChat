# APICHAT

Backend de chat en vivo con REST + WebSocket, autenticacion JWT, persistencia en MongoDB y arquitectura por capas.

## Estado actual

- API HTTP versionada en `/v1`
- Socket.IO con autenticacion por token en handshake
- Soporte de escalado horizontal con Redis adapter en Socket.IO (`REDIS_URL`)
- Access/refresh tokens con rotacion de refresh token
- Validacion de payloads con Zod
- Error handling estandar con codigos de negocio
- Endpoints operativos `/health`, `/ready`, `/metrics`
- Pruebas unitarias, integracion y E2E con `node:test`

## Stack

- Node.js (ESM)
- Express
- Socket.IO
- Redis (adapter Pub/Sub para Socket.IO)
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Hashing (`bcryptjs`)
- Validacion (`zod`)
- Logging (`pino`)
- Metricas Prometheus (`prom-client`)

## Requisitos

- Node.js 20+
- npm 10+
- MongoDB disponible (local o remoto)

## Instalacion y arranque

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno desde ejemplo:

```powershell
Copy-Item .env.example .env
```

3. Ajustar valores en `.env`.

4. Levantar en desarrollo:

```bash
npm run dev
```

5. Levantar en modo normal:

```bash
npm start
```

## Variables de entorno

Base minima requerida (`src/shared/config/index.js`):

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `REDIS_URL` (obligatoria para multi-instancia)

Variables soportadas:

- `NODE_ENV` (default: `development`)
- `PORT` (default: `3000`)
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `REDIS_URL` (ej. `redis://localhost:6379`)
- `JWT_EXPIRATION` (default: `15m`)
- `JWT_REFRESH_EXPIRATION` (default: `7d`)
- `CORS_ALLOWED_ORIGINS` (CSV, default: `http://localhost:5173`)
- `AUTH_RATE_LIMIT_WINDOW_MS` (default: `900000`)
- `AUTH_RATE_LIMIT_MAX` (default: `10`)
- `LOG_LEVEL` (default: `info`)

## API HTTP

Contrato OpenAPI: `openapi.yaml`

### Auth

- `POST /v1/auth/register` (publico)
- `POST /v1/auth/login` (publico)
- `POST /v1/auth/refresh` (publico)
- `POST /v1/auth/logout` (requiere Bearer token)

### Mensajes

- `GET /v1/messages/history?roomId=general&limit=50&cursor=<id>` (requiere Bearer token)

### Sistema

- `GET /health`
- `GET /ready`
- `GET /metrics`

## WebSocket

Endpoint de socket: mismo host/puerto HTTP.

Autenticacion de handshake:

```js
const socket = io("http://localhost:3000", {
  auth: { token: "<access-token>" },
});
```

Eventos principales:

- Cliente -> servidor: `chat.room.join` payload `{ roomId }`
- Cliente -> servidor: `chat.message.send` payload `{ roomId, message }`
- Servidor -> cliente: `chat.user.joined`
- Servidor -> cliente: `chat.user.left`
- Servidor -> cliente: `chat.message.received`
- Servidor -> cliente: `chat.error`

## Seguridad aplicada

- Passwords hasheados con `bcryptjs`
- Refresh token almacenado como hash SHA-256
- Middleware `authMiddleware` con esquema Bearer estricto
- Validaciones HTTP con Zod (`validateMiddleware`)
- Rate limit en endpoints de auth (`rateLimitMiddleware`)
- CORS por whitelist (`CORS_ALLOWED_ORIGINS`)
- Errores estandarizados (`BaseError` + `errorHandler`)

## Observabilidad

- Request logging con `pino`
- `x-request-id` en request/response
- Histograma `http_request_duration_seconds`
- Endpoint Prometheus en `/metrics`
- `GET /ready` incluye estado de `database` y `redis`

## CI

- Pipeline GitHub Actions en `.github/workflows/ci.yml`
- Ejecuta instalacion con `npm ci` y luego `npm test`

## Pruebas

Scripts disponibles en `package.json`:

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

Cobertura actual implementada:

- Unit: `test/unit/RegisterUser.test.js`
- Unit: `test/unit/LoginUser.test.js`
- Unit: `test/unit/RefreshSession.test.js`
- Unit: `test/unit/LogoutUser.test.js`
- Integracion: `test/integration/authRoutes.test.js`
- Integracion: `test/integration/messageRoutes.test.js`
- E2E: `test/e2e/socketEvents.test.js`

## Estructura del proyecto

```text
src/
  api/
    http/
    socket/
  application/
    services/
    usecases/
    container.js
  domain/
    entities/
    repositories/
    value-objects/
  infrastructure/
    db/
    repositories/
    security/
  shared/
    config/
    errors/
    logger/
    telemetry/
test/
  unit/
  integration/
openapi.yaml
```

## Notas

- El rate limiter actual es in-memory (MVP). Para despliegue horizontal me conviene migrarlo a Redis.
- Socket.IO usa Redis adapter cuando `REDIS_URL` esta configurada; esto es requerido para soporte multi-instancia.
- `openapi.yaml` incluye la especificacion HTTP y eventos socket (`x-websocket`).
