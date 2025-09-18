import { parseAsString, useQueryState } from "nuqs";

export function useChatParams() {
	const [selectedChat, setSelectedChat] = useQueryState(
		"chat",
		parseAsString.withDefault("global"),
	);

	const [chatType, setChatType] = useQueryState(
		"type",
		parseAsString.withDefault("public").withOptions({
			clearOnDefault: true,
		}),
	);

	return {
		selectedChat,
		setSelectedChat,
		chatType,
		setChatType,
	};
}
