import type { Conversation } from "@/components/chat/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onlineUsersCount,
  currentUsername,
  onLeaveChat,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onlineUsersCount: number;
  currentUsername: string;
  onLeaveChat: () => void;
}) {
  const globalChat = conversations.find((c) => c.id === "global");
  const privateChats = conversations.filter((c) => c.id !== "global");

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Header */}
      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Conversas</h2>
          <Badge variant="secondary" className="text-xs">
            {onlineUsersCount} online
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Conectado como: <strong>{currentUsername}</strong>
        </div>
      </div>

      {/* Chat Global */}
      {globalChat && (
        <div className="px-2">
          <button
            type="button"
            onClick={() => onSelect(globalChat.id)}
            className={`w-full text-left rounded-md p-3 hover:bg-accent/30 transition-colors ${
              globalChat.id === selectedId ? "bg-accent/50 font-medium" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                🌍
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{globalChat.title}</div>
                  {globalChat.unreadCount && globalChat.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs ml-2">
                      {globalChat.unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {globalChat.lastMessage}
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Lista de Usuários Online */}
      <div className="flex-1 overflow-auto">
        {privateChats.length > 0 && (
          <div className="px-2 py-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Usuários Online ({onlineUsersCount})
            </div>
            <div className="space-y-1">
              {privateChats.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={`w-full text-left rounded-md p-3 hover:bg-accent/30 transition-colors ${
                    conversation.id === selectedId
                      ? "bg-accent/50 font-medium"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        👤
                      </div>
                      {conversation.isOnlineUser && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{conversation.title}</div>
                        {conversation.unreadCount &&
                          conversation.unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-xs ml-2"
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {privateChats.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            Nenhum usuário online
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t">
        <Button
          onClick={onLeaveChat}
          variant="outline"
          size="sm"
          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Sair do Chat
        </Button>
      </div>
    </div>
  );
}
