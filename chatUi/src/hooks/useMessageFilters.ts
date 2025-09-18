import {
	parseAsArrayOf,
	parseAsString,
	parseAsStringEnum,
	useQueryState,
} from "nuqs";

export function useMessageFilters() {
	const [messageTypes, setMessageTypes] = useQueryState(
		"types",
		parseAsArrayOf(parseAsString)
			.withDefault(["CHAT", "JOIN", "LEAVE"])
			.withOptions({
				clearOnDefault: true,
			}),
	);

	const [period, setPeriod] = useQueryState(
		"period",
		parseAsStringEnum(["today", "week", "month", "all"])
			.withDefault("all")
			.withOptions({
				clearOnDefault: true,
			}),
	);

	const [searchTerm, setSearchTerm] = useQueryState(
		"search",
		parseAsString.withDefault("").withOptions({
			clearOnDefault: true,
		}),
	);

	return {
		messageTypes,
		setMessageTypes,
		period,
		setPeriod,
		searchTerm,
		setSearchTerm,
	};
}
