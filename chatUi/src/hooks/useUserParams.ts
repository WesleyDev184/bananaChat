import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

export function useUserParams() {
  const [username, setUsername] = useQueryState(
    "username",
    parseAsString.withDefault("").withOptions({
      clearOnDefault: true,
    })
  );

  const [autoJoin, setAutoJoin] = useQueryState(
    "autoJoin",
    parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    })
  );

  return {
    username,
    setUsername,
    autoJoin,
    setAutoJoin,
  };
}
