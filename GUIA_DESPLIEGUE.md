# 🚀 Guía de Despliegue Gratuito - APICHAT

Esta guía detalla los pasos exactos para desplegar la plataforma **APICHAT** (Frontend y Backend) utilizando servicios gratuitos de alta calidad.

---

## 📋 Requisitos Previos

1.  Cuenta en [GitHub](https://github.com) con el código del proyecto subido.
2.  Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Base de datos).
3.  Cuenta en [Upstash](https://upstash.com/) (Redis para Rate Limiting).
4.  Cuenta en [Render](https://render.com/) (Hosting de Servidor y Web).

---

## 🏗️ Paso 1: Configurar la Base de Datos (MongoDB Atlas)

1.  Inicia sesión y crea un nuevo proyecto llamado `APICHAT`.
2.  Crea un **Cluster** gratuito (Shared Tier).
3.  En **Network Access**, haz clic en **Add IP Address** y selecciona **Allow Access from Anywhere** (0.0.0.0/0). *Esto es necesario porque Render usa IPs dinámicas.*
4.  En **Database Access**, crea un usuario con rol `atlasAdmin`. Guarda el usuario y la contraseña.
5.  Haz clic en **Connect** -> **Drivers** -> **Node.js** y copia la **Connection String**.
    *   Se verá así: `mongodb+srv://<usuario>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    *   **Importante:** Reemplaza `<password>` con tu contraseña real.

---

## ⚡ Paso 2: Configurar Redis (Upstash)

1.  Inicia sesión en Upstash y crea una **Redis Database**.
2.  Selecciona la región más cercana a donde desplegarás (ej. `us-east-1`).
3.  En la pestaña **Details**, busca la sección **REST API** o **Node.js** y copia la **Redis URL**.
    *   Se verá así: `redis://default:xxxx@xxxx.upstash.io:6379`

---

## ⚙️ Paso 3: Desplegar el Backend (Render)

1.  En el Dashboard de Render, haz clic en **New +** -> **Web Service**.
2.  Conecta tu repositorio de GitHub.
3.  Configura los siguientes campos:
    *   **Name:** `apichat-backend`
    *   **Root Directory:** `backend-apichat`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Instance Type:** `Free`
4.  Haz clic en **Advanced** y añade las siguientes **Environment Variables**:
    *   `NODE_ENV`: `production`
    *   `PORT`: `10000` (Render usa este por defecto)
    *   `MONGO_URI`: *Tu cadena de conexión de Atlas*
    *   `REDIS_URL`: *Tu URL de Upstash*
    *   `JWT_SECRET`: *Una cadena larga y aleatoria*
    *   `JWT_REFRESH_SECRET`: *Otra cadena larga y aleatoria*
    *   `CORS_ALLOWED_ORIGINS`: `https://apichat-web.onrender.com` (O la URL que elijas para el frontend en el Paso 4)
5.  Haz clic en **Create Web Service**.
    *   *Nota: Render Free Tier "duerme" tras 15 min de inactividad. La primera petición tardará unos 30s en despertar.*

---

## 💻 Paso 4: Desplegar el Frontend (Render o Vercel)

*Recomendamos Render para mantener todo en un solo lugar o Vercel por su velocidad.*

### Opción A: Render (Static Site)
1.  **New +** -> **Static Site**.
2.  Conecta el repositorio.
3.  Configura:
    *   **Name:** `apichat-web`
    *   **Root Directory:** `frontend-apichat`
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
4.  Añade las **Environment Variables**:
    *   `VITE_API_BASE_URL`: `https://apichat-backend.onrender.com/v1`
    *   `VITE_SOCKET_URL`: `https://apichat-backend.onrender.com`
5.  Haz clic en **Create Static Site**.

---

## 🔗 Paso 5: Ajustes Finales de CORS

Una vez que el frontend esté desplegado y tengas su URL final (ej. `https://apichat-web.onrender.com`):
1.  Vuelve a la configuración del **Backend** en Render.
2.  Asegúrate de que `CORS_ALLOWED_ORIGINS` incluya esa URL exacta (sin barra al final).
3.  Guarda los cambios y el backend se reiniciará automáticamente.

---

## ⚠️ Consideraciones de la Versión Gratuita

1.  **Cold Start:** El backend tardará en responder si no ha tenido tráfico reciente.
2.  **WebSockets:** Render soporta WebSockets en el plan gratuito, pero la conexión se cortará si el servidor entra en modo reposo.
3.  **Base de Datos:** MongoDB Atlas permite hasta 512MB, suficiente para miles de mensajes.
4.  **Redis:** Upstash tiene un límite de comandos diarios en el plan gratuito, ideal para pruebas y uso moderado.

---

## ✅ Verificación

1.  Abre la URL del frontend.
2.  Si ves la pantalla de login, ¡éxito!
3.  Si el login falla, revisa la consola del navegador (F12) por errores de CORS o el log de Render por errores de conexión a MongoDB.
