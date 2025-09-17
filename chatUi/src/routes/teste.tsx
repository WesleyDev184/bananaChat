import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client } from "@stomp/stompjs";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

const WEBSOCKET_URL = "http://localhost:8080/ws-chat";
const API_BASE_URL = "http://localhost:8080/api";

export const Route = createFileRoute("/teste")({
  component: Chat,
});

type ChatMessage = {
  sender: string;
  recipient?: string;
  content: string;
  type: "CHAT" | "JOIN" | "LEAVE";
  timestamp?: string;
  isNewMessage?: boolean;
};

type ChatHistoryDto = {
  sender: string;
  recipient?: string;
  content: string;
  type: string;
  timestamp: string;
};

type ChatType = "global" | "private";

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Desconectado");
  const [username, setUsername] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | string>("global");

  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // useEffect para converter mensagens "novas" para mostrarem o horário real após 1 minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) => {
          // Se a mensagem está marcada como nova e tem mais de 1 minuto
          if (msg.isNewMessage && msg.timestamp) {
            const messageTime = new Date(msg.timestamp);
            const now = new Date();
            const diffInMinutes =
              (now.getTime() - messageTime.getTime()) / (1000 * 60);

            // Se passou mais de 1 minuto, remove a flag de nova
            if (diffInMinutes > 1) {
              return { ...msg, isNewMessage: false };
            }
          }
          return msg;
        });

        // Só atualiza se houve mudanças
        const hasChanges = updatedMessages.some(
          (msg, index) => msg.isNewMessage !== prevMessages[index].isNewMessage
        );

        return hasChanges ? updatedMessages : prevMessages;
      });
    }, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  // Função para ordenar mensagens por timestamp
  const sortMessagesByTimestamp = useCallback(
    (messages: ChatMessage[]): ChatMessage[] => {
      return [...messages].sort((a, b) => {
        // Se uma mensagem não tem timestamp, coloca ela no final
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;

        // Compara os timestamps
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);

        return dateA.getTime() - dateB.getTime();
      });
    },
    []
  );

  // Auto scroll para a última mensagem
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // Fallback: scroll direto no container se a ref não funcionar
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  // Scroll automático sempre que as mensagens mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100); // Pequeno delay para garantir que o DOM foi atualizado

    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Função para recarregar histórico manualmente
  const refreshHistory = async () => {
    const historyMessages = await fetchChatHistory(selectedChat);
    // Garante que o histórico está ordenado
    const sortedHistory = sortMessagesByTimestamp(historyMessages);
    setMessages(sortedHistory);
    // Força o scroll após atualizar manualmente
    setTimeout(() => scrollToBottom(), 150);
  };

  // Atualização automática do histórico a cada 30 segundos quando o usuário está no chat
  useEffect(() => {
    if (!isJoined) return;

    const intervalId = setInterval(async () => {
      console.log("Atualizando histórico automaticamente...");
      setIsAutoUpdating(true);
      try {
        const latestHistory = await fetchChatHistory(selectedChat);
        setMessages((prevMessages) => {
          // Verifica se há novas mensagens para evitar atualizações desnecessárias
          if (latestHistory.length !== prevMessages.length) {
            console.log("Novas mensagens encontradas, atualizando...");
            // Garante que as mensagens estão ordenadas
            const sortedHistory = sortMessagesByTimestamp(latestHistory);
            // Força o scroll após a atualização
            setTimeout(() => scrollToBottom(), 150);
            return sortedHistory;
          }
          return prevMessages;
        });
      } catch (error) {
        console.error("Erro na atualização automática do histórico:", error);
      } finally {
        setIsAutoUpdating(false);
      }
    }, 30000); // 30 segundos

    return () => {
      clearInterval(intervalId);
    };
  }, [isJoined, selectedChat, sortMessagesByTimestamp, scrollToBottom]);

  // Atualiza histórico quando a janela volta ao foco
  useEffect(() => {
    if (!isJoined) return;

    const handleFocus = async () => {
      console.log("Janela voltou ao foco, atualizando histórico...");
      setIsAutoUpdating(true);
      try {
        const latestHistory = await fetchChatHistory(selectedChat);
        // Garante que as mensagens estão ordenadas
        const sortedHistory = sortMessagesByTimestamp(latestHistory);
        setMessages(sortedHistory);
        // Força o scroll após carregar o histórico
        setTimeout(() => scrollToBottom(), 150);
      } catch (error) {
        console.error("Erro ao atualizar histórico no foco:", error);
      } finally {
        setIsAutoUpdating(false);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [isJoined, selectedChat, sortMessagesByTimestamp, scrollToBottom]);

  // Buscar histórico de chat
  const fetchChatHistory = async (
    chatType: ChatType | string = "global"
  ): Promise<ChatMessage[]> => {
    try {
      setIsLoadingHistory(true);
      console.log("Buscando histórico para:", chatType);

      let url = `${API_BASE_URL}/chat/history`;
      if (chatType === "global") {
        url = `${API_BASE_URL}/chat/history/public`;
      } else if (chatType !== "global") {
        // Chat privado com usuário específico
        url = `${API_BASE_URL}/chat/history/private?user1=${username}&user2=${chatType}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const history: ChatHistoryDto[] = await response.json();
      console.log("Histórico recebido:", history);

      // Converte o formato do histórico para o formato das mensagens
      const convertedMessages: ChatMessage[] = history.map((item) => ({
        sender: item.sender,
        recipient: item.recipient,
        content: item.content,
        type: item.type as "CHAT" | "JOIN" | "LEAVE",
        timestamp: item.timestamp,
        isNewMessage: false, // Mensagens do histórico não são novas
      }));

      // Ordena as mensagens por timestamp
      const sortedMessages = sortMessagesByTimestamp(convertedMessages);

      console.log("Mensagens convertidas e ordenadas:", sortedMessages);
      return sortedMessages;
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Conectar ao WebSocket
  useEffect(() => {
    const initializeChat = async () => {
      console.log("Inicializando chat...");
      setConnectionStatus("Conectando...");

      const socket = new SockJS(WEBSOCKET_URL);
      stompClient.current = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          console.log("Conectado ao STOMP");
          setConnectionStatus("Conectado");

          if (stompClient.current) {
            // Subscreve ao tópico público
            stompClient.current.subscribe("/topic/public", (msg) => {
              console.log("Mensagem pública recebida:", msg.body);
              try {
                const receivedMessage: ChatMessage = JSON.parse(msg.body);
                if (!receivedMessage.timestamp) {
                  receivedMessage.timestamp = new Date().toISOString();
                }
                receivedMessage.isNewMessage = true;

                // Atualizar lista de usuários online baseado em mensagens JOIN/LEAVE
                // IMPORTANTE: Isso SEMPRE é processado, independente do chat selecionado
                if (receivedMessage.type === "JOIN") {
                  // Para outros usuários, adiciona à lista
                  if (receivedMessage.sender !== username) {
                    setOnlineUsers((prev) => {
                      if (!prev.includes(receivedMessage.sender)) {
                        console.log(
                          "✅ Usuário entrou:",
                          receivedMessage.sender
                        );
                        return [...prev, receivedMessage.sender].sort();
                      }
                      return prev;
                    });
                  } else {
                    // Se é o próprio usuário reconectando, sincroniza a lista
                    console.log(
                      "🔄 Reconexão detectada, sincronizando usuários..."
                    );
                    setTimeout(async () => {
                      try {
                        const response = await fetch(
                          `${API_BASE_URL}/users/online`
                        );
                        if (response.ok) {
                          const users: string[] = await response.json();
                          setOnlineUsers(
                            users.filter((user) => user !== username).sort()
                          );
                        }
                      } catch (error) {
                        console.error("Erro na sincronização:", error);
                      }
                    }, 1000);
                  }
                } else if (receivedMessage.type === "LEAVE") {
                  setOnlineUsers((prev) => {
                    const filtered = prev.filter(
                      (user) => user !== receivedMessage.sender
                    );
                    console.log("❌ Usuário saiu:", receivedMessage.sender);
                    return filtered;
                  });
                }

                // Só adiciona às MENSAGENS se estivermos no chat global
                if (selectedChat === "global") {
                  setMessages((prev) => {
                    const newMessages = [...prev, receivedMessage];
                    const sortedMessages = sortMessagesByTimestamp(newMessages);
                    setTimeout(() => scrollToBottom(), 100);
                    return sortedMessages;
                  });
                }
              } catch (error) {
                console.error("Erro ao parsear mensagem pública:", error);
              }
            });
          }
        },
        onStompError: (frame) => {
          console.error("Erro STOMP:", frame);
          setConnectionStatus("Erro STOMP");
        },
        onWebSocketError: (error) => {
          console.error("Erro WebSocket:", error);
          setConnectionStatus("Erro WebSocket");
        },
        onDisconnect: () => {
          console.log("Desconectado");
          setConnectionStatus("Desconectado");
        },
      });

      stompClient.current.activate();
    };

    initializeChat();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [scrollToBottom, sortMessagesByTimestamp]); // Removido selectedChat das dependências!

  // Subscribir à queue privada quando o usuário entrar
  useEffect(() => {
    if (stompClient.current?.connected && isJoined && username) {
      const privateQueue = `/queue/private.${username}`;
      console.log("Subscrevendo à queue privada:", privateQueue);

      const subscription = stompClient.current.subscribe(
        privateQueue,
        (msg) => {
          console.log("Mensagem privada recebida:", msg.body);
          try {
            const receivedMessage: ChatMessage = JSON.parse(msg.body);
            if (!receivedMessage.timestamp) {
              receivedMessage.timestamp = new Date().toISOString();
            }
            receivedMessage.isNewMessage = true;

            // Só adiciona se estivermos no chat privado com o remetente
            if (selectedChat === receivedMessage.sender) {
              setMessages((prev) => {
                const newMessages = [...prev, receivedMessage];
                const sortedMessages = sortMessagesByTimestamp(newMessages);
                setTimeout(() => scrollToBottom(), 100);
                return sortedMessages;
              });
            }
          } catch (error) {
            console.error("Erro ao parsear mensagem privada:", error);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [
    stompClient.current?.connected,
    isJoined,
    username,
    selectedChat,
    scrollToBottom,
    sortMessagesByTimestamp,
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

  // Sincronização periódica leve dos usuários online (a cada 30s)
  useEffect(() => {
    if (isJoined && username) {
      const syncUsers = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/online`);
          if (response.ok) {
            const users: string[] = await response.json();
            const filteredUsers = users.filter((user) => user !== username);

            // Só atualiza se houver diferença para evitar re-renders desnecessários
            setOnlineUsers((prevUsers) => {
              const prevSet = new Set(prevUsers);
              const newSet = new Set(filteredUsers);

              if (
                prevSet.size !== newSet.size ||
                [...prevSet].some((user) => !newSet.has(user))
              ) {
                console.log(
                  "✅ Lista de usuários online atualizada:",
                  filteredUsers
                );
                return filteredUsers.sort();
              }
              return prevUsers;
            });
          }
        } catch (error) {
          console.error("Erro na sincronização de usuários:", error);
        }
      };

      // Sincroniza imediatamente e depois a cada 30 segundos
      syncUsers();
      const interval = setInterval(syncUsers, 30000);

      return () => clearInterval(interval);
    }
  }, [isJoined, username]);

  // Entrar no chat
  const joinChat = async () => {
    if (!username.trim()) {
      alert("Por favor, digite um nome de usuário");
      return;
    }

    if (!stompClient.current || !stompClient.current.connected) {
      alert("Conexão WebSocket não estabelecida");
      return;
    }

    // Atualiza o histórico automaticamente quando o usuário entra
    console.log("Atualizando histórico antes de entrar no chat...");
    const latestHistory = await fetchChatHistory(selectedChat);
    // Garante que o histórico está ordenado
    const sortedHistory = sortMessagesByTimestamp(latestHistory);
    setMessages(sortedHistory);
    // Força o scroll após carregar o histórico inicial
    setTimeout(() => scrollToBottom(), 200);

    const joinMessage: ChatMessage = {
      sender: username,
      content: `${username} entrou no chat`,
      type: "JOIN",
      timestamp: new Date().toISOString(),
      isNewMessage: true,
    };

    try {
      // Primeiro envia a mensagem JOIN
      console.log("📤 Enviando mensagem JOIN:", joinMessage);
      stompClient.current.publish({
        destination: "/app/chat.addUser",
        body: JSON.stringify(joinMessage),
      });

      setIsJoined(true);
      console.log("✅ Usuário entrou no chat:", username);

      // Depois carrega lista inicial de usuários online
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/online`);
          if (response.ok) {
            const users: string[] = await response.json();

            // Garante que o usuário atual está na lista do backend
            if (!users.includes(username)) {
              console.log(
                "⚠️ PROBLEMA: Usuário",
                username,
                "não encontrado na lista do backend!"
              );
              console.log("⚠️ Lista do backend:", users);
              console.log(
                "⚠️ Isso indica que a mensagem JOIN pode não ter chegado!"
              );
            } else {
              console.log(
                "✅ Usuário",
                username,
                "está corretamente na lista do backend"
              );
            }

            const sortedUsers = users
              .filter((user) => user !== username)
              .sort();
            setOnlineUsers(sortedUsers);
            console.log(
              "📋 Lista inicial de usuários online carregada:",
              sortedUsers
            );
          }
        } catch (error) {
          console.error("Erro ao carregar usuários online:", error);
        }
      }, 1500); // Aumentado para 1.5s para dar tempo ao backend
    } catch (error) {
      console.error("Erro ao entrar no chat:", error);
    }
  };

  // Função para enviar mensagem de teste
  const sendTestMessage = () => {
    const testMessage: ChatMessage = {
      sender: "Sistema",
      content: "Mensagem de teste local",
      type: "CHAT",
      timestamp: new Date().toISOString(),
      isNewMessage: true,
    };

    console.log("Adicionando mensagem de teste:", testMessage);
    setMessages((prev) => {
      const newMessages = [...prev, testMessage];
      const sortedMessages = sortMessagesByTimestamp(newMessages);
      setTimeout(() => scrollToBottom(), 100);
      return sortedMessages;
    });
  };

  // Enviar mensagem
  const sendMessage = () => {
    if (!messageInput.trim()) return;

    if (!stompClient.current || !stompClient.current.connected) {
      console.error("Cliente STOMP não está conectado");
      return;
    }

    const message: ChatMessage = {
      sender: username,
      content: messageInput,
      type: "CHAT",
      timestamp: new Date().toISOString(),
      isNewMessage: true,
    };

    try {
      if (selectedChat === "global") {
        // Mensagem pública
        stompClient.current.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify(message),
        });
      } else {
        // Mensagem privada
        message.recipient = selectedChat as string;
        stompClient.current.publish({
          destination: "/app/chat.sendPrivateMessage",
          body: JSON.stringify(message),
        });
      }
      setMessageInput("");
      console.log("Mensagem enviada:", message);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Sair do chat
  const leaveChat = () => {
    if (stompClient.current?.connected) {
      const leaveMessage: ChatMessage = {
        sender: username,
        content: `${username} saiu do chat`,
        type: "LEAVE",
        timestamp: new Date().toISOString(),
        isNewMessage: true,
      };

      stompClient.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(leaveMessage),
      });
    }
    setIsJoined(false);
    setUsername("");
    setMessages([]);
    setOnlineUsers([]);
    setSelectedChat("global");
  };

  // Lidar com Enter no input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isJoined) {
        sendMessage();
      } else {
        joinChat();
      }
    }
  };

  // Renderiza mensagem baseada no tipo
  const renderMessage = (msg: ChatMessage, idx: number) => {
    console.log(`Renderizando mensagem ${idx}:`, msg);
    const isSystemMessage = msg.type === "JOIN" || msg.type === "LEAVE";
    const isOwnMessage = msg.sender === username && msg.type === "CHAT";

    // Formatar timestamp
    const formatTimestamp = (timestamp?: string, isNewMessage?: boolean) => {
      if (!timestamp) return "";

      // Se é uma mensagem nova, mostra "agora"
      if (isNewMessage) {
        return "agora";
      }

      // Se é do histórico, mostra o tempo normal
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    };

    console.log(
      `isSystemMessage: ${isSystemMessage}, isOwnMessage: ${isOwnMessage}, username: ${username}`
    );

    return (
      <li
        key={`${msg.timestamp || Date.now()}-${msg.sender}-${idx}`}
        className={`p-3 rounded-lg ${
          isSystemMessage
            ? "bg-gray-800 text-gray-400 text-center italic border border-gray-700"
            : isOwnMessage
            ? "bg-blue-600 text-white ml-auto max-w-xs shadow-lg"
            : "bg-gray-700 text-white border border-gray-600 mr-auto max-w-xs shadow-lg"
        }`}
      >
        {!isSystemMessage && (
          <div className="flex justify-between items-center mb-1">
            <div
              className={`text-sm font-semibold ${
                isOwnMessage ? "text-blue-100" : "text-gray-300"
              }`}
            >
              {msg.sender}
            </div>
            {msg.timestamp && (
              <div
                className={`text-xs ${
                  isOwnMessage ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {formatTimestamp(msg.timestamp, msg.isNewMessage)}
              </div>
            )}
          </div>
        )}
        <div className={isSystemMessage ? "text-gray-400" : "text-white"}>
          {msg.content}
        </div>
        {isSystemMessage && msg.timestamp && (
          <div className="text-xs text-gray-500 mt-1">
            {formatTimestamp(msg.timestamp, msg.isNewMessage)}
          </div>
        )}
      </li>
    );
  };

  // Se o usuário ainda não entrou no chat
  if (!isJoined) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">
            🍌 BananaChat
          </h1>

          {isLoadingHistory && (
            <div className="mb-4 text-center">
              <div className="text-sm text-yellow-400 mb-2">Carregando...</div>
              <Progress
                value={60}
                className="w-full bg-gray-700 animate-pulse"
              />
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm mb-2 text-gray-300">
              Status da conexão:{" "}
              <span
                className={
                  connectionStatus === "Conectado"
                    ? "text-green-400 font-semibold"
                    : "text-red-400 font-semibold"
                }
              >
                {connectionStatus}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="username-input"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Digite seu nome:
              </Label>
              <Input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Seu nome..."
                disabled={connectionStatus !== "Conectado"}
              />
            </div>

            <Button
              onClick={joinChat}
              disabled={connectionStatus !== "Conectado" || !username.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Entrar no Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Interface principal do chat com sidebar
  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto max-w-6xl h-full flex">
        {/* Sidebar estilo WhatsApp */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Header da sidebar */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Conversas</h2>
              <div className="text-xs text-gray-400">
                {onlineUsers.length} online
              </div>
            </div>
            <div className="text-sm text-gray-300 mt-1">
              Conectado como: <strong>{username}</strong>
            </div>
          </div>

          {/* Lista de conversas */}
          <div className="flex-1 overflow-y-auto">
            {/* Chat Global */}
            <div
              onClick={() => {
                setSelectedChat("global");
              }}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${
                selectedChat === "global" ? "bg-gray-700" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  🌍
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Chat Global</div>
                  <div className="text-sm text-gray-400">
                    Chat público para todos
                  </div>
                </div>
              </div>
            </div>

            {/* Usuários Online */}
            <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">
              Usuários Online ({onlineUsers.length})
            </div>

            {onlineUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Nenhum usuário online
              </div>
            ) : (
              onlineUsers.map((user) => (
                <div
                  key={user}
                  onClick={() => {
                    console.log("� Mudando para chat privado com:", user);
                    setSelectedChat(user);
                  }}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${
                    selectedChat === user ? "bg-gray-700" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{user}</div>
                      <div className="text-sm text-green-400">● Online</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer da sidebar */}
          <div className="p-4 border-t border-gray-700">
            <Button
              onClick={leaveChat}
              variant="outline"
              className="w-full text-red-400 border-red-600 hover:bg-red-900 hover:text-red-300"
            >
              Sair do Chat
            </Button>
          </div>
        </div>

        {/* Área principal do chat */}
        <div className="flex-1 flex flex-col">
          {/* Header do chat atual */}
          <div className="bg-gray-800 border-b border-gray-700 shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  {selectedChat === "global" ? "🌍" : "👤"}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    {selectedChat === "global" ? "Chat Global" : selectedChat}
                  </h1>
                  <div className="text-sm text-gray-400">
                    {selectedChat === "global"
                      ? "Chat público para todos"
                      : "Chat privado"}
                  </div>
                </div>
              </div>
              {isAutoUpdating && (
                <div className="flex items-center text-xs text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-1"></div>
                  Sincronizando
                </div>
              )}
            </div>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 bg-gray-900 overflow-hidden">
            <div className="h-full flex flex-col">
              <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto p-4"
              >
                {messages.length > 0 && (
                  <div className="text-center mb-4 space-y-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-300 border border-gray-600">
                      📜 {messages.length} mensagem(s) carregada(s)
                    </div>
                  </div>
                )}
                <ul className="space-y-3">
                  {messages.map((msg, idx) => renderMessage(msg, idx))}
                </ul>
                <div ref={messagesEndRef} className="h-1" />
              </ScrollArea>

              {/* Input de mensagem */}
              <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex space-x-2 mb-2">
                  <Button
                    onClick={sendTestMessage}
                    variant="outline"
                    className="text-xs px-2 py-1 text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    Teste Local
                  </Button>
                  <Button
                    onClick={refreshHistory}
                    variant="outline"
                    className="text-xs px-2 py-1 text-gray-300 border-gray-600 hover:bg-gray-700"
                    disabled={isLoadingHistory || isAutoUpdating}
                  >
                    {isLoadingHistory || isAutoUpdating
                      ? "Carregando..."
                      : "🔄 Sincronizar Agora"}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    placeholder={
                      selectedChat === "global"
                        ? "Digite sua mensagem pública..."
                        : `Mensagem privada para ${selectedChat}...`
                    }
                    disabled={connectionStatus !== "Conectado"}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={
                      connectionStatus !== "Conectado" || !messageInput.trim()
                    }
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
