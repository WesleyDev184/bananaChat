import CreateGroupDialog from "@/components/chat/CreateGroupDialog";
import GroupList from "@/components/chat/GroupList";
import type {
  Conversation,
  CreateGroupRequest,
  GroupDto,
} from "@/components/chat/types";
import UserAvatar from "@/components/chat/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, MessageCircle, Search, Users } from "lucide-react";
import { useState } from "react";

interface ChatNavigationProps {
  conversations: Conversation[];
  groups: GroupDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSelectGroup: (groupId: number) => void;
  onlineUsersCount: number;
  currentUsername: string;
  onLeaveChat: () => void;
  onCreateGroup: (request: CreateGroupRequest) => Promise<void>;
  onJoinGroup: (groupId: number) => Promise<void>;
  onLeaveGroup: (groupId: number) => Promise<void>;
  isLoadingGroups: boolean;
}

export default function ChatNavigation({
  conversations,
  groups,
  selectedId,
  onSelect,
  onSelectGroup,
  onlineUsersCount,
  currentUsername,
  onLeaveChat,
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
  isLoadingGroups,
}: ChatNavigationProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("chats");

  const globalChat = conversations.find((c) => c.id === "global");
  const privateChats = conversations.filter((c) => c.id !== "global");

  // Filtrar grupos baseado na pesquisa
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar conversas baseado na pesquisa
  const filteredConversations = privateChats.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedGroupId =
    selectedId && selectedId.startsWith("group-")
      ? parseInt(selectedId.replace("group-", ""))
      : undefined;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">BananaChat</h2>
          <Badge
            variant="secondary"
            className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
          >
            🟢 {onlineUsersCount} online
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mb-3">
          Conectado como: <strong>{currentUsername}</strong>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas ou grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      <Separator />

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-3 py-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversas
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupos
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Global sempre visível */}
        {globalChat && (
          <div className="px-3 mb-2">
            <button
              type="button"
              onClick={() => onSelect(globalChat.id)}
              className={`w-full text-left rounded-md p-3 hover:bg-accent/30 transition-colors ${
                globalChat.id === selectedId ? "bg-accent/50 font-medium" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  <Globe className="h-5 w-5" />
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

        <Separator />

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="chats" className="h-full mt-0">
            <div className="h-full overflow-auto">
              {filteredConversations.length > 0 ? (
                <div className="px-3 py-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Usuários Online ({onlineUsersCount})
                  </div>
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
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
                          <UserAvatar
                            username={conversation.title}
                            isOnline={conversation.isOnlineUser}
                            showOnlineIndicator={true}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">
                                {conversation.title}
                              </div>
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
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm
                    ? "Nenhuma conversa encontrada"
                    : "Nenhum usuário online"}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="h-full mt-0">
            <div className="h-full flex flex-col">
              {/* Create Group Button */}
              <div className="px-3 py-2">
                <CreateGroupDialog
                  onCreateGroup={onCreateGroup}
                  isLoading={isLoadingGroups}
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <GroupList
                  groups={filteredGroups}
                  currentUsername={currentUsername}
                  selectedGroupId={selectedGroupId}
                  onSelectGroup={onSelectGroup}
                  onJoinGroup={onJoinGroup}
                  onLeaveGroup={onLeaveGroup}
                  isLoading={isLoadingGroups}
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <div className="p-3">
        <Separator className="mb-3" />
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
