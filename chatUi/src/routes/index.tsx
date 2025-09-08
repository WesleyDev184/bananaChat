import ChatLayout from "@/components/chat/ChatLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<div className="flex-1 flex items-stretch w-full p-2">
			<ChatLayout />
		</div>
	);
}
