import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

export function useUserParams() {
	const [username, setUsername] = useQueryState(
		"user",
		parseAsString.withDefault("").withOptions({
			clearOnDefault: true,
		}),
	);

	const [autoJoin, setAutoJoin] = useQueryState(
		"autojoin",
		parseAsBoolean.withDefault(false).withOptions({
			clearOnDefault: true,
		}),
	);

	return {
		username,
		setUsername,
		autoJoin,
		setAutoJoin,
	};
}
