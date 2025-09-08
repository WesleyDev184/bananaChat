package com.bananachat.backend.controller;

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

@Controller
public class ChatController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Usado para enviar mensagens via WebSocket

    @Autowired
    private ChatHistoryService chatHistoryService;

    /**
     * Manipula o envio de mensagens de chat.
     * Recebe mensagens do cliente via WebSocket no destino "/app/chat.sendMessage".
     *
     * @param chatMessage A mensagem recebida do cliente.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        LOGGER.info("Mensagem recebida via WebSocket: {}", chatMessage.getContent());

        // Salva a mensagem no histórico
        chatHistoryService.saveMessage(chatMessage);

        // Envia diretamente para todos os clientes conectados
        messagingTemplate.convertAndSend("/topic/public", chatMessage);
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

        // Adiciona o nome de usuário na sessão do WebSocket
        try {
            var sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("username", chatMessage.getSender());
            }
        } catch (Exception e) {
            LOGGER.warn("Não foi possível adicionar username à sessão: {}", e.getMessage());
        }

        // Salva a mensagem no histórico
        chatHistoryService.saveMessage(chatMessage);

        // Envia diretamente para todos os clientes conectados
        messagingTemplate.convertAndSend("/topic/public", chatMessage);
    }
}
