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

import com.bananachat.backend.entity.GroupMessage;
import com.bananachat.backend.model.ChatMessage;
import com.bananachat.backend.model.GroupChatMessage;
import com.bananachat.backend.service.ChatHistoryService;
import com.bananachat.backend.service.GroupMessageService;
import com.bananachat.backend.service.GroupService;
import com.bananachat.backend.service.OnlineUsersService;
import com.bananachat.backend.service.UserService;

@Controller
public class ChatController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Usado para enviar mensagens via WebSocket

    @Autowired
    private ChatHistoryService chatHistoryService;

    @Autowired
    private OnlineUsersService onlineUsersService;

    @Autowired
    private GroupMessageService groupMessageService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    /**
     * Manipula o envio de mensagens de chat.
     * Recebe mensagens do cliente via WebSocket no destino "/app/chat.sendMessage".
     *
     * @param chatMessage A mensagem recebida do cliente.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        long startNanos = System.nanoTime();
        LOGGER.info("🚀 Mensagem recebida via WebSocket: {}", chatMessage.getContent());

        // Garante que o timestamp seja sempre definido no servidor com precisão de
        // nanosegundos
        LocalDateTime now = LocalDateTime.now();
        chatMessage.setTimestamp(now);

        long timestampNanos = System.nanoTime();
        LOGGER.info("⏰ Timestamp definido: {} (processamento: {}ns) para mensagem: {}",
                now, timestampNanos - startNanos, chatMessage.getContent());

        // Salva a mensagem no histórico
        chatHistoryService.saveMessage(chatMessage);

        // Envia diretamente para todos os clientes conectados
        messagingTemplate.convertAndSend("/topic/public", chatMessage);

        long endNanos = System.nanoTime();
        LOGGER.info("📤 Mensagem enviada com timestamp: {} (tempo total: {}ns)",
                chatMessage.getTimestamp(), endNanos - startNanos);
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
        long startNanos = System.nanoTime();
        LOGGER.info("👤 Novo usuário entrando no chat: {}", chatMessage.getSender());

        // Garante que o timestamp seja sempre definido no servidor com precisão
        LocalDateTime now = LocalDateTime.now();
        chatMessage.setTimestamp(now);

        long timestampNanos = System.nanoTime();
        LOGGER.info("⏰ Timestamp definido: {} (processamento: {}ns) para entrada do usuário: {}",
                now, timestampNanos - startNanos, chatMessage.getSender());

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
        long startNanos = System.nanoTime();
        LOGGER.info("🔒 Mensagem privada recebida: {} -> {}: {}",
                chatMessage.getSender(), chatMessage.getRecipient(), chatMessage.getContent());

        // Garante que o timestamp seja sempre definido no servidor com precisão
        LocalDateTime now = LocalDateTime.now();
        chatMessage.setTimestamp(now);

        long timestampNanos = System.nanoTime();
        LOGGER.info("⏰ Timestamp definido: {} (processamento: {}ns) para mensagem privada: {}",
                now, timestampNanos - startNanos, chatMessage.getContent());

        // Salva a mensagem no histórico
        chatHistoryService.saveMessage(chatMessage);

        // Envia para a queue privada do destinatário
        if (chatMessage.getRecipient() != null) {
            String privateQueueRecipient = "/queue/private." + chatMessage.getRecipient();
            messagingTemplate.convertAndSend(privateQueueRecipient, chatMessage);
            LOGGER.info("📤 Mensagem privada enviada para destinatário: {}", privateQueueRecipient);

            // IMPORTANTE: Também envia para o remetente para que ele veja sua própria
            // mensagem
            String privateQueueSender = "/queue/private." + chatMessage.getSender();
            messagingTemplate.convertAndSend(privateQueueSender, chatMessage);
            LOGGER.info("📤 Mensagem privada enviada para remetente: {}", privateQueueSender);

            long endNanos = System.nanoTime();
            LOGGER.info("📤 Mensagem privada processada com timestamp: {} (tempo total: {}ns)",
                    chatMessage.getTimestamp(), endNanos - startNanos);
        }
    }

    /**
     * Manipula o envio de mensagens de grupo.
     * Recebe mensagens do cliente via WebSocket no destino
     * "/app/group.sendMessage".
     *
     * @param groupMessage A mensagem de grupo recebida do cliente.
     */
    @MessageMapping("/group.sendMessage")
    public void sendGroupMessage(@Payload GroupChatMessage groupMessage) {
        long startNanos = System.nanoTime();
        LOGGER.info("🚀 Mensagem de grupo recebida: {} no grupo ID: {} do usuário: {}",
                groupMessage.getContent(), groupMessage.getGroupId(), groupMessage.getSender());

        // Garante que o timestamp seja sempre definido no servidor
        LocalDateTime now = LocalDateTime.now();
        groupMessage.setTimestamp(now);

        try {
            // Debug: Verificar se o usuário existe
            if (!userService.validateUser(groupMessage.getSender())) {
                LOGGER.error("❌ Usuário {} não encontrado no sistema", groupMessage.getSender());
                return;
            }

            // Debug: Verificar se o grupo existe
            if (!groupService.findGroupEntityById(groupMessage.getGroupId()).isPresent()) {
                LOGGER.error("❌ Grupo ID {} não encontrado", groupMessage.getGroupId());
                return;
            }

            // Verificar se o usuário é membro do grupo
            boolean isMember = groupService.isUserMemberOfGroup(groupMessage.getGroupId(), groupMessage.getSender());
            LOGGER.info("🔍 Verificação de membro: usuário {} no grupo {} = {}",
                    groupMessage.getSender(), groupMessage.getGroupId(), isMember);

            if (!isMember) {
                LOGGER.warn("❌ Usuário {} não é membro do grupo {}", groupMessage.getSender(),
                        groupMessage.getGroupId());
                return;
            }

            // Salvar a mensagem no banco
            LOGGER.info("💾 Salvando mensagem no banco...");
            groupMessageService.saveMessage(
                    groupMessage.getContent(),
                    groupMessage.getSender(),
                    groupMessage.getGroupId(),
                    GroupMessage.MessageType.valueOf(groupMessage.getType().name()));
            LOGGER.info("✅ Mensagem salva no banco com sucesso");

            // Enviar para todos os membros do grupo
            String groupTopic = "/topic/group." + groupMessage.getGroupId();
            LOGGER.info("📡 Enviando mensagem para tópico: {}", groupTopic);
            messagingTemplate.convertAndSend(groupTopic, groupMessage);

            long endNanos = System.nanoTime();
            LOGGER.info("✅ Mensagem de grupo enviada para tópico: {} (tempo total: {}ns)",
                    groupTopic, endNanos - startNanos);

        } catch (Exception e) {
            LOGGER.error("❌ Erro ao processar mensagem de grupo: {}", e.getMessage(), e);
        }
    }

    /**
     * Manipula a entrada de usuário em um grupo.
     * Recebe mensagens do cliente via WebSocket no destino "/app/group.joinGroup".
     *
     * @param groupMessage A mensagem contendo informações do usuário que entrou no
     *                     grupo.
     */
    @MessageMapping("/group.joinGroup")
    public void joinGroup(@Payload GroupChatMessage groupMessage) {
        long startNanos = System.nanoTime();
        LOGGER.info("👤 Usuário {} entrando no grupo ID: {}", groupMessage.getSender(), groupMessage.getGroupId());

        // Garante que o timestamp seja sempre definido no servidor
        LocalDateTime now = LocalDateTime.now();
        groupMessage.setTimestamp(now);
        groupMessage.setType(GroupChatMessage.MessageType.JOIN);

        try {
            // Verificar se o usuário é membro do grupo
            if (!groupService.isUserMemberOfGroup(groupMessage.getGroupId(), groupMessage.getSender())) {
                LOGGER.warn("Usuário {} não é membro do grupo {}", groupMessage.getSender(), groupMessage.getGroupId());
                return;
            }

            // Atualizar status online do usuário
            userService.setUserOnlineStatus(groupMessage.getSender(), true);

            // Salvar mensagem de sistema
            groupMessageService.saveMessage(
                    groupMessage.getContent(),
                    groupMessage.getSender(),
                    groupMessage.getGroupId(),
                    GroupMessage.MessageType.JOIN);

            // Enviar para todos os membros do grupo
            String groupTopic = "/topic/group." + groupMessage.getGroupId();
            messagingTemplate.convertAndSend(groupTopic, groupMessage);

            long endNanos = System.nanoTime();
            LOGGER.info("📤 Usuário {} entrou no grupo {} (tempo total: {}ns)",
                    groupMessage.getSender(), groupMessage.getGroupId(), endNanos - startNanos);

        } catch (Exception e) {
            LOGGER.error("Erro ao processar entrada no grupo: {}", e.getMessage(), e);
        }
    }

    /**
     * Manipula a saída de usuário de um grupo.
     * Recebe mensagens do cliente via WebSocket no destino "/app/group.leaveGroup".
     *
     * @param groupMessage A mensagem contendo informações do usuário que saiu do
     *                     grupo.
     */
    @MessageMapping("/group.leaveGroup")
    public void leaveGroup(@Payload GroupChatMessage groupMessage) {
        long startNanos = System.nanoTime();
        LOGGER.info("👤 Usuário {} saindo do grupo ID: {}", groupMessage.getSender(), groupMessage.getGroupId());

        // Garante que o timestamp seja sempre definido no servidor
        LocalDateTime now = LocalDateTime.now();
        groupMessage.setTimestamp(now);
        groupMessage.setType(GroupChatMessage.MessageType.LEAVE);

        try {
            // Salvar mensagem de sistema
            groupMessageService.saveMessage(
                    groupMessage.getContent(),
                    groupMessage.getSender(),
                    groupMessage.getGroupId(),
                    GroupMessage.MessageType.LEAVE);

            // Enviar para todos os membros do grupo
            String groupTopic = "/topic/group." + groupMessage.getGroupId();
            messagingTemplate.convertAndSend(groupTopic, groupMessage);

            long endNanos = System.nanoTime();
            LOGGER.info("📤 Usuário {} saiu do grupo {} (tempo total: {}ns)",
                    groupMessage.getSender(), groupMessage.getGroupId(), endNanos - startNanos);

        } catch (Exception e) {
            LOGGER.error("Erro ao processar saída do grupo: {}", e.getMessage(), e);
        }
    }
}
