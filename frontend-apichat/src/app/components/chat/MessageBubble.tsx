import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface MessageBubbleProps {
  id: string;
  text: string;
  senderName: string;
  isOwn: boolean;
  timestamp: string;
}

export function MessageBubble({
  text,
  senderName,
  isOwn,
  timestamp,
}: MessageBubbleProps) {
  const time = format(new Date(timestamp), "HH:mm");

  return (
    <div
      className={cn(
        "flex w-full mt-2 space-x-3 max-w-md",
        isOwn ? "ml-auto justify-end" : "justify-start"
      )}
    >
      {!isOwn && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
          <span className="text-xs font-semibold text-slate-600">
            {senderName.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        <div className="flex items-baseline mb-1 space-x-2">
          {!isOwn && (
            <span className="text-sm font-semibold text-slate-800">
              {senderName}
            </span>
          )}
          <span className="text-xs text-slate-400">{time}</span>
        </div>
        <div
          className={cn(
            "p-3 rounded-2xl text-sm relative shadow-sm",
            isOwn
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
