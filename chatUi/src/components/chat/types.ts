export type Message = {
	id: string;
	text: string;
	sender?: string;
	time?: string;
	type: "CHAT" | "JOIN" | "LEAVE";
};

export type Conversation = {
	id: string;
	title: string;
	lastMessage?: string;
	messages: Message[];
};
