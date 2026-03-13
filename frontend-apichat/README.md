
# Frontend APIChat

Frontend React + Vite adaptado para el backend de `backend-apichat`.

## Requisitos

- Node.js 20+
- Backend levantado en `http://localhost:3000`

## Configuracion

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo de entorno:

```powershell
Copy-Item .env.example .env
```

3. Variables disponibles:

- `VITE_API_BASE_URL` (default: `http://localhost:3000/v1`)
- `VITE_SOCKET_URL` (default: `http://localhost:3000`)

## Desarrollo

```bash
npm run dev
```

App local: `http://localhost:5173`

## Integracion con backend

- Auth HTTP:
  - `POST /v1/auth/register`
  - `POST /v1/auth/login`
  - `POST /v1/auth/refresh`
  - `POST /v1/auth/logout`
- Mensajes:
  - `GET /v1/messages/history?roomId=<id>`
- Socket:
  - Conexion con `socket.io-client` usando `auth.token`
  - Eventos: `chat.room.join`, `chat.message.send`, `chat.message.received`, `chat.user.joined`, `chat.user.left`, `chat.error`
  