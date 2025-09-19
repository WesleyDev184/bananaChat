package com.bananachat.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Value("${spring.activemq.broker-url}")
  private String activeMqBrokerUrl;

  @Value("${spring.activemq.user}")
  private String activeMqUser;

  @Value("${spring.activemq.password}")
  private String activeMqPassword;

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // Habilita o broker ActiveMQ em vez do simple broker
    // Configura o broker externo do ActiveMQ
    config.enableStompBrokerRelay("/topic", "/queue")
        .setRelayHost(extractHostFromBrokerUrl(activeMqBrokerUrl))
        .setRelayPort(extractPortFromBrokerUrl(activeMqBrokerUrl))
        .setClientLogin(activeMqUser)
        .setClientPasscode(activeMqPassword)
        .setSystemLogin(activeMqUser)
        .setSystemPasscode(activeMqPassword);

    // Define o prefixo para mensagens que são destinadas a métodos anotados com
    // @MessageMapping.
    // O cliente React enviará mensagens para destinos que começam com "/app".
    config.setApplicationDestinationPrefixes("/app");
  }

  private String extractHostFromBrokerUrl(String brokerUrl) {
    // Extrai o host da URL do broker (ex: tcp://localhost:61616 -> localhost)
    if (brokerUrl.startsWith("tcp://")) {
      String hostPort = brokerUrl.substring(6); // Remove "tcp://"
      return hostPort.split(":")[0];
    }
    return "localhost";
  }

  private int extractPortFromBrokerUrl(String brokerUrl) {
    // Extrai a porta da URL do broker (ex: tcp://localhost:61616 -> 61616)
    // Para STOMP, usar porta 61613 (padrão do ActiveMQ para STOMP)
    return 61613;
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // Registra o endpoint WebSocket que o cliente React usará para se conectar.
    // "/ws-chat" é o endpoint HTTP para o handshake inicial.
    // withSockJS() fornece um fallback para navegadores que não suportam
    // WebSockets.
    registry.addEndpoint("/ws-chat")
        .setAllowedOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
            "http://localhost:5173") // React/Vite
                                     // ports
        .withSockJS();
    registry.addEndpoint("/ws-chat-raw")
        .setAllowedOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
            "http://localhost:5173");
  }
}