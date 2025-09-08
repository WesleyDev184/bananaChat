package com.bananachat.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.bananachat.backend.model.ChatMessage;
import com.bananachat.backend.service.ChatHistoryService;

@Component
public class WebSocketEventListener {

  private static final Logger LOGGER = LoggerFactory.getLogger(WebSocketEventListener.class);

  @Autowired
  private SimpMessageSendingOperations messagingTemplate;

  @Autowired
  private ChatHistoryService chatHistoryService;

  @EventListener
  public void handleWebSocketConnectListener(SessionConnectedEvent event) {
    LOGGER.info("Recebida nova conexão WebSocket");
  }

  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

    String username = null;
    var sessionAttributes = headerAccessor.getSessionAttributes();
    if (sessionAttributes != null) {
      username = (String) sessionAttributes.get("username");
    }

    if (username != null) {
      LOGGER.info("Usuário desconectado: {}", username);

      ChatMessage chatMessage = new ChatMessage();
      chatMessage.setType(ChatMessage.MessageType.LEAVE);
      chatMessage.setSender(username);
      chatMessage.setContent(username + " deixou o chat!");

      // Salva a mensagem de saída no histórico
      chatHistoryService.saveMessage(chatMessage);

      messagingTemplate.convertAndSend("/topic/public", chatMessage);
    }
  }
}
