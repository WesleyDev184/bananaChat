import type { ConnectionStatus } from "@/components/chat/types";
import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

const WEBSOCKET_URL = "http://localhost:8080/ws-chat";

interface UseWebSocketConnectionReturn {
  connectionStatus: ConnectionStatus;
  isLoadingHistory: boolean;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  stompClient: React.RefObject<Client | null>;
}

export function useWebSocketConnection(): UseWebSocketConnectionReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Desconectado");
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const stompClient = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (stompClient.current?.connected) {
      return; // Já conectado
    }

    console.log("🔌 Inicializando conexão WebSocket...");
    console.log("🌐 URL do WebSocket:", WEBSOCKET_URL);
    setConnectionStatus("Conectando...");
    setIsLoadingHistory(true);

    const socket = new SockJS(WEBSOCKET_URL);
    console.log("🔗 SockJS criado:", socket);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      onConnect: (frame) => {
        console.log("✅ Conectado ao STOMP!", frame);
        console.log("🔧 Cliente STOMP ativo:", stompClient.current);
        setConnectionStatus("Conectado");
        setIsLoadingHistory(false);
      },
      onStompError: (frame) => {
        console.error("❌ Erro STOMP:", frame);
        setConnectionStatus("Erro STOMP");
        setIsLoadingHistory(false);
      },
      onWebSocketError: (error) => {
        console.error("❌ Erro WebSocket:", error);
        setConnectionStatus("Erro WebSocket");
        setIsLoadingHistory(false);
      },
      onDisconnect: () => {
        console.log("❌ Desconectado");
        setConnectionStatus("Desconectado");
        setIsLoadingHistory(false);
      },
    });

    stompClient.current.activate();
  }, []);

  const disconnect = useCallback(() => {
    if (stompClient.current) {
      console.log("🔌 Desativando conexão WebSocket");
      stompClient.current.deactivate();
      stompClient.current = null;
      setConnectionStatus("Desconectado");
      setIsLoadingHistory(false);
    }
  }, []);

  // Auto-conectar quando o hook é montado
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    isLoadingHistory,
    connect,
    disconnect,
    isConnected: connectionStatus === "Conectado",
    stompClient,
  };
}
