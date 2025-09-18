import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

export function useLoginParams() {
  const [username, setUsername] = useQueryState(
    "username",
    parseAsString.withDefault("")
  );

  const [autoConnect, setAutoConnect] = useQueryState(
    "autoConnect",
    parseAsBoolean.withDefault(false)
  );

  const [redirectTo, setRedirectTo] = useQueryState(
    "redirectTo",
    parseAsString.withDefault("/")
  );

  return {
    username,
    setUsername,
    autoConnect,
    setAutoConnect,
    redirectTo,
    setRedirectTo,
  };
}
