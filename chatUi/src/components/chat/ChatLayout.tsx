import ConversationList from "@/components/chat/ConversationList";
import LoginForm from "@/components/chat/LoginForm";
import MessageInput from "@/components/chat/MessageInput";
import MessageWindow from "@/components/chat/MessageWindow";
import type {
  ChatHistoryDto,
  ChatMessage,
  ChatType,
  ConnectionStatus,
  Conversation,
} from "@/components/chat/types";
import { Client } from "@stomp/stompjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

const WEBSOCKET_URL = "http://localhost:8080/ws-chat";
const API_BASE_URL = "http://localhost:8080/api";

export default function ChatLayout() {
  // Estados principais
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Desconectado");
  const [username, setUsername] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | string>("global");

  // Refs
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para ordenar mensagens por timestamp (ordem cronológica simples)
  const sortMessagesByTimestamp = useCallback(
    (messages: ChatMessage[]): ChatMessage[] => {
      const sorted = [...messages].sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;

        try {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);

          // Verificar se as datas são válidas
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            console.warn("⚠️ Timestamp inválido detectado:", {
              a: a.timestamp,
              b: b.timestamp,
            });
            return !isNaN(dateA.getTime()) ? -1 : 1;
          }

          const diff = dateA.getTime() - dateB.getTime();

          // Log para debug quando timestamps são muito próximos
          if (Math.abs(diff) < 100) {
            console.log("🔍 Timestamps próximos:", {
              a: {
                content: a.content.substring(0, 20),
                timestamp: a.timestamp,
                time: dateA.getTime(),
              },
              b: {
                content: b.content.substring(0, 20),
                timestamp: b.timestamp,
                time: dateB.getTime(),
              },
              diff: diff,
            });
          }

          return diff;
        } catch (error) {
          console.error("❌ Erro ao comparar timestamps:", error, {
            a: a.timestamp,
            b: b.timestamp,
          });
          return 0;
        }
      });

      // Log da ordem final
      console.log(
        "📊 Ordem final após sort:",
        sorted.slice(0, 10).map((m, idx) => ({
          index: idx,
          type: m.type,
          content: m.content.substring(0, 25),
          timestamp: m.timestamp,
          parsed: m.timestamp ? new Date(m.timestamp).getTime() : "null",
        }))
      );

      return sorted;
    },
    []
  ); // Auto scroll para a última mensagem
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Pequeno delay para garantir que o ScrollArea renderizou
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }, 50);
    }
  }, []);

  // Scroll automático sempre que as mensagens mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Sistema otimizado de atualização de timestamps
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

              // Atualiza mensagens de sistema (JOIN/LEAVE) após 15 segundos
              // Atualiza mensagens de chat após 60 segundos
              const thresholdSeconds =
                msg.type === "JOIN" || msg.type === "LEAVE" ? 15 : 60;

              if (diffInSeconds > thresholdSeconds) {
                console.log(
                  `⏰ Atualizando timestamp ${msg.type}: ${msg.content} - ${msg.timestamp}`
                );
                return { ...msg, isNewMessage: false };
              }
            } catch (error) {
              console.warn(
                "⚠️ Erro ao processar timestamp:",
                msg.timestamp,
                error
              );
              // Se há erro no timestamp, remove o flag para evitar loops
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
    }, 10000); // Verifica a cada 10 segundos (mais responsivo)

    return () => clearInterval(interval);
  }, []);

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
        url = `${API_BASE_URL}/chat/history/private?user1=${username}&user2=${chatType}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const history: ChatHistoryDto[] = await response.json();
      console.log("Histórico recebido:", history);

      const convertedMessages: ChatMessage[] = history.map((item) => ({
        sender: item.sender,
        recipient: item.recipient,
        content: item.content,
        type: item.type as "CHAT" | "JOIN" | "LEAVE",
        timestamp: item.timestamp,
        isNewMessage: false,
      }));

      const sortedMessages = sortMessagesByTimestamp(convertedMessages);
      console.log(
        "📜 Histórico carregado - Ordem cronológica:",
        sortedMessages.map((m) => ({
          type: m.type,
          content: m.content.substring(0, 30),
          timestamp: m.timestamp,
          sender: m.sender,
        }))
      );
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
      console.log("🔌 Inicializando chat...");
      setConnectionStatus("Conectando...");

      const socket = new SockJS(WEBSOCKET_URL);
      stompClient.current = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          console.log("✅ Conectado ao STOMP");
          setConnectionStatus("Conectado");

          if (stompClient.current) {
            // Subscreve ao tópico público
            stompClient.current.subscribe("/topic/public", (msg) => {
              console.log("📨 Mensagem pública recebida:", msg.body);
              try {
                const receivedMessage: ChatMessage = JSON.parse(msg.body);

                // Processa e normaliza o timestamp
                if (receivedMessage.timestamp) {
                  // Se o timestamp vem do backend como string, converte para ISO
                  try {
                    const date = new Date(receivedMessage.timestamp);
                    receivedMessage.timestamp = date.toISOString();
                  } catch (error) {
                    console.warn(
                      "⚠️ Erro ao processar timestamp do backend:",
                      receivedMessage.timestamp
                    );
                    receivedMessage.timestamp = new Date().toISOString();
                  }
                } else {
                  // Fallback: usa timestamp atual
                  receivedMessage.timestamp = new Date().toISOString();
                }

                receivedMessage.isNewMessage = true;

                console.log("📝 Processando mensagem:", {
                  tipo: receivedMessage.type,
                  remetente: receivedMessage.sender,
                  conteudo: receivedMessage.content,
                  timestamp: receivedMessage.timestamp,
                  chatSelecionado: selectedChat,
                });

                // Atualizar lista de usuários online
                if (receivedMessage.type === "JOIN") {
                  if (receivedMessage.sender !== username) {
                    setOnlineUsers((prev) => {
                      if (!prev.includes(receivedMessage.sender)) {
                        console.log(
                          "👥 Usuário entrou:",
                          receivedMessage.sender
                        );
                        return [...prev, receivedMessage.sender].sort();
                      }
                      return prev;
                    });
                  }
                } else if (receivedMessage.type === "LEAVE") {
                  setOnlineUsers((prev) => {
                    console.log("👋 Usuário saiu:", receivedMessage.sender);
                    return prev.filter(
                      (user) => user !== receivedMessage.sender
                    );
                  });
                }

                // SEMPRE adiciona à lista de mensagens (sem filtro por chat selecionado)
                // A filtragem será feita no MessageWindow
                setMessages((prev) => {
                  // Verifica duplicatas de forma mais simples e rigorosa
                  const messageExists = prev.some((existingMsg) => {
                    // Compara timestamp, sender e content para evitar duplicatas
                    return (
                      existingMsg.timestamp === receivedMessage.timestamp &&
                      existingMsg.sender === receivedMessage.sender &&
                      existingMsg.content === receivedMessage.content &&
                      existingMsg.type === receivedMessage.type
                    );
                  });

                  if (!messageExists) {
                    console.log(
                      `💬 Adicionando nova mensagem ${receivedMessage.type}:`,
                      {
                        content: receivedMessage.content,
                        timestamp: receivedMessage.timestamp,
                        sender: receivedMessage.sender,
                      }
                    );

                    const newMessages = [...prev, receivedMessage];
                    const sortedMessages = sortMessagesByTimestamp(newMessages);

                    // Log para debug da ordem
                    console.log(
                      "📋 Ordem atual das mensagens:",
                      sortedMessages.map((m) => ({
                        type: m.type,
                        content: m.content.substring(0, 20),
                        timestamp: m.timestamp,
                      }))
                    );

                    // Force scroll para novas mensagens
                    setTimeout(() => scrollToBottom(), 100);

                    return sortedMessages;
                  } else {
                    console.log(
                      `⚠️ Mensagem ${receivedMessage.type} duplicada ignorada:`,
                      receivedMessage.content
                    );
                  }
                  return prev;
                });
              } catch (error) {
                console.error("❌ Erro ao parsear mensagem pública:", error);
              }
            });
          }
        },
        onStompError: (frame) => {
          console.error("❌ Erro STOMP:", frame);
          setConnectionStatus("Erro STOMP");
        },
        onWebSocketError: (error) => {
          console.error("❌ Erro WebSocket:", error);
          setConnectionStatus("Erro WebSocket");
        },
        onDisconnect: () => {
          console.log("❌ Desconectado");
          setConnectionStatus("Desconectado");
        },
      });

      stompClient.current.activate();
    };

    initializeChat();

    return () => {
      if (stompClient.current) {
        console.log("🔌 Desativando conexão WebSocket");
        stompClient.current.deactivate();
      }
    };
  }, [scrollToBottom, sortMessagesByTimestamp]);

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

            // Processa e normaliza o timestamp
            if (receivedMessage.timestamp) {
              // Se o timestamp vem do backend como string, converte para ISO
              try {
                const date = new Date(receivedMessage.timestamp);
                receivedMessage.timestamp = date.toISOString();
              } catch (error) {
                console.warn(
                  "⚠️ Erro ao processar timestamp privado:",
                  receivedMessage.timestamp
                );
                receivedMessage.timestamp = new Date().toISOString();
              }
            } else {
              // Fallback: usa timestamp atual
              receivedMessage.timestamp = new Date().toISOString();
            }

            receivedMessage.isNewMessage = true;

            console.log("📱 Processando mensagem privada:", {
              remetente: receivedMessage.sender,
              destinatario: receivedMessage.recipient,
              conteudo: receivedMessage.content,
              timestamp: receivedMessage.timestamp,
              chatAtual: selectedChat,
              usuarioAtual: username,
            });

            // SEMPRE adiciona mensagens privadas (sem filtro por chat selecionado)
            setMessages((prev) => {
              // Evita duplicatas verificando se a mensagem já existe
              const messageExists = prev.some(
                (existingMsg) =>
                  existingMsg.sender === receivedMessage.sender &&
                  existingMsg.content === receivedMessage.content &&
                  existingMsg.timestamp === receivedMessage.timestamp &&
                  existingMsg.recipient === receivedMessage.recipient
              );

              if (!messageExists) {
                console.log("💬 Adicionando mensagem privada:", {
                  content: receivedMessage.content,
                  timestamp: receivedMessage.timestamp,
                  sender: receivedMessage.sender,
                });

                const newMessages = [...prev, receivedMessage];
                const sortedMessages = sortMessagesByTimestamp(newMessages);

                // Log para debug da ordem
                console.log(
                  "📋 Ordem atual das mensagens (com privada):",
                  sortedMessages.map((m) => ({
                    type: m.type,
                    content: m.content.substring(0, 20),
                    timestamp: m.timestamp,
                  }))
                );

                setTimeout(() => scrollToBottom(), 100);
                return sortedMessages;
              }
              return prev;
            });
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

      // Marcar mensagens como lidas do chat selecionado
      setMessages((prev) =>
        prev.map((msg) => {
          if (selectedChat === "global" && !msg.recipient) {
            return { ...msg, isNewMessage: false };
          } else if (selectedChat !== "global" && msg.sender === selectedChat) {
            return { ...msg, isNewMessage: false };
          }
          return msg;
        })
      );
    }
  }, [selectedChat, isJoined]);

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
                console.log(
                  "Lista de usuários online atualizada:",
                  filteredUsers
                );
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

    const latestHistory = await fetchChatHistory(selectedChat);
    const sortedHistory = sortMessagesByTimestamp(latestHistory);
    setMessages(sortedHistory);
    setTimeout(() => scrollToBottom(), 200);

    // Mensagem de entrada (sem isNewMessage e timestamp)
    const joinMessage: ChatMessage = {
      sender: username,
      content: `${username} entrou no chat`,
      type: "JOIN",
    };

    try {
      console.log("Enviando mensagem JOIN:", joinMessage);
      stompClient.current.publish({
        destination: "/app/chat.addUser",
        body: JSON.stringify(joinMessage),
      });

      setIsJoined(true);
      console.log("Usuário entrou no chat:", username);

      setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/online`);
          if (response.ok) {
            const users: string[] = await response.json();
            const sortedUsers = users
              .filter((user) => user !== username)
              .sort();
            setOnlineUsers(sortedUsers);
            console.log(
              "Lista inicial de usuários online carregada:",
              sortedUsers
            );
          }
        } catch (error) {
          console.error("Erro ao carregar usuários online:", error);
        }
      }, 1500);
    } catch (error) {
      console.error("Erro ao entrar no chat:", error);
    }
  };

  // Enviar mensagem
  const sendMessage = (messageInput: string) => {
    if (!messageInput.trim()) return;

    if (!stompClient.current || !stompClient.current.connected) {
      console.error("Cliente STOMP não está conectado");
      return;
    }

    // Mensagem para enviar ao backend (sem isNewMessage)
    const message: ChatMessage = {
      sender: username,
      content: messageInput,
      type: "CHAT",
      // Não enviamos timestamp - deixamos o backend definir
    };

    try {
      if (selectedChat === "global") {
        stompClient.current.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify(message),
        });
      } else {
        message.recipient = selectedChat as string;
        stompClient.current.publish({
          destination: "/app/chat.sendPrivateMessage",
          body: JSON.stringify(message),
        });
      }
      console.log("Mensagem enviada:", message);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Sair do chat
  const leaveChat = () => {
    if (stompClient.current?.connected) {
      // Mensagem de saída (sem isNewMessage e timestamp)
      const leaveMessage: ChatMessage = {
        sender: username,
        content: `${username} saiu do chat`,
        type: "LEAVE",
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
      if (!isJoined) {
        joinChat();
      }
    }
  };

  // Criar conversas para o ConversationList
  const conversations: Conversation[] = [
    {
      id: "global",
      title: "Chat Global",
      lastMessage:
        messages.filter((m) => !m.recipient).slice(-1)[0]?.content ||
        "Seja bem-vindo!",
      messages: [], // O MessageWindow vai usar messages diretamente
      unreadCount:
        selectedChat === "global"
          ? 0
          : messages.filter(
              (m) => !m.recipient && m.isNewMessage && m.sender !== username
            ).length,
    },
    ...onlineUsers.map((user) => ({
      id: user,
      title: user,
      lastMessage:
        messages
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
          : messages.filter(
              (m) =>
                m.sender === user && m.recipient === username && m.isNewMessage
            ).length,
    })),
  ];

  // Se o usuário ainda não entrou no chat
  if (!isJoined) {
    return (
      <LoginForm
        username={username}
        setUsername={setUsername}
        connectionStatus={connectionStatus}
        isLoadingHistory={isLoadingHistory}
        onJoinChat={joinChat}
        onKeyPress={handleKeyPress}
      />
    );
  }

  // Interface principal do chat
  return (
    <div className="max-h-full w-full h-full rounded-lg border bg-background shadow-sm flex overflow-hidden">
      <aside className="w-72 min-w-[16rem] border-r bg-muted p-2 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <ConversationList
            conversations={conversations}
            selectedId={selectedChat.toString()}
            onSelect={setSelectedChat}
            onlineUsersCount={onlineUsers.length}
            currentUsername={username}
            onLeaveChat={leaveChat}
          />
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageWindow
            messages={messages}
            selectedChat={selectedChat}
            currentUsername={username}
            isAutoUpdating={isAutoUpdating}
            messagesEndRef={messagesEndRef}
          />
        </div>
        <div className="border-t p-3 flex-shrink-0">
          <MessageInput onSend={sendMessage} />
        </div>
      </main>
    </div>
  );
}
