/src
  /api
    /http
      /controllers
      /routes
      /dto
      /middlewares
    /socket
      chatSocket.js
      socketAuth.js
      socketEvents.js
  /application
    /services
    /usecases
  /domain
    /entities
    /repositories (interfaces)
    /value-objects
  /infrastructure
    /db
    /repositories
    /cache
    /messaging
    /security
  /shared
    /config
    /errors
    /logger
    /telemetry
/tests
  /unit
  /integration
  /e2e


## 📌 Arquitectura del Chat en Vivo

1. Capas
API Layer (HTTP + WebSocket)
- Controladores REST (/v1/auth/*, /v1/messages/*).
- Gateway WebSocket (/chat) con eventos versionados.
- DTOs y validaciones fuertes (zod/joi).

Application Layer (Servicios + Casos de uso)
- AuthService, MessageService.
- Casos de uso: RegisterUser, LoginUser, SendMessage, GetHistory.
- Principio de Dependency Injection: servicios dependen de interfaces, no de implementaciones.

Domain Layer (Entidades + Interfaces)
- Entidades: User, Message.
- Interfaces: IUserRepository, IMessageRepository.
- Value Objects (ej. UserId, MessageId).

Infrastructure Layer
- Repositorios MongoDB con índices definidos.
- Adaptador Redis para Socket.io (escalado horizontal).
- Seguridad: hashing con argon2, JWT corto + refresh token.
- Logging estructurado y métricas básicas.

Shared Layer
- Configuración (dotenv).
- Errores estandarizados.
- Logger y Telemetría (OpenTelemetry/Prometheus).

2. Patrones de diseño
- Repository Pattern: acceso a datos desacoplado.
- Observer Pattern: WebSocket notifica a clientes.
- Factory Pattern: creación controlada de entidades.
- Strategy Pattern: posible para distintos métodos de autenticación.
- Dependency Injection: clave para testeo y escalabilidad.

3. Escalabilidad y Operación
- Redis Adapter para Socket.io → soportar múltiples instancias.
- Health/Readiness endpoints (/health, /ready).
- Logs estructurados con requestId.
- Métricas básicas: latencia, errores, conexiones activas.
- CI/CD gratuito: GitHub Actions con tests unitarios, integración y E2E.

4. Contrato API (OpenAPI)
- Versionado: /v1/*.
- Schemas reutilizables (UserRegisterRequest, AuthResponse, Message).
- Errores estandarizados (400, 401, 403, 429, 500).
- Ejemplos en requests/responses.
- Documentar WebSocket con AsyncAPI (opcional para madurez).




