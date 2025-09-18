// Tipos para integração com o backend
export type ChatMessage = {
  sender: string;
  recipient?: string;
  content: string;
  type: "CHAT" | "JOIN" | "LEAVE";
  timestamp?: string;
  isNewMessage?: boolean;
};

export type GroupChatMessage = {
  sender: string;
  groupId: number;
  groupName?: string;
  content: string;
  type:
    | "CHAT"
    | "JOIN"
    | "LEAVE"
    | "GROUP_CREATED"
    | "GROUP_UPDATED"
    | "MEMBER_ADDED"
    | "MEMBER_REMOVED"
    | "SYSTEM";
  timestamp?: string;
  isNewMessage?: boolean;
};

export type ChatHistoryDto = {
  sender: string;
  recipient?: string;
  content: string;
  type: string;
  timestamp: string;
};

export type GroupMessageDto = {
  id: number;
  content: string;
  type: string;
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
  sender: UserDto;
  groupId: number;
  groupName: string;
};

export type UserDto = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
};

export type GroupDto = {
  id: number;
  name: string;
  description?: string;
  type: "PUBLIC" | "PRIVATE" | "RESTRICTED";
  maxMembers: number;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: UserDto;
  members: UserDto[];
  isUserMember?: boolean;
  isUserOwner?: boolean;
};

export type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
  displayName?: string;
};

export type CreateGroupRequest = {
  name: string;
  description?: string;
  type?: "PUBLIC" | "PRIVATE" | "RESTRICTED";
  maxMembers?: number;
};

export type ChatType = "global" | "private" | "group";

export type ConnectionStatus =
  | "Conectando..."
  | "Conectado"
  | "Desconectado"
  | "Erro STOMP"
  | "Erro WebSocket";

// Tipos originais (compatibilidade)
export type Message = {
  id: string;
  text: string;
  sender?: string;
  time?: string;
  type: "CHAT" | "JOIN" | "LEAVE";
  fromMe?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  lastMessage?: string;
  messages: Message[];
  isOnlineUser?: boolean;
  isGroup?: boolean;
  groupInfo?: GroupDto;
  unreadCount?: number;
};
