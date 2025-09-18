package com.bananachat.backend.controller;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.bananachat.backend.model.ChatMessage;
import com.bananachat.backend.service.ChatHistoryService;
import com.bananachat.backend.service.OnlineUsersService;

@Controller
public class ChatController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Usado para enviar mensagens via WebSocket

    @Autowired
    private ChatHistoryService chatHistoryService;

    @Autowired
    private OnlineUsersService onlineUsersService;

    /**
     * Manipula o envio de mensagens de chat.
     * Recebe mensagens do cliente via WebSocket no destino "/app/chat.sendMessage".
     *
     * @param chatMessage A mensagem recebida do cliente.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        LOGGER.info("Mensagem recebida via WebSocket: {}", chatMessage.getContent());

        // Garante que o timestamp seja sempre definido no servidor com precisão de
        // nanosegundos
        LocalDateTime now = LocalDateTime.now();
        chatMessage.setTimestamp(now);

        LOGGER.info("Timestamp definido: {} para mensagem: {}", now, chatMessage.getContent());

        // Salva a mensagem no histórico
        chatHistoryService.saveMessage(chatMessage);

        // Envia diretamente para todos os clientes conectados
        messagingTemplate.convertAndSend("/topic/public", chatMessage);

        LOGGER.info("Mensagem enviada com timestamp: {}", chatMessage.getTimestamp());
    }

    /**
     * Manipula a adição de um novo usuário ao chat.
     * Recebe mensagens do cliente via WebSocket no destino "/app/chat.addUser".
     *
     * @param chatMessage    A mensagem contendo informações do usuário que entrou.
     * @param headerAccessor Permite acessar informações da sessão WebSocket.
     */
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        LOGGER.info("Novo usuário entrando no chat: {}", chatMessage.getSender());

        // Garante que o timestamp seja sempre definido no servidor com precisão
        LocalDateTime now = LocalDateTime.now();
        chatMessage.setTimestamp(now);

        LOGGER.info("Timestamp definido: {} para entrada do usuário: {}", now, chatMessage.getSender());

        // Adiciona o nome de usuário na sessão do WebSocket
        try {
            var sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("username", chatMessage.getSender());
            }
        } catch (Exception e) {
            LOGGER.warn("Não foi possível adicionar username à sessão: {}", e.getMessage());
        }

        // Adiciona o usuário à lista de usuários online
        onlineUsersService.addUser(chatMessage.getSender());

        // Salva a mensagem no histórico
        chatHistoryService.saveMessage(chatMessage);

        // Envia diretamente para todos os clientes conectados
        messagingTemplate.convertAndSend("/topic/public", chatMessage);

        LOGGER.info("Usuário adicionado com timestamp: {}", chatMessage.getTimestamp());
    }

    /**
     * Manipula o envio de mensagens privadas.
     * Recebe mensagens do cliente via WebSocket no destino
     * "/app/chat.sendPrivateMessage".
     *
     * @param chatMessage A mensagem privada recebida do cliente.
     */
    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage) {
        LOGGER.info("Mensagem privada recebida: {} -> {}: {}",
                chatMessage.getSender(), chatMessage.getRecipient(), chatMessage.getContent());

        // Garante que o timestamp seja sempre definido no servidor com precisão
        LocalDateTime now = LocalDateTime.now();
        chatMessage.setTimestamp(now);

        LOGGER.info("Timestamp definido: {} para mensagem privada: {}", now, chatMessage.getContent());

        // Salva a mensagem no histórico
        chatHistoryService.saveMessage(chatMessage);

        // Envia para a queue privada do destinatário
        if (chatMessage.getRecipient() != null) {
            String privateQueue = "/queue/private." + chatMessage.getRecipient();
            messagingTemplate.convertAndSend(privateQueue, chatMessage);
            LOGGER.info("Mensagem privada enviada para queue: {} com timestamp: {}",
                    privateQueue, chatMessage.getTimestamp());
        }
    }
}
