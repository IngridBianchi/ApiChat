import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../components/chat/Sidebar";
import { ChatArea } from "../components/chat/ChatArea";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { api, socketClient, Message } from "../services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ChatPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState("general");
  const currentRoomRef = useRef(currentRoom);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [rooms] = useState(["general", "desarrollo", "diseño", "random"]);
  const [unreadByRoom, setUnreadByRoom] = useState<Record<string, number>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    return () => {
      socketClient.disconnect();
    };
  }, []);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // Cargar historial y conectar WebSocket
  useEffect(() => {
    if (!token || !user) return;

    socketClient.connect(token);

    // Subscribirse a todas las salas para detectar mensajes nuevos no vistos.
    rooms.forEach((roomId) => {
      socketClient.emit("chat.room.join", { roomId });
    });

    socketClient.on("chat.message.received", (newMsg: Message) => {
      if (newMsg.roomId !== currentRoomRef.current) {
        if (newMsg.userId !== user.id) {
          setUnreadByRoom((prev) => ({
            ...prev,
            [newMsg.roomId]: (prev[newMsg.roomId] || 0) + 1,
          }));
        }

        return;
      }

      setMessages((prev) => [...prev, newMsg]);
    });

    socketClient.on("chat.user.joined", (data: any) => {
      if (data.roomId !== currentRoomRef.current) {
        return;
      }

      setOnlineUsers((prev) => {
        if (prev.includes(data.username)) {
          return prev;
        }

        return [...prev, data.username];
      });

      if (data.userId !== user.id) {
        toast.info(`${data.username} se ha unido a #${data.roomId}`);
      }
    });

    socketClient.on("chat.user.left", (data: any) => {
      if (data.roomId !== currentRoomRef.current) {
        return;
      }

      setOnlineUsers((prev) => prev.filter((username) => username !== data.username));
    });

    socketClient.on("chat.error", (data: any) => {
      toast.error(`Error del servidor: ${data.message || "Operacion no completada"}`);
    });

    return () => {
      socketClient.off("chat.message.received");
      socketClient.off("chat.user.joined");
      socketClient.off("chat.user.left");
      socketClient.off("chat.error");
    };
  }, [token, user, rooms]);

  // Cargar historial de la sala
  useEffect(() => {
    if (!token) return;

    setUnreadByRoom((prev) => {
      if (!prev[currentRoom]) {
        return prev;
      }

      const next = { ...prev };
      delete next[currentRoom];
      return next;
    });

    const loadHistory = async () => {
      setLoadingHistory(true);
      setMessages([]);
      setOnlineUsers([]);
      try {
        const response = await api.getHistory(currentRoom);
        setMessages(response?.data || []);
        socketClient.emit("chat.room.join", { roomId: currentRoom });
      } catch {
        toast.error("Error al cargar el historial");
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [currentRoom, token]);

  const handleSendMessage = (text: string) => {
    if (!user) return;
    socketClient.emit("chat.message.send", { roomId: currentRoom, message: text });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative w-full">
      <Sidebar
        currentRoom={currentRoom}
        unreadByRoom={unreadByRoom}
        onRoomSelect={(room) => {
          setCurrentRoom(room);
          setIsSidebarOpen(false);
        }}
        rooms={rooms}
        isMobileOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-white h-full w-full relative">
        {loadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-500">Cargando mensajes...</span>
          </div>
        ) : (
          <ChatArea
            currentRoom={currentRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
            onlineUsers={[user.username, ...onlineUsers.filter(u => u !== user.username)]}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
      </main>
    </div>
  );
}
