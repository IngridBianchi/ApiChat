import { useState, useRef, useEffect } from "react";
import { Send, Hash, Users, Activity, Menu } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

interface ChatAreaProps {
  currentRoom: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onlineUsers: string[];
  onToggleSidebar?: () => void;
}

export function ChatArea({ currentRoom, messages, onSendMessage, onlineUsers, onToggleSidebar }: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2 -ml-2 text-slate-500" onClick={onToggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 mr-3 text-slate-500">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">{currentRoom}</h2>
            <div className="flex items-center text-xs text-slate-500 mt-0.5">
              <Activity className="w-3 h-3 text-green-500 mr-1" />
              Conectado al servidor WebSocket
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-slate-500">
          <Users className="w-5 h-5 mr-2 text-slate-400" />
          <span>{onlineUsers.length} en línea</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          // Add spacing if it's the first message from a user in a sequence
          const isFirstInSequence =
            index === 0 || messages[index - 1].userId !== msg.userId;

          return (
            <div key={msg.id} className={isFirstInSequence ? "mt-4" : "mt-1"}>
              <MessageBubble
                id={msg.id}
                text={msg.message}
                senderName={msg.username}
                isOwn={msg.userId === user?.id}
                timestamp={msg.createdAt}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enviar mensaje a #${currentRoom}...`}
            className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg px-4 py-3 outline-none transition-all"
          />
          <Button
            type="submit"
            disabled={!inputText.trim()}
            className="rounded-lg h-auto px-5"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
