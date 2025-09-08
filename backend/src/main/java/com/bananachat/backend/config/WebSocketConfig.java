package com.bananachat.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // Define o prefixo para os destinos onde as mensagens serão roteadas pelo
    // broker.
    // Clientes React se inscreverão em destinos que começam com "/topic".
    config.enableSimpleBroker("/topic");

    // Define o prefixo para mensagens que são destinadas a métodos anotados com
    // @MessageMapping.
    // O cliente React enviará mensagens para destinos que começam com "/app".
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // Registra o endpoint WebSocket que o cliente React usará para se conectar.
    // "/ws-chat" é o endpoint HTTP para o handshake inicial.
    // withSockJS() fornece um fallback para navegadores que não suportam
    // WebSockets.
    registry.addEndpoint("/ws-chat")
        .setAllowedOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002") // React/Vite
                                                                                                      // ports
        .withSockJS();
    registry.addEndpoint("/ws-chat-raw")
        .setAllowedOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002");
  }
}