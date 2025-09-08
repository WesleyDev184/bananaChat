import type { Conversation } from "@/components/chat/types";
import { Button } from "@/components/ui/button";

export default function ConversationList({
	conversations,
	selectedId,
	onSelect,
}: {
	conversations: Conversation[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	return (
		<div className="h-full flex flex-col gap-2">
			<div className="px-2 py-1 font-semibold">Conversas</div>
			<div className="flex-1 overflow-auto space-y-2 p-2">
				{conversations.map((c) => (
					<button
						key={c.id}
						type="button"
						onClick={() => onSelect(c.id)}
						className={`w-full text-left rounded-md p-2 hover:bg-accent/30 ${
							c.id === selectedId ? "bg-accent/40 font-medium" : ""
						}`}
					>
						<div className="flex justify-between">
							<div>{c.title}</div>
							<div className="text-xs text-muted-foreground">
								{c.messages.length}
							</div>
						</div>
						<div className="text-sm text-muted-foreground truncate">
							{c.lastMessage}
						</div>
					</button>
				))}
			</div>
			<div className="p-2">
				<Button variant="ghost" size="sm">
					Nova conversa
				</Button>
			</div>
		</div>
	);
}
