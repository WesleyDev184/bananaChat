// Tipos para integração com o backend
export type ChatMessage = {
	sender: string;
	recipient?: string;
	content: string;
	type: "CHAT" | "JOIN" | "LEAVE";
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

export type ChatType = "global" | "private";

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
	unreadCount?: number;
};
