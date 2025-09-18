import type { ChatMessage, ChatType } from "@/components/chat/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MessageWindow({
  messages,
  selectedChat,
  currentUsername,
  isAutoUpdating,
  messagesEndRef,
}: {
  messages: ChatMessage[];
  selectedChat: ChatType | string;
  currentUsername: string;
  isAutoUpdating: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Filtrar mensagens baseado no chat selecionado
  const filteredMessages = messages.filter((msg) => {
    if (selectedChat === "global") {
      // Chat global: mensagens sem recipient
      return !msg.recipient;
    } else {
      // Chat privado: mensagens entre currentUsername e selectedChat
      return (
        (msg.sender === currentUsername && msg.recipient === selectedChat) ||
        (msg.sender === selectedChat && msg.recipient === currentUsername)
      );
    }
  });

  // Formatar timestamp
  const formatTimestamp = (timestamp?: string, isNewMessage?: boolean) => {
    if (!timestamp) return "";

    if (isNewMessage) {
      return "agora";
    }

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Renderizar mensagem
  const renderMessage = (msg: ChatMessage, idx: number) => {
    const isSystemMessage = msg.type === "JOIN" || msg.type === "LEAVE";
    const isOwnMessage = msg.sender === currentUsername && msg.type === "CHAT";

    return (
      <div
        key={`${msg.timestamp || Date.now()}-${msg.sender}-${idx}`}
        className={`flex ${
          isSystemMessage
            ? "justify-center"
            : isOwnMessage
            ? "justify-end"
            : "justify-start"
        } mb-3`}
      >
        <div
          className={`max-w-[70%] min-w-[120px] rounded-lg p-3 ${
            isSystemMessage
              ? "bg-muted text-muted-foreground text-center italic text-sm"
              : isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {!isSystemMessage && (
            <div className="flex justify-between items-start gap-3 mb-2">
              <div
                className={`text-sm font-semibold flex-shrink-0 ${
                  isOwnMessage
                    ? "text-primary-foreground/90"
                    : "text-foreground/90"
                }`}
              >
                {msg.sender}
              </div>
              {msg.timestamp && (
                <div
                  className={`text-xs flex-shrink-0 mt-0.5 ${
                    isOwnMessage
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatTimestamp(msg.timestamp, msg.isNewMessage)}
                </div>
              )}
            </div>
          )}

          <div
            className={`${
              isSystemMessage ? "text-muted-foreground" : ""
            } break-words`}
          >
            {msg.content}
          </div>

          {isSystemMessage && msg.timestamp && (
            <div className="text-xs text-muted-foreground/60 mt-2">
              {formatTimestamp(msg.timestamp, msg.isNewMessage)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Título do chat
  const getChatTitle = () => {
    if (selectedChat === "global") {
      return "Chat Global";
    }
    return `Chat com ${selectedChat}`;
  };

  return (
    <div className="flex flex-col min-h-0 h-full max-h-full overflow-hidden">
      {/* Header do chat */}
      <div className="border-b p-4 bg-muted/50 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20">
              {selectedChat === "global" ? "🌍" : "👤"}
            </div>
            <div>
              <div className="font-semibold">{getChatTitle()}</div>
              <div className="text-sm text-muted-foreground">
                {selectedChat === "global"
                  ? "Conversa pública"
                  : `Conversa privada`}
              </div>
            </div>
          </div>
          {isAutoUpdating && (
            <Badge variant="secondary" className="text-xs">
              Sincronizando...
            </Badge>
          )}
        </div>
      </div>

      {/* Área de mensagens com ScrollArea */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4 pb-2">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-8">
                {selectedChat === "global"
                  ? "Nenhuma mensagem no chat global ainda..."
                  : `Inicie uma conversa com ${selectedChat}`}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map(renderMessage)}
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
