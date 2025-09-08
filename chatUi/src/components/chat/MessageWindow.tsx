import type { Conversation, Message } from "@/components/chat/types";

export default function MessageWindow({
	conversation,
}: {
	conversation: Conversation | null;
}) {
	if (!conversation) {
		return (
			<div className="text-center text-muted-foreground">
				Nenhuma conversa selecionada
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="p-2 border-b">
				<div className="font-semibold">{conversation.title}</div>
				<div className="text-sm text-muted-foreground">
					{conversation.lastMessage}
				</div>
			</div>

			<div className="p-2 flex flex-col gap-2">
				{conversation.messages.map((m: Message) => (
					<div
						key={m.id}
						className={`max-w-[70%] rounded-md p-2 ${m.sender === "me" ? "bg-primary text-primary-foreground ml-auto" : "bg-popover text-popover-foreground"}`}
					>
						<div className="text-sm">{m.text}</div>
						{m.time && (
							<div
								className={`text-xs mt-1 ${m.sender === "me" ? "text-primary-foreground/50" : "text-muted-foreground"}`}
							>
								{m.time}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
