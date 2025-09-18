import ChatNavigation from "@/components/chat/ChatNavigation";
import MessageInput from "@/components/chat/MessageInput";
import MessageWindow from "@/components/chat/MessageWindow";
import type {
  ChatHistoryDto,
  ChatMessage,
  ChatType,
  Conversation,
  CreateGroupRequest,
} from "@/components/chat/types";
import { useChatState } from "@/hooks/useChatState";
import { useGroups } from "@/hooks/useGroups";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api";

export default function ChatLayout() {
  const navigate = useNavigate();
  const { isConnected, stompClient: wsStompClient } = useWebSocketConnection();

  // Hook de grupos
  const {
    groups,
    isLoading: isLoadingGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    refreshGroups,
  } = useGroups();

  // Estados principais
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook customizado que gerencia estado via URL
  const {
    selectedChat,
    setSelectedChat,
    username,
    setUsername,
    autoJoin,
    filterMessages,
  } = useChatState();

  // Handlers para ações de grupo
  const handleCreateGroup = useCallback(
    async (request: CreateGroupRequest) => {
      if (!username) return;

      const group = await createGroup(request, username);
      if (group) {
        // Atualizar lista de grupos
        await refreshGroups(username);
      }
    },
    [createGroup, refreshGroups, username]
  );

  const handleJoinGroup = useCallback(
    async (groupId: number) => {
      if (!username) return;

      const group = await joinGroup(groupId, username);
      if (group) {
        // Atualizar lista de grupos
        await refreshGroups(username);
      }
    },
    [joinGroup, refreshGroups, username]
  );

  const handleLeaveGroup = useCallback(
    async (groupId: number) => {
      if (!username) return;

      const group = await leaveGroup(groupId, username);
      if (group) {
        // Atualizar lista de grupos
        await refreshGroups(username);
        // Se estava no grupo que saiu, voltar para o chat global
        if (selectedChat === `group-${groupId}`) {
          setSelectedChat("global");
        }
      }
    },
    [leaveGroup, refreshGroups, username, selectedChat, setSelectedChat]
  );

  // Verificar se o usuário deve ser redirecionado para login
  useEffect(() => {
    // Só redireciona se não tiver username E não tiver autoJoin
    // Isso permite que usuários acessem o chat diretamente com username na URL
    if (!username && !autoJoin) {
      navigate({
        to: "/login",
        search: { redirectTo: "/" },
      });
    }
  }, [username, autoJoin, navigate]);

  // Auto scroll para a última mensagem
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }, 50);
    }
  }, []);

  // Função para ordenar mensagens por timestamp
  const sortMessagesByTimestamp = useCallback(
    (messages: ChatMessage[]): ChatMessage[] => {
      return [...messages].sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;

        try {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);

          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return !isNaN(dateA.getTime()) ? -1 : 1;
          }

          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error("Erro ao comparar timestamps:", error);
          return 0;
        }
      });
    },
    []
  );

  // Buscar histórico de chat
  const fetchChatHistory = async (
    chatType: ChatType | string = "global"
  ): Promise<ChatMessage[]> => {
    try {
      console.log("Buscando histórico para:", chatType);

      let url = `${API_BASE_URL}/chat/history`;
      if (chatType === "global") {
        url = `${API_BASE_URL}/chat/history/public`;
      } else if (chatType.startsWith("group-")) {
        // Histórico de grupo
        const groupId = chatType.replace("group-", "");
        url = `${API_BASE_URL}/groups/${groupId}/messages?username=${encodeURIComponent(
          username
        )}`;
      } else if (chatType !== "global") {
        // Histórico de chat privado
        url = `${API_BASE_URL}/chat/history/private?user1=${username}&user2=${chatType}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      let convertedMessages: ChatMessage[];

      if (chatType.startsWith("group-")) {
        // Para grupos, a resposta tem estrutura diferente
        const groupMessages = await response.json();
        console.log("Mensagens do grupo recebidas:", groupMessages);
        convertedMessages = groupMessages.map((item: any) => ({
          sender: item.sender?.username || item.sender,
          recipient: `group-${item.groupId}`,
          content: item.content,
          type: item.type as "CHAT" | "JOIN" | "LEAVE",
          timestamp: item.timestamp,
          isNewMessage: false,
        }));
      } else {
        // Para chats normais, mantém a estrutura atual
        const history: ChatHistoryDto[] = await response.json();
        convertedMessages = history.map((item) => ({
          sender: item.sender,
          recipient: item.recipient,
          content: item.content,
          type: item.type as "CHAT" | "JOIN" | "LEAVE",
          timestamp: item.timestamp,
          isNewMessage: false,
        }));
      }

      return sortMessagesByTimestamp(convertedMessages);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  };

  // Função para registrar usuário automaticamente
  const registerUserIfNeeded = useCallback(async (username: string) => {
    try {
      // Verificar se o usuário já existe
      const checkResponse = await fetch(
        `${API_BASE_URL}/users/username/${username}`
      );

      if (checkResponse.status === 404) {
        // Usuário não existe, criar automaticamente
        console.log("Registrando usuário automaticamente:", username);

        const createResponse = await fetch(`${API_BASE_URL}/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            email: `${username}@bananachat.local`, // Email temporário
            password: "temp123", // Senha temporária
            displayName: username,
          }),
        });

        if (createResponse.ok) {
          console.log("Usuário registrado com sucesso:", username);
        } else {
          console.error(
            "Erro ao registrar usuário:",
            await createResponse.text()
          );
        }
      } else if (checkResponse.ok) {
        console.log("Usuário já existe:", username);
      }
    } catch (error) {
      console.error("Erro ao verificar/registrar usuário:", error);
    }
  }, []);

  // Função joinChat
  const joinChat = useCallback(async () => {
    if (!username.trim() || !wsStompClient.current?.connected) {
      return;
    }

    // Registrar usuário no banco se necessário
    await registerUserIfNeeded(username);

    const latestHistory = await fetchChatHistory(selectedChat);
    const sortedHistory = sortMessagesByTimestamp(latestHistory);
    setMessages(sortedHistory);
    setTimeout(() => scrollToBottom(), 200);

    const joinMessage: ChatMessage = {
      sender: username,
      content: `${username} entrou no chat`,
      type: "JOIN",
    };

    try {
      wsStompClient.current.publish({
        destination: "/app/chat.addUser",
        body: JSON.stringify(joinMessage),
      });

      setIsJoined(true);
      console.log("Usuário entrou no chat:", username);

      // Carregar usuários online
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/online`);
          if (response.ok) {
            const users: string[] = await response.json();
            const sortedUsers = users
              .filter((user) => user !== username)
              .sort();
            setOnlineUsers(sortedUsers);
          }
        } catch (error) {
          console.error("Erro ao carregar usuários online:", error);
        }
      }, 1500);
    } catch (error) {
      console.error("Erro ao entrar no chat:", error);
    }
  }, [
    username,
    selectedChat,
    wsStompClient,
    sortMessagesByTimestamp,
    scrollToBottom,
    registerUserIfNeeded,
  ]);

  // Aplicar filtros nas mensagens
  const filteredMessages = useMemo(() => {
    return filterMessages(messages);
  }, [messages, filterMessages]);

  // Auto-join logic
  useEffect(() => {
    if (username && autoJoin && !isJoined && isConnected) {
      joinChat();
    }
  }, [username, autoJoin, isJoined, isConnected, joinChat]);

  // Carregar grupos quando o usuário faz login
  useEffect(() => {
    if (username && isJoined) {
      console.log("🔄 Carregando grupos para usuário:", username);
      refreshGroups(username).then(() => {
        console.log("✅ Grupos recarregados para:", username);
      });
    }
  }, [username, isJoined, refreshGroups]);

  // Configurar subscriptions WebSocket quando conectado e usuário entrou
  useEffect(() => {
    if (!wsStompClient.current?.connected || !isJoined) return;

    // Subscription para mensagens públicas
    const publicSub = wsStompClient.current.subscribe(
      "/topic/public",
      (msg) => {
        try {
          const receivedMessage: ChatMessage = JSON.parse(msg.body);

          // Normalizar timestamp
          if (receivedMessage.timestamp) {
            receivedMessage.timestamp = new Date(
              receivedMessage.timestamp
            ).toISOString();
          } else {
            receivedMessage.timestamp = new Date().toISOString();
          }

          receivedMessage.isNewMessage = true;

          // Atualizar usuários online
          if (
            receivedMessage.type === "JOIN" &&
            receivedMessage.sender !== username
          ) {
            setOnlineUsers((prev) => {
              if (!prev.includes(receivedMessage.sender)) {
                return [...prev, receivedMessage.sender].sort();
              }
              return prev;
            });
          } else if (receivedMessage.type === "LEAVE") {
            setOnlineUsers((prev) =>
              prev.filter((user) => user !== receivedMessage.sender)
            );
          }

          // Adicionar mensagem
          setMessages((prev) => {
            const messageExists = prev.some(
              (existingMsg) =>
                existingMsg.timestamp === receivedMessage.timestamp &&
                existingMsg.sender === receivedMessage.sender &&
                existingMsg.content === receivedMessage.content &&
                existingMsg.type === receivedMessage.type
            );

            if (!messageExists) {
              const newMessages = [...prev, receivedMessage];
              setTimeout(() => scrollToBottom(), 100);
              return sortMessagesByTimestamp(newMessages);
            }
            return prev;
          });
        } catch (error) {
          console.error("Erro ao processar mensagem pública:", error);
        }
      }
    );

    // Subscription para mensagens privadas
    const privateSub = wsStompClient.current.subscribe(
      `/queue/private.${username}`,
      (msg) => {
        try {
          const receivedMessage: ChatMessage = JSON.parse(msg.body);

          if (receivedMessage.timestamp) {
            receivedMessage.timestamp = new Date(
              receivedMessage.timestamp
            ).toISOString();
          } else {
            receivedMessage.timestamp = new Date().toISOString();
          }

          receivedMessage.isNewMessage = true;

          setMessages((prev) => {
            const messageExists = prev.some(
              (existingMsg) =>
                existingMsg.sender === receivedMessage.sender &&
                existingMsg.content === receivedMessage.content &&
                existingMsg.timestamp === receivedMessage.timestamp &&
                existingMsg.recipient === receivedMessage.recipient
            );

            if (!messageExists) {
              const newMessages = [...prev, receivedMessage];
              setTimeout(() => scrollToBottom(), 100);
              return sortMessagesByTimestamp(newMessages);
            }
            return prev;
          });
        } catch (error) {
          console.error("Erro ao processar mensagem privada:", error);
        }
      }
    );

    // Subscription para mensagens de grupo - só para grupos do usuário
    const groupSubs: any[] = [];
    console.log("🔍 Configurando subscriptions para grupos:", groups);
    console.log("🔍 Total de grupos:", groups.length);
    console.log("🔍 Usuário atual:", username);

    groups.forEach((group) => {
      console.log(
        `🔍 Verificando grupo ${group.id} (${group.name}): isMember=${group.isUserMember}, owner=${group.owner?.username}`
      );
      if (group.isUserMember) {
        // Só se inscrever em grupos dos quais o usuário é membro
        const groupTopic = `/topic/group.${group.id}`;
        console.log(`🔗 Tentando inscrever no tópico: ${groupTopic}`);
        const groupSub = wsStompClient.current?.subscribe(groupTopic, (msg) => {
          try {
            console.log(`Mensagem recebida no tópico ${groupTopic}:`, msg.body);
            const receivedGroupMessage = JSON.parse(msg.body);

            // Converter GroupChatMessage para ChatMessage
            const receivedMessage: ChatMessage = {
              sender: receivedGroupMessage.sender,
              content: receivedGroupMessage.content,
              type: receivedGroupMessage.type,
              recipient: `group-${receivedGroupMessage.groupId}`,
              timestamp: receivedGroupMessage.timestamp,
              isNewMessage: true,
            };

            if (receivedMessage.timestamp) {
              receivedMessage.timestamp = new Date(
                receivedMessage.timestamp
              ).toISOString();
            } else {
              receivedMessage.timestamp = new Date().toISOString();
            }

            console.log("Mensagem de grupo convertida:", receivedMessage);

            setMessages((prev) => {
              const messageExists = prev.some(
                (existingMsg) =>
                  existingMsg.sender === receivedMessage.sender &&
                  existingMsg.content === receivedMessage.content &&
                  existingMsg.timestamp === receivedMessage.timestamp &&
                  existingMsg.recipient === receivedMessage.recipient
              );

              if (!messageExists) {
                console.log("Adicionando nova mensagem de grupo ao estado");
                const newMessages = [...prev, receivedMessage];
                setTimeout(() => scrollToBottom(), 100);
                return sortMessagesByTimestamp(newMessages);
              } else {
                console.log("Mensagem de grupo já existe, ignorando");
              }
              return prev;
            });
          } catch (error) {
            console.error("Erro ao processar mensagem de grupo:", error);
          }
        });

        if (groupSub) {
          groupSubs.push(groupSub);
          console.log(
            `✅ Inscrito no grupo ${group.id}: ${group.name} (tópico: ${groupTopic})`
          );
        } else {
          console.error(
            `❌ Falha ao inscrever no grupo ${group.id}: ${group.name}`
          );
        }
      } else {
        console.log(
          `⏭️ Pulando grupo ${group.id} (${group.name}): usuário não é membro`
        );
      }
    });

    return () => {
      publicSub.unsubscribe();
      privateSub.unsubscribe();
      groupSubs.forEach((sub) => sub.unsubscribe());
    };
  }, [
    wsStompClient.current?.connected,
    isJoined,
    username,
    groups.length, // Usar apenas o tamanho da lista, não a referência completa
    // Remover sortMessagesByTimestamp e scrollToBottom das dependências
  ]);

  // Carregar histórico quando mudar o chat selecionado
  useEffect(() => {
    if (isJoined) {
      const loadHistory = async () => {
        const history = await fetchChatHistory(selectedChat);
        setMessages(history);
        setTimeout(() => scrollToBottom(), 150);
      };
      loadHistory();
    }
  }, [selectedChat, isJoined]);

  // Scroll automático sempre que as mensagens mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Sistema de atualização de timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prevMessages) => {
        const now = new Date();
        const updatedMessages = prevMessages.map((msg) => {
          if (msg.isNewMessage && msg.timestamp) {
            try {
              const messageTime = new Date(msg.timestamp);
              const diffInSeconds =
                (now.getTime() - messageTime.getTime()) / 1000;
              const thresholdSeconds =
                msg.type === "JOIN" || msg.type === "LEAVE" ? 15 : 60;

              if (diffInSeconds > thresholdSeconds) {
                return { ...msg, isNewMessage: false };
              }
            } catch (error) {
              return { ...msg, isNewMessage: false };
            }
          }
          return msg;
        });

        const hasChanges = updatedMessages.some(
          (msg, index) => msg.isNewMessage !== prevMessages[index]?.isNewMessage
        );

        return hasChanges ? updatedMessages : prevMessages;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Sincronização periódica dos usuários online
  useEffect(() => {
    if (isJoined && username) {
      const syncUsers = async () => {
        try {
          setIsAutoUpdating(true);
          const response = await fetch(`${API_BASE_URL}/users/online`);
          if (response.ok) {
            const users: string[] = await response.json();
            const filteredUsers = users.filter((user) => user !== username);
            setOnlineUsers((prevUsers) => {
              const prevSet = new Set(prevUsers);
              const newSet = new Set(filteredUsers);
              if (
                prevSet.size !== newSet.size ||
                [...prevSet].some((user) => !newSet.has(user))
              ) {
                return filteredUsers.sort();
              }
              return prevUsers;
            });
          }
        } catch (error) {
          console.error("Erro na sincronização de usuários:", error);
        } finally {
          setIsAutoUpdating(false);
        }
      };

      syncUsers();
      const interval = setInterval(syncUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [isJoined, username]);

  // Enviar mensagem
  const sendMessage = (messageInput: string) => {
    if (!messageInput.trim() || !wsStompClient.current?.connected) return;

    const message: ChatMessage = {
      sender: username,
      content: messageInput,
      type: "CHAT",
    };

    try {
      if (selectedChat === "global") {
        console.log("Enviando mensagem global:", message);
        wsStompClient.current.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify(message),
        });
      } else if (selectedChat.startsWith("group-")) {
        // Enviar mensagem para grupo
        const groupId = selectedChat.replace("group-", "");
        const groupMessage = {
          sender: username,
          content: messageInput,
          type: "CHAT",
          groupId: parseInt(groupId),
          timestamp: new Date().toISOString(),
        };
        console.log(
          "Enviando mensagem de grupo:",
          groupMessage,
          "para destino: /app/group.sendMessage"
        );
        wsStompClient.current.publish({
          destination: "/app/group.sendMessage",
          body: JSON.stringify(groupMessage),
        });
      } else {
        // Enviar mensagem privada
        message.recipient = selectedChat as string;
        console.log("Enviando mensagem privada:", message);
        wsStompClient.current.publish({
          destination: "/app/chat.sendPrivateMessage",
          body: JSON.stringify(message),
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Sair do chat
  const leaveChat = () => {
    if (wsStompClient.current?.connected) {
      const leaveMessage: ChatMessage = {
        sender: username,
        content: `${username} saiu do chat`,
        type: "LEAVE",
      };

      wsStompClient.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(leaveMessage),
      });
    }
    setIsJoined(false);
    setUsername("");
    setMessages([]);
    setOnlineUsers([]);
    setSelectedChat("global");

    // Redirecionar para login
    navigate({ to: "/login" });
  };

  // Criar conversas para o ConversationList
  const conversations: Conversation[] = [
    {
      id: "global",
      title: "Chat Global",
      lastMessage:
        filteredMessages.filter((m) => !m.recipient).slice(-1)[0]?.content ||
        "Seja bem-vindo!",
      messages: [],
      unreadCount:
        selectedChat === "global"
          ? 0
          : filteredMessages.filter(
              (m) => !m.recipient && m.isNewMessage && m.sender !== username
            ).length,
    },
    ...onlineUsers.map((user) => ({
      id: user,
      title: user,
      lastMessage:
        filteredMessages
          .filter(
            (m) =>
              (m.sender === user && m.recipient === username) ||
              (m.sender === username && m.recipient === user)
          )
          .slice(-1)[0]?.content || "Iniciar conversa...",
      messages: [],
      isOnlineUser: true,
      unreadCount:
        selectedChat === user
          ? 0
          : filteredMessages.filter(
              (m) =>
                m.sender === user && m.recipient === username && m.isNewMessage
            ).length,
    })),
  ];

  // Filtrar mensagens por chat selecionado
  const getMessagesForChat = (chatId: string) => {
    if (chatId === "global") {
      return filteredMessages.filter((m) => !m.recipient);
    } else if (chatId.startsWith("group-")) {
      return filteredMessages.filter((m) => m.recipient === chatId);
    } else {
      return filteredMessages.filter(
        (m) =>
          (m.sender === chatId && m.recipient === username) ||
          (m.sender === username && m.recipient === chatId)
      );
    }
  };

  // Mensagens para o chat atual
  const currentChatMessages = getMessagesForChat(selectedChat);

  // Se o usuário não tem username, mostra loading enquanto redireciona
  if (!username) {
    return (
      <div className="h-full w-full rounded-lg border bg-background shadow-sm flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Redirecionando para login...
          </div>
        </div>
      </div>
    );
  }

  // Interface principal do chat
  return (
    <div className="max-h-full w-full h-full rounded-lg border bg-background shadow-sm flex overflow-hidden">
      <aside className="w-72 min-w-[16rem] border-r bg-muted p-2 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <ChatNavigation
            conversations={conversations}
            groups={groups}
            selectedId={selectedChat.toString()}
            onSelect={setSelectedChat}
            onSelectGroup={(groupId) => setSelectedChat(`group-${groupId}`)}
            onlineUsersCount={onlineUsers.length}
            currentUsername={username}
            onLeaveChat={leaveChat}
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            isLoadingGroups={isLoadingGroups}
          />
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageWindow
            messages={currentChatMessages}
            selectedChat={selectedChat}
            currentUsername={username}
            isAutoUpdating={isAutoUpdating}
            messagesEndRef={messagesEndRef}
            groups={groups}
          />
        </div>
        <div className="border-t p-3 flex-shrink-0">
          <MessageInput onSend={sendMessage} />
        </div>
      </main>
    </div>
  );
}
