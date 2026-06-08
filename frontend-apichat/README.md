# APICHAT - Frontend Application

Modern React + Vite frontend for the APICHAT messaging platform.

## 🚀 Optimized Features

*   **Smart Bundling:** Vite configuration with `terser` minification and code splitting.
*   **Compression:** Static assets served with Gzip and Brotli support.
*   **Error Resilience:** **Error Boundaries** implemented to prevent app crashes and provide recovery UI.
*   **Standardized API:** Built-in support for the backend's standard response envelope and automatic token refreshing.
*   **Real-time Interaction:** Enhanced Socket.IO client with support for message reactions and typing indicators.
*   **Performance:** Optimized component rendering and asset delivery.

## 📋 Requirements

*   Node.js 20+
*   Backend running at `http://localhost:3000`

## ⚙️ Configuration & Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    ```bash
    cp .env.example .env
    ```
    Key variables:
    *   `VITE_API_BASE_URL`: Base API endpoint (default: `http://localhost:3000/v1`)
    *   `VITE_SOCKET_URL`: WebSocket server (default: `http://localhost:3000`)

3.  **Start in Development:**
    ```bash
    npm run dev
    ```
    Access at: `http://localhost:5173`

## 📡 Backend Integration

### **Authentication**
Fully integrated with the `/v1/auth` system including automatic retry logic for expired tokens.

### **Messaging**
*   **History:** Cursor-based infinite scrolling support.
*   **Reactions:** Real-time emoji reaction syncing.
*   **Typing:** Visual indicators for active users.

### **Real-time Events**
Handles `chat.message.received`, `chat.message.reaction_updated`, `chat.user.joined`, `chat.user.left`, and `chat.user.typing`.

## 🏗️ Tech Stack

*   **Core:** React 18, TypeScript, Vite
*   **State:** Context API
*   **Real-time:** socket.io-client
*   **Styling:** Tailwind CSS, Radix UI
*   **Validation:** Zod
*   **Build Optimization:** rollup-plugin-visualizer, vite-plugin-compression
