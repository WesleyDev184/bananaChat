import FilterDropdown from "@/components/chat/FilterDropdown";
import UserAvatar from "@/components/chat/UserAvatar";
import type { ChatMessage, ChatType, GroupDto } from "@/components/chat/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Globe, LoaderCircle, Settings, UserPlus, Users } from "lucide-react";
import React from "react";

interface MessageWindowProps {
  messages: ChatMessage[];
  selectedChat: ChatType | string;
  currentUsername: string;
  isAutoUpdating: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  groups?: GroupDto[];
  onAddMember?: (groupId: string) => void;
  onGroupSettings?: (groupId: string) => void;
}

export default function MessageWindow({
  messages,
  selectedChat,
  currentUsername,
  isAutoUpdating,
  messagesEndRef,
  groups = [],
  onAddMember,
  onGroupSettings,
}: MessageWindowProps) {
  // Filtra mensagens baseado no chat selecionado
  const filteredMessages = messages.filter((msg) => {
    if (selectedChat === "global") {
      // Chat global: mensagens sem recipient
      return !msg.recipient;
    } else if (selectedChat.startsWith("group-")) {
      // Chat de grupo: mensagens com recipient igual ao group-X
      return msg.recipient === selectedChat;
    } else {
      // Chat privado: mensagens entre currentUsername e selectedChat
      return (
        (msg.sender === currentUsername && msg.recipient === selectedChat) ||
        (msg.sender === selectedChat && msg.recipient === currentUsername)
      );
    }
  });

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
    } else if (
      typeof selectedChat === "string" &&
      selectedChat.startsWith("group-")
    ) {
      // Buscar o nome do grupo
      const groupId = parseInt(selectedChat.replace("group-", ""));
      const group = groups.find((g) => g.id === groupId);
      return group ? group.name : `Grupo #${groupId}`;
    }
    return selectedChat;
  };

  // Subtítulo do chat
  const getChatSubtitle = () => {
    if (selectedChat === "global") {
      return "Conversa pública";
    } else if (
      typeof selectedChat === "string" &&
      selectedChat.startsWith("group-")
    ) {
      const groupId = parseInt(selectedChat.replace("group-", ""));
      const group = groups.find((g) => g.id === groupId);
      return group
        ? `Grupo ${group.type.toLowerCase()} • ${group.memberCount} membros`
        : "Conversa em grupo";
    }
    return "Conversa privada";
  };

  return (
    <div className="flex flex-col min-h-0 h-full max-h-full overflow-hidden">
      {/* Header do chat */}
      <div className="p-4 bg-muted/50 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {selectedChat === "global" ? (
              <div className="size-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                <Globe className="h-5 w-5" />
              </div>
            ) : selectedChat.startsWith("group-") ? (
              <div className="size-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                <Users className="h-5 w-5" />
              </div>
            ) : (
              <UserAvatar
                username={selectedChat}
                size="md"
                showOnlineIndicator={false}
              />
            )}
            <div>
              <div className="font-semibold flex items-center gap-2">
                {(selectedChat.startsWith("group-") &&
                  (() => {
                    const groupId = selectedChat.split("-")[1];
                    const group = groups?.find(
                      (g) => g.id.toString() === groupId
                    );
                    const isOwner = group?.owner?.username === currentUsername;

                    return isOwner ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="hover:text-primary transition-colors">
                            {getChatTitle()}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => onAddMember?.(groupId)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Adicionar Membros
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onGroupSettings?.(groupId)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Configurações
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span>{getChatTitle()}</span>
                    );
                  })()) ||
                  getChatTitle()}
              </div>
              <div className="text-sm text-muted-foreground">
                {getChatSubtitle()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAutoUpdating && (
              <LoaderCircle className="h-4 w-4 text-blue-600 animate-spin" />
            )}
            <FilterDropdown />
          </div>
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
                  : selectedChat.startsWith("group-")
                  ? `Nenhuma mensagem em ${getChatTitle()} ainda...`
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
