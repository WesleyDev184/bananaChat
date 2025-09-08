import ConversationList from "@/components/chat/ConversationList";
import MessageInput from "@/components/chat/MessageInput";
import MessageWindow from "@/components/chat/MessageWindow";
import type { Conversation } from "@/components/chat/types";
import React from "react";

export default function ChatLayout() {
	const [conversations, setConversations] = React.useState<Conversation[]>(
		() => [
			{
				id: "1",
				title: "Alice",
				lastMessage: "Até mais!",
				messages: [
					{ id: "m1", text: "Oi, tudo bem?", time: "09:00", type: "CHAT" },
					{ id: "m2", text: "Sim! E você?", fromMe: true, time: "09:01", type: "CHAT" },
				],
			},
			{
				id: "2",
				title: "Grupo Trabalho",
				lastMessage: "Vou enviar o slide",
				messages: [
					{ id: "m3", text: "Pessoal, reunião às 14h", type: "CHAT" },
					{ id: "m4", text: "Perfeito", fromMe: true, type: "CHAT" },
				],
			},
		],
	);

	const [selectedId, setSelectedId] = React.useState<string | null>(
		conversations[0]?.id ?? null,
	);

	const handleSelect = (id: string) => setSelectedId(id);

	const handleSend = (text: string) => {
		if (!selectedId) return;
		setConversations((prev) =>
			prev.map((c) =>
				c.id === selectedId
					? {
							...c,
							lastMessage: text,
							messages: [
								...c.messages,
								{ id: Date.now().toString(), text, sender: "me", time: "now", type: "CHAT" },
							],
						}
					: c,
			),
		);
	};

	const selected = conversations.find((c) => c.id === selectedId) ?? null;

	return (
		<div className="h-full w-full rounded-lg border bg-background shadow-sm flex overflow-hidden min-h-0">
			<aside className="w-72 min-w-[16rem] border-r bg-muted/50 p-2 overflow-auto min-h-0">
				<ConversationList
					conversations={conversations}
					selectedId={selectedId}
					onSelect={handleSelect}
				/>
			</aside>
			<main className="flex-1 flex flex-col min-h-0">
				<div className="flex-1 overflow-auto p-4 min-h-0">
					<MessageWindow conversation={selected} />
				</div>
				<div className="border-t p-3">
					<MessageInput onSend={handleSend} />
				</div>
			</main>
		</div>
	);
}
