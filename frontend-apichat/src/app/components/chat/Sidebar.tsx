import { LogOut, Hash, Plus, MessageCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router";
import { api } from "../../services/api";

interface SidebarProps {
  currentRoom: string;
  unreadByRoom: Record<string, number>;
  onRoomSelect: (roomId: string) => void;
  rooms: string[];
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ currentRoom, unreadByRoom, onRoomSelect, rooms, isMobileOpen, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Limpiar estado local incluso si falla la revocacion remota.
    }

    logout();
    navigate("/login");
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-slate-900 text-slate-300 flex-col h-full flex-shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileOpen ? "translate-x-0 flex" : "-translate-x-full md:flex hidden"
      )}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            APIChat
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Salas</span>
          <button className="hover:text-slate-300 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1 px-2">
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => onRoomSelect(room)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md group transition-colors",
                currentRoom === room
                  ? "bg-slate-800 text-white"
                  : unreadByRoom[room]
                    ? "text-amber-100 bg-amber-500/15 ring-1 ring-amber-400/35 hover:bg-amber-500/25"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <span className="flex items-center min-w-0">
                <Hash
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    currentRoom === room
                      ? "text-slate-300"
                      : unreadByRoom[room]
                        ? "text-amber-300"
                        : "text-slate-500 group-hover:text-slate-300"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{room}</span>
              </span>

              {unreadByRoom[room] ? (
                <span className="ml-2 min-w-5 h-5 px-1 rounded-full bg-amber-400 text-slate-900 text-[11px] font-bold flex items-center justify-center">
                  {unreadByRoom[room] > 99 ? "99+" : unreadByRoom[room]}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-slate-900"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-slate-400">En línea</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
    </>
  );
}
