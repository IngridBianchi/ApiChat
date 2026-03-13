import { createBrowserRouter, Navigate } from "react-router";
import { AuthPage } from "./pages/AuthPage";
import { ChatPage } from "./pages/ChatPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/chat",
    element: <ChatPage />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
