import type { ChatMessage, ChatType } from "@/components/chat/types";
import UserAvatar from "@/components/chat/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import React from "react";

interface MessageWindowProps {
  messages: ChatMessage[];
  selectedChat: ChatType | string;
  currentUsername: string;
  isAutoUpdating: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageWindow({
  messages,
  selectedChat,
  currentUsername,
  isAutoUpdating,
  messagesEndRef,
}: MessageWindowProps) {
  // Filtra mensagens baseado no chat selecionado
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

  // Debug: log da ordem final no componente
  React.useEffect(() => {
    if (filteredMessages.length > 0) {
      console.log(
        `🎯 MessageWindow - ${selectedChat} - Ordem final das mensagens:`,
        filteredMessages.map((m) => ({
          type: m.type,
          content: m.content.substring(0, 25),
          timestamp: m.timestamp,
          sender: m.sender,
        }))
      );
    }
  }, [filteredMessages, selectedChat]);

  // Formatar timestamp com tratamento especial para mensagens de sistema
  const formatTimestamp = (
    timestamp?: string,
    isNewMessage?: boolean,
    messageType?: string
  ) => {
    if (!timestamp) return "";

    if (isNewMessage) {
      // Para mensagens de sistema, mostra "agora" por menos tempo
      if (messageType === "JOIN" || messageType === "LEAVE") {
        return "agora";
      }
      return "agora";
    }

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

      // Se foi há menos de 1 minuto, mostra "agora"
      if (diffInMinutes < 1) {
        return "agora";
      }

      // Se foi no mesmo dia, mostra apenas horário
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Se foi em outro dia, mostra data e horário
      return date.toLocaleString("pt-BR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Renderizar uma mensagem
  const renderMessage = (msg: ChatMessage, idx: number) => {
    const isOwnMessage = msg.sender === currentUsername;
    const isSystemMessage = msg.type === "JOIN" || msg.type === "LEAVE";

    return (
      <div
        key={`${msg.timestamp || Date.now()}-${msg.sender}-${idx}`}
        className={`flex ${
          isOwnMessage && !isSystemMessage ? "justify-end" : "justify-start"
        } mb-4 gap-2`}
      >
        {/* Avatar para mensagens de outros usuários */}
        {!isSystemMessage && !isOwnMessage && (
          <UserAvatar
            username={msg.sender}
            size="sm"
            className="mt-1 flex-shrink-0"
          />
        )}

        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            isSystemMessage
              ? "bg-muted/30 text-muted-foreground mx-auto text-center"
              : isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
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
                  {formatTimestamp(msg.timestamp, msg.isNewMessage, msg.type)}
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
              {formatTimestamp(msg.timestamp, msg.isNewMessage, msg.type)}
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
      <div className="p-4 bg-muted/50 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {selectedChat === "global" ? (
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                🌍
              </div>
            ) : (
              <UserAvatar
                username={selectedChat}
                size="sm"
                showOnlineIndicator={false}
              />
            )}
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
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
            >
              🔄 Sincronizando...
            </Badge>
          )}
        </div>
        <Separator className="mt-4" />
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
