# 💬 APICHAT - Real-time Messaging Platform

APICHAT is a high-performance, secure, and scalable real-time messaging application built with a modern tech stack and Clean Architecture principles. It features end-to-end security, distributed rate limiting, and optimized real-time communication.

---

## 🏗️ Architecture & Tech Stack

The project is divided into a robust backend and a polished frontend, designed for high availability and performance.

### **Backend (Clean Architecture)**
*   **Runtime:** Node.js (ES Modules)
*   **Framework:** Express.js
*   **Real-time:** Socket.io (with Redis Adapter for horizontal scaling)
*   **Database:** MongoDB (with Mongoose ODM)
*   **Cache/Security:** Redis (Rate limiting and deduplication)
*   **Validation:** Zod
*   **Authentication:** JWT (with secret rotation and security audit logging)

### **Frontend (Modern UI/UX)**
*   **Framework:** React 18 (TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS + Radix UI
*   **Real-time:** Socket.io-client
*   **State Management:** Context API
*   **Optimization:** Code splitting, Gzip/Brotli compression, and Error Boundaries.

---

## 🚀 Key Features

*   **Real-time Messaging:** Low-latency communication via WebSockets.
*   **Message Reactions:** Interactive emoji reactions with real-time sync.
*   **Cursor-based Pagination:** Infinite scrolling optimized for millions of messages.
*   **Enterprise Security:** Helmet, CSRF protection, and input sanitization (XSS prevention).
*   **Distributed Rate Limiting:** Protecting resources across multiple instances using Redis.
*   **Resilient UI:** Error Boundaries and optimized asset delivery for a smooth UX.
*   **Clean Architecture:** Separated layers (Domain, Application, Infrastructure) for maximum maintainability.

---

## 📂 Project Structure

```text
APICHAT/
├── backend-apichat/      # Node.js API & Socket Server
│   ├── src/
│   │   ├── api/          # Controllers, Routes, Middlewares
│   │   ├── application/  # Services & Use Cases
│   │   ├── domain/       # Entities & Repository Interfaces
│   │   ├── infrastructure/ # DB Models, Repositories, Security
│   │   └── shared/       # Utils, Logger, Config
│   └── test/             # Unit, Integration & E2E tests
├── frontend-apichat/     # React Application
│   ├── src/
│   │   ├── app/          # Components, Contexts, Pages
│   │   └── styles/       # Global & Tailwind styles
│   └── vite.config.ts    # Optimized build configuration
└── OPTIMIZACIONES_Y_MEJORAS.md # Technical roadmap & achievements
```

---

## 🛠️ Getting Started

### **Prerequisites**
*   Node.js (v18+)
*   MongoDB Instance
*   Redis Instance (Required for production/scaling)

### **1. Clone the repository**
```bash
git clone <repository-url>
cd APICHAT
```

### **2. Setup Backend**
```bash
cd backend-apichat
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### **3. Setup Frontend**
```bash
cd ../frontend-apichat
npm install
cp .env.example .env
# Edit .env with the backend URL
npm run dev
```

---

## 🔒 Security & Performance

This project implements industry-standard security practices:
*   **Helmet.js:** Secure HTTP headers.
*   **CSRF Protection:** Secure cookie-based token validation.
*   **Sanitization:** Automatic XSS prevention for all incoming data.
*   **JWT Hardening:** Algorithm enforcement (HS256) and automated secret rotation.
*   **Connection Pooling:** Optimized MongoDB connection management.
*   **Asset Compression:** Frontend assets delivered using Gzip/Brotli.

---

## 🧪 Testing

The project includes a comprehensive test suite:
*   **Backend:** `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`
*   **Frontend:** `npm run test` (if configured)

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Developed with ❤️ for high-performance communication.**
