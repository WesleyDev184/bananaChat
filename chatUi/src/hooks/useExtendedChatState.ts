import type { ChatMessage, GroupMessageDto } from "@/components/chat/types";
import { useChatParams } from "./useChatParams";
import { useGroups } from "./useGroups";
import { useMessageFilters } from "./useMessageFilters";
import { useUserParams } from "./useUserParams";

export function useExtendedChatState() {
  const chatParams = useChatParams();
  const userParams = useUserParams();
  const messageFilters = useMessageFilters();
  const groupsHook = useGroups();

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

  // Função para filtrar mensagens de grupo
  const filterGroupMessages = (
    messages: GroupMessageDto[]
  ): GroupMessageDto[] => {
    return messages.filter((msg) => {
      // Filtro por tipo de mensagem (adaptar os tipos)
      const validTypes = messageFilters.messageTypes.map((type) =>
        type.toUpperCase()
      );
      if (!validTypes.includes(msg.type)) return false;

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

  // Determinar o tipo de chat atual
  const getChatType = () => {
    if (chatParams.selectedChat === "global") return "global";
    if (
      typeof chatParams.selectedChat === "string" &&
      chatParams.selectedChat.startsWith("group-")
    )
      return "group";
    return "private";
  };

  // Obter ID do grupo se estiver em um chat de grupo
  const getGroupId = () => {
    if (
      typeof chatParams.selectedChat === "string" &&
      chatParams.selectedChat.startsWith("group-")
    ) {
      return parseInt(chatParams.selectedChat.replace("group-", ""));
    }
    return null;
  };

  return {
    ...chatParams,
    ...userParams,
    ...messageFilters,
    ...groupsHook,
    filterMessages,
    filterGroupMessages,
    getChatType,
    getGroupId,
  };
}
