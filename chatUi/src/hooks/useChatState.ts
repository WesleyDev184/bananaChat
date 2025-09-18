import type { ChatMessage } from "@/components/chat/types";
import { useChatParams } from "./useChatParams";
import { useMessageFilters } from "./useMessageFilters";
import { useUserParams } from "./useUserParams";

export function useChatState() {
	const chatParams = useChatParams();
	const userParams = useUserParams();
	const messageFilters = useMessageFilters();

	// Função para filtrar mensagens baseado nos parâmetros da URL
	const filterMessages = (messages: ChatMessage[]): ChatMessage[] => {
		return messages.filter((msg) => {
			// Filtro por tipo de mensagem
			if (!messageFilters.messageTypes.includes(msg.type)) return false;

			// Filtro por período
			if (messageFilters.period !== "all" && msg.timestamp) {
				const msgDate = new Date(msg.timestamp);
				const now = new Date();

				switch (messageFilters.period) {
					case "today":
						if (msgDate.toDateString() !== now.toDateString()) return false;
						break;
					case "week":
						if (now.getTime() - msgDate.getTime() > 7 * 24 * 60 * 60 * 1000)
							return false;
						break;
					case "month":
						if (now.getTime() - msgDate.getTime() > 30 * 24 * 60 * 60 * 1000)
							return false;
						break;
				}
			}

			// Filtro por busca
			if (
				messageFilters.searchTerm &&
				!msg.content
					.toLowerCase()
					.includes(messageFilters.searchTerm.toLowerCase())
			) {
				return false;
			}

			return true;
		});
	};

	return {
		...chatParams,
		...userParams,
		...messageFilters,
		filterMessages,
	};
}
